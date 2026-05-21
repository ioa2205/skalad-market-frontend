"use client";

import { ArrowLeft, MoreHorizontal, Phone } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/sonner";
import { ReportModal } from "@/features/report";
import type { ChatThreadResponse } from "@/lib/api/schemas/chat";

import { useHideThread } from "../api/chat.client";

import { ChatAvatar } from "./ChatAvatar";

export interface MessagePaneHeaderProps {
  thread: ChatThreadResponse;
  /** Optional phone number (no API surfaces this yet — caller passes when known). */
  phone?: string | undefined;
}

export function MessagePaneHeader({ thread, phone }: MessagePaneHeaderProps) {
  const t = useTranslations("chats.thread");
  const tHeader = useTranslations("chats.header");
  const tReport = useTranslations("report");
  const hide = useHideThread();
  const [reportOpen, setReportOpen] = useState(false);

  const handleCallStub = () => {
    toast.message(t("callStubTitle"), { description: t("callStubBody") });
  };

  const handleHide = () => {
    hide.mutate(thread.thread_id, {
      onSuccess: () => toast.success(t("hideSuccess")),
      onError: () => toast.error(t("hideError")),
    });
  };

  return (
    <header className="flex items-center gap-3 border-b border-border bg-bg-elevated px-4 py-3">
      <Button
        asChild
        variant="ghost"
        size="icon-sm"
        aria-label={tHeader("backToList")}
        className="md:hidden"
      >
        <Link href="/chats">
          <ArrowLeft />
        </Link>
      </Button>
      <ChatAvatar
        name={thread.other_party.display_name}
        url={thread.other_party.avatar_url ?? undefined}
        size="md"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-body font-semibold text-fg">
          {thread.other_party.display_name}
        </span>
        <span className="flex items-center gap-1.5 text-caption text-fg-muted">
          <span aria-hidden="true" className="size-2 rounded-full bg-fg-muted/50" />
          {t("presence.stub")}
        </span>
      </div>
      {phone ? (
        <Button asChild variant="ghost" size="icon-sm" aria-label={t("callAria")}>
          <a href={`tel:${phone.replace(/\s+/g, "")}`}>
            <Phone />
          </a>
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={t("callAria")}
          onClick={handleCallStub}
        >
          <Phone />
        </Button>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={t("actionsLabel")}>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleHide} disabled={hide.isPending}>
            {t("hide")}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setReportOpen(true)}>
            {tReport("trigger")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {reportOpen ? (
        <ReportModal
          open={reportOpen}
          onOpenChange={setReportOpen}
          targetType="CHAT"
          targetId={thread.thread_id}
          targetLabel={thread.other_party.display_name}
        />
      ) : null}
    </header>
  );
}
