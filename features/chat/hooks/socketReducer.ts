/**
 * Pure state for one chat thread's live view. The hook driving the WebSocket
 * is thin and delegates every mutation here so behavior is testable without a
 * real socket.
 */

import type {
  ChatMessageResponse,
  WsErrorCode,
  WsServerEvent,
} from "@/lib/api/schemas/chat";

export interface OptimisticMessage {
  local_id: string;
  thread_id: number;
  body?: string;
  attachment_key?: string;
  attachment_url?: string;
  status: "sending" | "failed";
  /** Display timestamp before the server stamps the real one. */
  sent_at: string;
}

export interface ChatThreadState {
  threadId: number;
  /** Confirmed messages (sorted ascending by id). */
  messages: ChatMessageResponse[];
  /** Optimistic bubbles awaiting server `new_message`. */
  optimistic: OptimisticMessage[];
  /** Map of other-user-id → typing-event timestamp; stale entries pruned by `pruneTyping`. */
  typingByUserId: Record<number, number>;
  /** Last message id known to be read by the other party (for delivery ticks). */
  lastReadByOther?: number;
  lastError?: { code: WsErrorCode; message: string };
}

export const TYPING_TTL_MS = 4_000;

export function initialThreadState(threadId: number): ChatThreadState {
  return {
    threadId,
    messages: [],
    optimistic: [],
    typingByUserId: {},
  };
}

function sortById(messages: ChatMessageResponse[]): ChatMessageResponse[] {
  return [...messages].sort((a, b) => a.id - b.id);
}

/** Append-or-replace by id, preserving ascending order. */
export function upsertMessages(
  state: ChatThreadState,
  incoming: ChatMessageResponse[],
): ChatThreadState {
  if (incoming.length === 0) return state;
  const map = new Map(state.messages.map((m) => [m.id, m] as const));
  for (const m of incoming) map.set(m.id, m);
  return { ...state, messages: sortById(Array.from(map.values())) };
}

export function addOptimistic(
  state: ChatThreadState,
  message: OptimisticMessage,
): ChatThreadState {
  return { ...state, optimistic: [...state.optimistic, message] };
}

export function markOptimisticFailed(
  state: ChatThreadState,
  localId: string,
): ChatThreadState {
  return {
    ...state,
    optimistic: state.optimistic.map((m) =>
      m.local_id === localId ? { ...m, status: "failed" } : m,
    ),
  };
}

export function dropOptimistic(
  state: ChatThreadState,
  localId: string,
): ChatThreadState {
  return {
    ...state,
    optimistic: state.optimistic.filter((m) => m.local_id !== localId),
  };
}

/**
 * When a server `new_message` for our own user arrives, best-effort drop one
 * matching optimistic bubble (same body + attachment_key in the same thread).
 * The backend protocol does not carry a client-id echo, so the heuristic
 * matches the oldest optimistic with identical content.
 */
function reconcileOwnMessage(
  state: ChatThreadState,
  message: ChatMessageResponse,
  currentUserId: number,
): ChatThreadState {
  if (message.sender_id !== currentUserId) return state;
  const idx = state.optimistic.findIndex(
    (o) =>
      o.thread_id === message.thread_id &&
      (o.body ?? null) === (message.body ?? null) &&
      (o.attachment_key ?? null) === (message.attachment_key ?? null),
  );
  if (idx === -1) return state;
  const next = [...state.optimistic];
  next.splice(idx, 1);
  return { ...state, optimistic: next };
}

export interface ApplyEventOptions {
  /** Current user id — used to reconcile optimistic bubbles for own messages. */
  currentUserId: number;
  /** Wall-clock timestamp; tests pass this in. */
  now: number;
}

export function applyServerEvent(
  state: ChatThreadState,
  event: WsServerEvent,
  options: ApplyEventOptions,
): ChatThreadState {
  if ("thread_id" in event && event.thread_id !== state.threadId) return state;

  switch (event.event) {
    case "new_message": {
      const reconciled = reconcileOwnMessage(state, event.message, options.currentUserId);
      return upsertMessages(reconciled, [event.message]);
    }
    case "read_receipt": {
      if (event.read_by === options.currentUserId) return state;
      const max = event.message_ids.reduce((acc, id) => Math.max(acc, id), 0);
      const next = Math.max(state.lastReadByOther ?? 0, max);
      return { ...state, lastReadByOther: next };
    }
    case "typing": {
      if (event.user_id === options.currentUserId) return state;
      return {
        ...state,
        typingByUserId: { ...state.typingByUserId, [event.user_id]: options.now },
      };
    }
    case "error": {
      return { ...state, lastError: { code: event.code, message: event.message } };
    }
    default: {
      return state;
    }
  }
}

export function pruneTyping(state: ChatThreadState, now: number): ChatThreadState {
  const next: Record<number, number> = {};
  let mutated = false;
  for (const [userId, ts] of Object.entries(state.typingByUserId)) {
    if (now - ts < TYPING_TTL_MS) {
      next[Number(userId)] = ts;
    } else {
      mutated = true;
    }
  }
  return mutated ? { ...state, typingByUserId: next } : state;
}

export function isAnyoneTyping(state: ChatThreadState, now: number): boolean {
  for (const ts of Object.values(state.typingByUserId)) {
    if (now - ts < TYPING_TTL_MS) return true;
  }
  return false;
}

/** Backoff schedule for WebSocket reconnects (capped at 30 s). */
export function reconnectDelayMs(attempt: number): number {
  const base = Math.min(30_000, 500 * 2 ** attempt);
  // ±20 % jitter so reconnect storms spread across clients.
  const jitter = base * 0.2 * (Math.random() * 2 - 1);
  const value = Math.round(base + jitter);
  return Math.min(30_000, Math.max(250, value));
}
