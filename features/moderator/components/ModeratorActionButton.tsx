"use client";

import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export type ModeratorActionTone = "green" | "red" | "orange" | "gray";

export interface ModeratorActionButtonProps {
  tone: ModeratorActionTone;
  children: ReactNode;
  onClick?: () => void;
  pending?: boolean;
  disabled?: boolean;
  /** Width utility — Figma button widths differ per action (e.g. `w-[121px]`). */
  className?: string;
  "aria-label"?: string;
}

/**
 * Solid action button used across the moderator queues — Figma-exact: 39px
 * tall, 11.5px radius, white label + icon. The seller/ui `Button` is pill-
 * shaped with the app's semantic palette, so the moderator frame (which uses
 * its own flat green/red/orange/gray fills and a fixed radius) gets a dedicated
 * button instead of piling overrides onto the shared one.
 */
const TONE: Record<ModeratorActionTone, string> = {
  green: "bg-mod-btn-green hover:bg-mod-btn-green/90",
  red: "bg-mod-btn-red hover:bg-mod-btn-red/90",
  orange: "bg-mod-btn-orange hover:bg-mod-btn-orange/90",
  gray: "bg-mod-btn-gray hover:bg-mod-btn-gray/90",
};

export function ModeratorActionButton({
  tone,
  children,
  onClick,
  pending = false,
  disabled = false,
  className,
  "aria-label": ariaLabel,
}: ModeratorActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || pending}
      aria-busy={pending || undefined}
      aria-label={ariaLabel}
      className={cn(
        "inline-flex h-[39px] shrink-0 items-center justify-center gap-1.5 rounded-mod px-3",
        "text-body-sm font-medium text-white",
        "transition-colors duration-fast ease-standard",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        "disabled:pointer-events-none disabled:opacity-60",
        "[&_svg]:size-4 [&_svg]:shrink-0",
        TONE[tone],
        className,
      )}
    >
      {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}
