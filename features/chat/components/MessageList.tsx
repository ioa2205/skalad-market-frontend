"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef } from "react";

import { EmptyState, ErrorState } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { ChatMessageResponse } from "@/lib/api/schemas/chat";

import type { OptimisticMessage } from "../hooks/socketReducer";

import { MessageBubble, type BubbleStatus } from "./MessageBubble";
import { TypingDots } from "./TypingDots";

export interface MessageListProps {
  messages: ChatMessageResponse[];
  optimistic: OptimisticMessage[];
  currentUserId: number;
  /** Highest message id known to be read by the other party (for read ticks). */
  lastReadByOther?: number | undefined;
  isLoading?: boolean;
  isError?: boolean;
  errorCorrelationId?: string | undefined;
  onRetry?: () => void;
  isAnyoneTyping?: boolean;
  onRetryOptimistic?: (localId: string) => void;
  onCancelOptimistic?: (localId: string) => void;
}

export function MessageList({
  messages,
  optimistic,
  currentUserId,
  lastReadByOther,
  isLoading,
  isError,
  errorCorrelationId,
  onRetry,
  isAnyoneTyping,
  onRetryOptimistic,
  onCancelOptimistic,
}: MessageListProps) {
  const t = useTranslations("chats.messages");
  const tCommon = useTranslations("common");
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Stick to the bottom whenever new content arrives.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length, optimistic.length, isAnyoneTyping]);

  const merged = useMemo(() => {
    return [...messages].sort((a, b) => a.id - b.id);
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex h-full flex-col gap-3 overflow-y-auto p-4" ref={containerRef}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={i % 2 === 0 ? "self-start" : "self-end"}
          >
            <Skeleton className="h-12 w-64 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <ErrorState
          title={t("error.title")}
          description={t("error.body")}
          correlationId={errorCorrelationId}
          correlationIdLabel={t("error.correlationLabel")}
          action={
            onRetry ? (
              <Button onClick={onRetry} variant="secondary" size="sm">
                {tCommon("tryAgain")}
              </Button>
            ) : undefined
          }
        />
      </div>
    );
  }

  const isEmpty = merged.length === 0 && optimistic.length === 0;

  return (
    <div
      ref={containerRef}
      className="flex h-full flex-col gap-2 overflow-y-auto px-4 py-4"
      aria-live="polite"
      aria-busy={isLoading ?? false}
    >
      {isEmpty ? (
        <div className="m-auto w-full max-w-md">
          <EmptyState title={t("empty.title")} description={t("empty.body")} />
        </div>
      ) : null}

      {merged.map((message) => {
        const isOwn = message.sender_id === currentUserId;
        const status = bubbleStatus(message, isOwn, lastReadByOther);
        return (
          <MessageBubble
            key={`server-${message.id}`}
            {...(message.body !== undefined ? { body: message.body } : {})}
            {...(message.attachment_url !== undefined
              ? { attachmentUrl: message.attachment_url }
              : {})}
            sentAt={message.sent_at}
            isOwn={isOwn}
            status={status}
          />
        );
      })}

      {optimistic.map((message) => (
        <MessageBubble
          key={`local-${message.local_id}`}
          {...(message.body !== undefined ? { body: message.body } : {})}
          {...(message.attachment_url !== undefined
            ? { attachmentUrl: message.attachment_url }
            : {})}
          sentAt={message.sent_at}
          isOwn
          status={message.status === "failed" ? "failed" : "sending"}
          {...(onRetryOptimistic
            ? { onRetry: () => onRetryOptimistic(message.local_id) }
            : {})}
          {...(onCancelOptimistic
            ? { onCancel: () => onCancelOptimistic(message.local_id) }
            : {})}
        />
      ))}

      {isAnyoneTyping ? <TypingDots /> : null}
    </div>
  );
}

function bubbleStatus(
  message: ChatMessageResponse,
  isOwn: boolean,
  lastReadByOther: number | undefined,
): BubbleStatus {
  if (!isOwn) return "delivered"; // ticks only render on own bubbles
  if (lastReadByOther !== undefined && message.id <= lastReadByOther) return "read";
  if (message.read_at) return "read";
  if (message.delivered_at) return "delivered";
  return "sent";
}
