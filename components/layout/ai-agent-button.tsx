"use client";

import { MessageSquare } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils/cn";
import { useAiAgentStore } from "@/stores/ai-agent";

/**
 * Top-bar AI-agent input pill. Click or ⌘+K opens the global drawer
 * (mounted by `<AiAgentMount />` in the (app) layout). The feature itself
 * is still a "coming soon" stub — there is no AI backend yet.
 *
 * Layout mirrors Figma `header` — 275 × 40 rounded-2xl input with the
 * chrome.input-border token, 12 px gap between dialog icon, label, and
 * the ⌘K shortcut pill.
 */
export function AiAgentButton() {
  const t = useTranslations("aiAgent.button");
  const setOpen = useAiAgentStore((s) => s.setOpen);

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label={t("ariaLabel")}
      aria-haspopup="dialog"
      className={cn(
        "inline-flex h-10 w-[275px] items-center gap-3 rounded-full border border-chrome-input-border bg-bg-elevated px-4",
        "text-left text-[14px] font-medium leading-[18px] text-chrome-strong",
        "transition-colors duration-fast ease-standard hover:bg-bg-muted",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
      )}
    >
      <MessageSquare
        className="size-5 shrink-0 text-chrome-strong"
        strokeWidth={1.5}
        aria-hidden="true"
      />
      <span className="flex-1 truncate">{t("label")}</span>
      <kbd
        aria-hidden="true"
        className={cn(
          "inline-flex h-[22px] items-center gap-2 rounded-full bg-chrome-shortcut px-3",
          "font-mono text-[14px] leading-[22px] tracking-[-0.1px] text-chrome-strong",
        )}
      >
        <span className="inline-block size-4" aria-hidden="true">
          {/* Command icon — Lucide ships it as `Command`, but it's heavier
              than Figma's outline. Inline a Figma-matching glyph. */}
          <svg viewBox="0 0 16 16" fill="none" className="size-4">
            <path
              d="M5.333 5.333H10.667V10.667H5.333V5.333Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10.667 10.667H13.333V13.333H10.667V10.667Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2.667 10.667H5.333V13.333H2.667V10.667Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10.667 2.667H13.333V5.333H10.667V2.667Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2.667 2.667H5.333V5.333H2.667V2.667Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        K
      </kbd>
    </button>
  );
}
