"use client";

import { useEffect, useReducer, useRef, useState } from "react";

import { WsServerEvent } from "@/lib/api/schemas/chat";
import { log } from "@/lib/log";

import { fetchWsToken } from "../api/chat.client";

import {
  ackInflight,
  dequeueIfReady,
  dropMessage,
  enqueue,
  failInflight,
  initialSendQueue,
  type EnqueueInput,
  type SendQueueState,
} from "./sendQueue";
import {
  addOptimistic,
  applyServerEvent,
  dropOptimistic,
  initialThreadState,
  markOptimisticFailed,
  reconnectDelayMs,
  type ChatThreadState,
  type OptimisticMessage,
} from "./socketReducer";

type ConnectionState = "idle" | "connecting" | "open" | "reconnecting" | "closed";

type ThreadAction =
  | { type: "server"; event: WsServerEvent; now: number; currentUserId: number }
  | { type: "addOptimistic"; message: OptimisticMessage }
  | { type: "markFailed"; localId: string }
  | { type: "drop"; localId: string };

function threadReducer(state: ChatThreadState, action: ThreadAction): ChatThreadState {
  switch (action.type) {
    case "server":
      return applyServerEvent(state, action.event, {
        currentUserId: action.currentUserId,
        now: action.now,
      });
    case "addOptimistic":
      return addOptimistic(state, action.message);
    case "markFailed":
      return markOptimisticFailed(state, action.localId);
    case "drop":
      return dropOptimistic(state, action.localId);
    default:
      return state;
  }
}

type QueueAction =
  | { type: "enqueue"; input: EnqueueInput }
  | { type: "tryDequeue"; now: number }
  | { type: "ack"; id: string }
  | { type: "fail"; id: string }
  | { type: "drop"; id: string };

function queueReducer(state: SendQueueState, action: QueueAction): SendQueueState {
  switch (action.type) {
    case "enqueue":
      return enqueue(state, action.input);
    case "tryDequeue":
      return dequeueIfReady(state, action.now).state;
    case "ack":
      return ackInflight(state, action.id);
    case "fail":
      return failInflight(state, action.id);
    case "drop":
      return dropMessage(state, action.id);
    default:
      return state;
  }
}

function wsBaseUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_WS_URL;
  if (!raw) {
    log.warn("chat.ws.url.missing", {
      message: "NEXT_PUBLIC_WS_URL is not set; chat disabled. Set it in .env.local.",
    });
    return null;
  }
  return raw.replace(/\/$/, "");
}

export interface UseChatSocketOptions {
  threadId: number;
  /** Current user id — used to reconcile optimistic bubbles + skip own typing/receipts. */
  currentUserId: number | null;
  /** Override the WebSocket constructor (tests). */
  socketFactory?: (url: string) => WebSocket;
  /** When false, the hook does not open a connection. */
  enabled?: boolean;
  /** Callback for `new_message` events (e.g. invalidate unread badge). */
  onIncomingMessage?: (event: Extract<WsServerEvent, { event: "new_message" }>) => void;
}

export interface UseChatSocketResult {
  state: ChatThreadState;
  queue: SendQueueState;
  connection: ConnectionState;
  /** Push a body+attachment to the send queue. Returns the optimistic local id. */
  send: (input: { body?: string; attachmentKey?: string; attachmentUrl?: string }) => string;
  /** Send a typing event (no queueing). */
  sendTyping: () => void;
  /** Send a read receipt for the given message ids. */
  sendRead: (ids: number[]) => void;
  /** Retry a failed optimistic message; re-queues with the same local id. */
  retry: (localId: string) => void;
  /** Drop a failed optimistic message permanently. */
  cancel: (localId: string) => void;
}

