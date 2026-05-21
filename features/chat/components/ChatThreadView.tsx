"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { toast } from "@/components/ui/sonner";
import type { ChatMessageResponse, ChatThreadResponse } from "@/lib/api/schemas/chat";

import { chatKeys } from "../api/queryKeys";
import { useChatSocket } from "../hooks/useChatSocket";
import {
  isAnyoneTyping as anyoneTypingNow,
} from "../hooks/socketReducer";
import { useMessages } from "../api/chat.client";

import { MessageComposer } from "./MessageComposer";
import { MessageList } from "./MessageList";
import { MessagePaneHeader } from "./MessagePaneHeader";

export interface ChatThreadViewProps {
  thread: ChatThreadResponse;
  initialMessages: ChatMessageResponse[];
  initialError?: { code: string; correlationId?: string | undefined } | undefined;
  /** Current user id (decoded from session). Required for read receipts + own bubbles. */
  currentUserId: number;
  /** When true (seller messages tab), composer + listeners still work — only entry-point is gated. */
  /** Optional phone number for the call icon. */
  phone?: string | undefined;
}

const PER_PAGE = 30;

export function ChatThreadView({
  thread,
  initialMessages,
  initialError,
  currentUserId,
  phone,
}: ChatThreadViewProps) {
  const t = useTranslations("chats.composer");
  const queryClient = useQueryClient();

  const params = { threadId: thread.thread_id, page: 1, perPage: PER_PAGE };
  const messagesQuery = useMessages(params);

  // Seed cache with the SSR payload so the loading state is skipped on first paint.
  useEffect(() => {
    if (!initialError && initialMessages.length > 0) {
      queryClient.setQueryData(chatKeys.messages(params), {
        items: initialMessages,
        meta: {
          total: initialMessages.length,
          page: 1,
          perPage: PER_PAGE,
          totalPages: 1,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thread.thread_id]);

  const messages = messagesQuery.data?.items ?? initialMessages;

  const socket = useChatSocket({
    threadId: thread.thread_id,
    currentUserId,
    onIncomingMessage: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.unread() });
    },
  });

  // Merge SSR messages + live messages (live wins by id).
  const merged = useMemo(() => {
    const map = new Map<number, ChatMessageResponse>();
    for (const m of messages) map.set(m.id, m);
    for (const m of socket.state.messages) map.set(m.id, m);
    return Array.from(map.values()).sort((a, b) => a.id - b.id);
  }, [messages, socket.state.messages]);

  // Send `read` for any unread incoming messages on mount and when new ones arrive.
  const lastReadSentRef = useRef(0);
  useEffect(() => {
    const unreadIds = merged
      .filter((m) => m.sender_id !== currentUserId && !m.read_at && m.id > lastReadSentRef.current)
      .map((m) => m.id);
    if (unreadIds.length === 0) return;
    socket.sendRead(unreadIds);
    lastReadSentRef.current = unreadIds[unreadIds.length - 1] ?? lastReadSentRef.current;
  }, [merged, currentUserId, socket]);

  // Surface WS error events as toasts.
  useEffect(() => {
    if (!socket.state.lastError) return;
    if (socket.state.lastError.code === "rate_limited") {
      toast.error(t("rateLimitedToast"));
    } else {
      toast.error(t("errorToast"), {
        description: socket.state.lastError.message,
      });
    }
  }, [socket.state.lastError, t]);

  const isComposerDisabled =
    socket.connection !== "open" && socket.connection !== "reconnecting";

  return (
    <section className="flex h-full min-h-0 flex-col">
      <MessagePaneHeader thread={thread} phone={phone} />
      <div className="flex min-h-0 flex-1 flex-col bg-bg">
        <MessageList
          messages={merged}
          optimistic={socket.state.optimistic}
          currentUserId={currentUserId}
          {...(socket.state.lastReadByOther !== undefined
            ? { lastReadByOther: socket.state.lastReadByOther }
            : {})}
          isLoading={messagesQuery.isLoading && messages.length === 0}
          isError={!!initialError && messages.length === 0}
          {...(initialError?.correlationId
            ? { errorCorrelationId: initialError.correlationId }
            : {})}
          onRetry={() => messagesQuery.refetch()}
          isAnyoneTyping={anyoneTypingNow(socket.state, Date.now())}
          onRetryOptimistic={socket.retry}
          onCancelOptimistic={socket.cancel}
        />
      </div>
      <MessageComposer
        threadId={thread.thread_id}
        disabled={isComposerDisabled}
        rateLimited={socket.queue.pending.length >= 5 && !!socket.queue.inflight}
        onSend={(input) => socket.send(input)}
        onTyping={socket.sendTyping}
      />
    </section>
  );
}
