"use client";

import { X } from "lucide-react";
import { forwardRef, type ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

export interface FilterChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  onRemove?: () => void;
  removeLabel?: string;
}

export const FilterChip = forwardRef<HTMLButtonElement, FilterChipProps>(
  ({ active, onRemove, removeLabel, className, children, type, ...rest }, ref) => (
    <button
      ref={ref}
      type={type ?? "button"}
      data-state={active ? "active" : "inactive"}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-body-sm font-medium",
        "transition-colors duration-fast ease-standard",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        active
          ? "border-primary-500 bg-primary-50 text-primary-600 dark:bg-primary-950 dark:text-primary-200"
          : "border-border bg-bg-elevated text-fg hover:bg-bg-muted",
        className,
      )}
      {...rest}
    >
      {children}
      {onRemove ? (
        <span
          role="button"
          tabIndex={-1}
          aria-label={removeLabel}
          className="-mr-1 flex size-4 items-center justify-center rounded-full hover:bg-bg-overlay/10"
          onClick={(event) => {
            event.stopPropagation();
            onRemove();
          }}
          onKeyDown={(event) => {
            if (event.key !== "Enter" && event.key !== " ") return;
            event.stopPropagation();
            event.preventDefault();
            onRemove();
          }}
        >
          <X className="size-3" />
        </span>
      ) : null}
    </button>
  ),
);
FilterChip.displayName = "FilterChip";
