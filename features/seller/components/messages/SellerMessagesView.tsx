"use client";

import { MessageSquare } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { ThreadList } from "@/features/chat";
import type { ChatThreadResponse } from "@/lib/api/schemas/chat";

export interface SellerMessagesViewProps {
  threads: ChatThreadResponse[];
  error?: { code: string; correlationId?: string | undefined };
}

/**
 * Embedded chat list inside the seller dashboard. Each `ThreadListItem`
 * already links to `/chats/{id}` (the full Phase 7 chat surface), so the
 * seller can browse the inbox here and jump into the conversation pane
 * outside the dashboard tabs. The right pane is a "select a thread"
 * empty state — building a true two-pane chat inside the dashboard is
 * out of scope for Phase 8 (build-plan §5 "Reuses Phase 7").
 */
export function SellerMessagesView({ threads, error }: SellerMessagesViewProps) {
  const t = useTranslations("seller.dashboard.messages");

  return (
    <section className="grid h-[600px] grid-cols-1 overflow-hidden rounded-lg border border-border bg-bg-elevated md:grid-cols-[320px_minmax(0,1fr)]">
      <div className="flex min-h-0 flex-col">
        <ThreadList
          threads={threads}
          activeThreadId={null}
          isError={!!error}
          {...(error?.correlationId
            ? { errorCorrelationId: error.correlationId }
            : {})}
        />
      </div>
      <div className="hidden min-h-0 flex-col items-center justify-center gap-3 bg-bg p-6 text-center md:flex">
        <span
          aria-hidden="true"
          className="flex size-12 items-center justify-center rounded-full bg-bg-muted text-fg-muted"
        >
          <MessageSquare className="size-6" />
        </span>
        <h3 className="text-h4 font-semibold text-fg">{t("placeholderTitle")}</h3>
        <p className="max-w-sm text-body-sm text-fg-muted">
          {t("placeholderDescription")}
        </p>
        <Button asChild variant="secondary">
          <Link href="/chats">{t("openFullChats")}</Link>
        </Button>
      </div>
    </section>
  );
}
