"use client";

import { AlertCircle, Check, CheckCheck, Loader2, RotateCcw, X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export type BubbleStatus =
  | "sending"
  | "sent"
  | "delivered"
  | "read"
  | "failed";

export interface MessageBubbleProps {
  body?: string | null;
  attachmentUrl?: string | null;
  sentAt: string;
  isOwn: boolean;
  status: BubbleStatus;
  onRetry?: () => void;
  onCancel?: () => void;
}

export function MessageBubble({
  body,
  attachmentUrl,
  sentAt,
  isOwn,
  status,
  onRetry,
  onCancel,
}: MessageBubbleProps) {
  const t = useTranslations("chats.messages");
  const time = formatTime(sentAt);

  const bubble = (
    <div
      className={cn(
        "max-w-[80%] rounded-lg px-3 py-2 text-body-sm shadow-xs",
        isOwn
          ? "rounded-br-sm bg-primary-600 text-fg-on-primary"
          : "rounded-bl-sm bg-bg-elevated text-fg ring-1 ring-inset ring-border",
        status === "failed" && "bg-danger-soft text-danger-soft-foreground ring-danger/40",
      )}
    >
      {attachmentUrl ? (
        <img
          src={attachmentUrl}
          alt={t("attachmentLabel")}
          className="mb-1 max-h-72 w-full rounded-md object-cover"
        />
      ) : null}
      {body ? <p className="whitespace-pre-wrap break-words">{body}</p> : null}
      <div
        className={cn(
          "mt-1 flex items-center justify-end gap-1 text-caption",
          isOwn && status !== "failed"
            ? "text-fg-on-primary/80"
            : status === "failed"
              ? "text-danger-soft-foreground/80"
              : "text-fg-muted",
        )}
      >
        <span>{time}</span>
        {isOwn ? <BubbleStatusIcon status={status} translate={t} /> : null}
      </div>
    </div>
  );

  if (status === "failed" && (onRetry || onCancel)) {
    return (
      <div
        className={cn("flex flex-col gap-1", isOwn ? "items-end" : "items-start")}
      >
        {bubble}
        <div className="flex items-center gap-2 text-caption text-danger">
          {onRetry ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRetry}
              className="h-7 gap-1 px-2 text-danger hover:bg-danger-soft"
            >
              <RotateCcw className="size-3" />
              {t("retry")}
            </Button>
          ) : null}
          {onCancel ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              aria-label={t("status.failed")}
              className="h-7 gap-1 px-2 text-fg-muted hover:bg-bg-muted"
            >
              <X className="size-3" />
            </Button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
      {bubble}
    </div>
  );
}

interface IconProps {
  status: BubbleStatus;
  translate: ReturnType<typeof useTranslations>;
}

function BubbleStatusIcon({ status, translate }: IconProps): ReactNode {
  switch (status) {
    case "sending":
      return (
        <Loader2 aria-label={translate("status.sending")} className="size-3 animate-spin" />
      );
    case "sent":
      return <Check aria-label={translate("status.sent")} className="size-3" />;
    case "delivered":
      return (
        <CheckCheck aria-label={translate("status.delivered")} className="size-3" />
      );
    case "read":
      return (
        <CheckCheck
          aria-label={translate("status.read")}
          className="size-3 text-info"
        />
      );
    case "failed":
      return (
        <AlertCircle aria-label={translate("status.failed")} className="size-3" />
      );
    default:
      return null;
  }
}

function formatTime(iso: string): string {
  const match = /T(\d{2}):(\d{2})/.exec(iso);
  if (!match) return "";
  return `${match[1]}:${match[2]}`;
}
