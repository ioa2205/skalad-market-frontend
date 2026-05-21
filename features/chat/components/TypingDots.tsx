"use client";

import { useTranslations } from "next-intl";

export function TypingDots() {
  const t = useTranslations("chats");
  return (
    <div className="flex items-center gap-2 px-4 py-2 text-caption text-fg-muted">
      <span className="flex items-center gap-0.5" aria-hidden="true">
        <span className="size-1.5 animate-pulse rounded-full bg-fg-muted" />
        <span className="size-1.5 animate-pulse rounded-full bg-fg-muted [animation-delay:120ms]" />
        <span className="size-1.5 animate-pulse rounded-full bg-fg-muted [animation-delay:240ms]" />
      </span>
      <span>{t("typing")}</span>
    </div>
  );
}
