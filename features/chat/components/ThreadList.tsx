"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { EmptyState, ErrorState } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { ChatThreadResponse } from "@/lib/api/schemas/chat";

import { ThreadListItem } from "./ThreadListItem";

export interface ThreadListProps {
  threads: ChatThreadResponse[];
  activeThreadId?: number | null;
  isLoading?: boolean;
  isError?: boolean;
  errorCorrelationId?: string | undefined;
  onRetry?: () => void;
}

export function ThreadList({
  threads,
  activeThreadId,
  isLoading = false,
  isError = false,
  errorCorrelationId,
  onRetry,
}: ThreadListProps) {
  const t = useTranslations("chats.list");
  const tCommon = useTranslations("common");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return threads;
    return threads.filter((thread) =>
      thread.other_party.display_name.toLowerCase().includes(q),
    );
  }, [query, threads]);

  return (
    <aside className="flex h-full min-h-0 w-full flex-col gap-3 border-r border-border bg-bg-elevated">
      <div className="flex flex-col gap-3 px-4 pt-4">
        <h2 className="sr-only">{t("searchPlaceholder")}</h2>
        <div className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-muted"
          />
          <Input
            type="search"
            placeholder={t("searchPlaceholder")}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label={t("searchPlaceholder")}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-2 pb-2">
        {isLoading ? <ThreadListSkeleton /> : null}
        {isError ? (
          <div className="p-3">
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
        ) : null}
        {!isLoading && !isError && filtered.length === 0 ? (
          <div className="p-3">
            <EmptyState title={t("empty.title")} description={t("empty.body")} />
          </div>
        ) : null}
        {!isLoading && !isError ? (
          <ul className="flex flex-col gap-1">
            {filtered.map((thread) => (
              <li key={thread.thread_id}>
                <ThreadListItem
                  thread={thread}
                  active={thread.thread_id === activeThreadId}
                />
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </aside>
  );
}

function ThreadListSkeleton() {
  return (
    <div className="flex flex-col gap-2 p-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 px-3 py-3">
          <Skeleton variant="circle" className="size-10" />
          <div className="flex w-full flex-col gap-2">
            <Skeleton variant="text" className="w-2/3" />
            <Skeleton variant="text" className="w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