export function useChatSocket(options: UseChatSocketOptions): UseChatSocketResult {
  const { threadId, currentUserId, socketFactory, enabled = true } = options;
  const onIncomingMessage = options.onIncomingMessage;

  const [thread, dispatchThread] = useReducer(threadReducer, threadId, initialThreadState);
  const [queue, dispatchQueue] = useReducer(queueReducer, initialSendQueue);
  const [connection, setConnection] = useState<ConnectionState>("idle");

  const socketRef = useRef<WebSocket | null>(null);
  const queueRef = useRef<SendQueueState>(queue);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const slotTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attemptRef = useRef(0);
  const onIncomingRef = useRef(onIncomingMessage);

  // Keep the latest queue snapshot/cb available to async callbacks.
  queueRef.current = queue;
  onIncomingRef.current = onIncomingMessage;

  /** Open one WS, wired to the latest reducers. */
  useEffect(() => {
    if (!enabled || currentUserId === null) {
      setConnection("idle");
      return undefined;
    }
    const userId: number = currentUserId;

    let cancelled = false;
    setConnection("connecting");

    async function connect() {
      try {
        const baseUrl = wsBaseUrl();
        if (!baseUrl) {
          setConnection("closed");
          return;
        }
        const token = await fetchWsToken();
        if (cancelled) return;
        const url = `${baseUrl}/api/v1/ws/chat?token=${encodeURIComponent(token.ws_token)}`;
        const factory = socketFactory ?? ((u: string) => new WebSocket(u));
        const socket = factory(url);
        socketRef.current = socket;

        socket.addEventListener("open", () => {
          if (cancelled) return;
          attemptRef.current = 0;
          setConnection("open");
          socket.send(JSON.stringify({ event: "subscribe", thread_id: threadId }));
          tryDrain();
        });

        socket.addEventListener("message", (raw) => {
          let parsed: unknown;
          try {
            parsed = JSON.parse(typeof raw.data === "string" ? raw.data : "");
          } catch {
            return;
          }
          const event = WsServerEvent.safeParse(parsed);
          if (!event.success) return;
          dispatchThread({
            type: "server",
            event: event.data,
            now: Date.now(),
            currentUserId: userId,
          });
          if (event.data.event === "new_message") {
            onIncomingRef.current?.(event.data);
          }
          // Server confirmed our send → ack inflight.
          if (
            event.data.event === "new_message" &&
            event.data.message.sender_id === userId &&
            queueRef.current.inflight
          ) {
            dispatchQueue({ type: "ack", id: queueRef.current.inflight.id });
            // Try to drain another item now that the slot freed up.
            setTimeout(() => tryDrain(), 0);
          }
          // Backend says we're rate-limited — fail the inflight, schedule retry.
          if (event.data.event === "error" && event.data.code === "rate_limited") {
            const inflight = queueRef.current.inflight;
            if (inflight) dispatchQueue({ type: "fail", id: inflight.id });
            scheduleSlotDrain();
          }
        });

        socket.addEventListener("close", () => {
          if (cancelled) return;
          if (queueRef.current.inflight) {
            dispatchQueue({ type: "fail", id: queueRef.current.inflight.id });
          }
          setConnection("reconnecting");
          attemptRef.current += 1;
          const delay = reconnectDelayMs(attemptRef.current);
          reconnectTimer.current = setTimeout(() => {
            if (!cancelled) connect();
          }, delay);
        });

        socket.addEventListener("error", () => {
          log.warn("chat.ws.error", { threadId });
        });
      } catch (error) {
        if (cancelled) return;
        log.warn("chat.ws.token.failed", {
          threadId,
          message: error instanceof Error ? error.message : String(error),
        });
        attemptRef.current += 1;
        setConnection("reconnecting");
        const delay = reconnectDelayMs(attemptRef.current);
        reconnectTimer.current = setTimeout(() => {
          if (!cancelled) connect();
        }, delay);
      }
    }

    function tryDrain() {
      const now = Date.now();
      const result = dequeueIfReady(queueRef.current, now);
      if (!result.message) {
        if (queueRef.current.pending.length > 0) scheduleSlotDrain();
        return;
      }
      dispatchQueue({ type: "tryDequeue", now });
      const socket = socketRef.current;
      if (!socket || socket.readyState !== WebSocket.OPEN) {
        // Roll back — couldn't actually send.
        dispatchQueue({ type: "fail", id: result.message.id });
        return;
      }
      const body: Record<string, unknown> = {
        event: "message",
        thread_id: result.message.threadId,
      };
      if (result.message.body) body.body = result.message.body;
      if (result.message.attachmentKey) body.attachment_key = result.message.attachmentKey;
      try {
        socket.send(JSON.stringify(body));
      } catch (error) {
        log.warn("chat.ws.send.failed", {
          threadId,
          message: error instanceof Error ? error.message : String(error),
        });
        dispatchQueue({ type: "fail", id: result.message.id });
        dispatchThread({ type: "markFailed", localId: result.message.id });
      }
    }

    function scheduleSlotDrain() {
      if (slotTimer.current) return;
      slotTimer.current = setTimeout(() => {
        slotTimer.current = null;
        tryDrain();
      }, 1_000);
    }

    void connect();

    return () => {
      cancelled = true;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (slotTimer.current) clearTimeout(slotTimer.current);
      socketRef.current?.close();
      socketRef.current = null;
      setConnection("closed");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId, currentUserId, enabled, socketFactory]);

  // Whenever the queue grows, kick a drain attempt.
  useEffect(() => {
    if (connection !== "open") return;
    if (queue.pending.length === 0 || queue.inflight) return;
    const now = Date.now();
    const result = dequeueIfReady(queue, now);
    if (!result.message) return;
    dispatchQueue({ type: "tryDequeue", now });
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      dispatchQueue({ type: "fail", id: result.message.id });
      return;
    }
    const body: Record<string, unknown> = {
      event: "message",
      thread_id: result.message.threadId,
    };
    if (result.message.body) body.body = result.message.body;
    if (result.message.attachmentKey) body.attachment_key = result.message.attachmentKey;
    try {
      socket.send(JSON.stringify(body));
    } catch {
      dispatchQueue({ type: "fail", id: result.message.id });
      dispatchThread({ type: "markFailed", localId: result.message.id });
    }
  }, [queue, connection]);

  function send(input: { body?: string; attachmentKey?: string; attachmentUrl?: string }): string {
    const localId = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const optimisticBody: OptimisticMessage = {
      local_id: localId,
      thread_id: threadId,
      ...(input.body ? { body: input.body } : {}),
      ...(input.attachmentKey ? { attachment_key: input.attachmentKey } : {}),
      ...(input.attachmentUrl ? { attachment_url: input.attachmentUrl } : {}),
      status: "sending",
      sent_at: new Date().toISOString(),
    };
    dispatchThread({ type: "addOptimistic", message: optimisticBody });
    dispatchQueue({
      type: "enqueue",
      input: {
        id: localId,
        threadId,
        ...(input.body ? { body: input.body } : {}),
        ...(input.attachmentKey ? { attachmentKey: input.attachmentKey } : {}),
        enqueuedAt: Date.now(),
      },
    });
    return localId;
  }

  function sendTyping() {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify({ event: "typing", thread_id: threadId }));
  }

  function sendRead(ids: number[]) {
    if (ids.length === 0) return;
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    socket.send(
      JSON.stringify({ event: "read", thread_id: threadId, message_ids: ids }),
    );
  }

  function retry(localId: string) {
    const failed = thread.optimistic.find((m) => m.local_id === localId);
    if (!failed) return;
    dispatchThread({ type: "drop", localId });
    send({
      ...(failed.body ? { body: failed.body } : {}),
      ...(failed.attachment_key ? { attachmentKey: failed.attachment_key } : {}),
      ...(failed.attachment_url ? { attachmentUrl: failed.attachment_url } : {}),
    });
  }

  function cancel(localId: string) {
    dispatchThread({ type: "drop", localId });
    dispatchQueue({ type: "drop", id: localId });
  }

  return { state: thread, queue, connection, send, sendTyping, sendRead, retry, cancel };
}
