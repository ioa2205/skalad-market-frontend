"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

import type { ChatThreadResponse } from "@/lib/api/schemas/chat";
import { cn } from "@/lib/utils/cn";

import { ChatAvatar } from "./ChatAvatar";

export interface ThreadListItemProps {
  thread: ChatThreadResponse;
  active?: boolean;
}

export function ThreadListItem({ thread, active }: ThreadListItemProps) {
  const t = useTranslations("chats.list");
  const lastMessage = thread.last_message;
  const time = lastMessage ? formatTime(lastMessage.sent_at) : "";
  const snippet =
    lastMessage?.body ??
    (lastMessage?.attachment_url ? "📎" : thread.product?.name ?? "");
  const unread = thread.unread_count > 0;

  return (
    <Link
      href={`/chats/${thread.thread_id}`}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-start gap-3 rounded-md border border-transparent px-3 py-3 transition-colors duration-fast ease-standard",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        active
          ? "border-primary-200 bg-primary-50/60 dark:bg-primary-950/40"
          : "hover:bg-bg-muted/60",
      )}
    >
      <ChatAvatar
        name={thread.other_party.display_name}
        url={thread.other_party.avatar_url ?? undefined}
        size="md"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate text-body-sm font-semibold text-fg">
            {thread.other_party.display_name}
          </span>
          {time ? (
            <span className="shrink-0 text-caption text-fg-muted">{time}</span>
          ) : null}
        </div>
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate text-body-sm text-fg-muted">{snippet}</p>
          {unread ? (
            <span
              aria-label={t("unreadAria", { count: thread.unread_count })}
              className="ml-auto flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary-600 px-1 text-caption font-semibold text-fg-on-primary"
            >
              {thread.unread_count > 99 ? "99+" : thread.unread_count}
            </span>
          ) : null}
        </div>
        {thread.product?.name && lastMessage?.body !== thread.product.name ? (
          <span className="truncate text-caption text-fg-muted">
            {thread.product.name}
          </span>
        ) : null}
      </div>
    </Link>
  );
}

function formatTime(iso: string): string {
  // Backend hands us a naive `LocalDateTime` (no offset). Render H:MM
  // server/client-equivalent so SSR + hydration stay aligned.
  const match = /T(\d{2}):(\d{2})/.exec(iso);
  if (!match) return "";
  return `${match[1]}:${match[2]}`;
}
