import { Check } from "lucide-react";

import { cn } from "@/lib/utils/cn";

export interface OnboardingProgressProps {
  steps: { key: string; label: string }[];
  /** Zero-based index of the active step. */
  activeIndex: number;
}

export function OnboardingProgress({
  steps,
  activeIndex,
}: OnboardingProgressProps) {
  return (
    <ol className="flex items-center gap-2" aria-label="Шаги мастера">
      {steps.map((step, index) => {
        const status =
          index < activeIndex ? "done" : index === activeIndex ? "active" : "pending";
        return (
          <li
            key={step.key}
            aria-current={status === "active" ? "step" : undefined}
            className="flex flex-1 items-center gap-2"
          >
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full text-caption font-semibold",
                status === "done" &&
                  "bg-primary-600 text-fg-on-primary",
                status === "active" &&
                  "bg-primary-50 text-primary-600 ring-2 ring-primary-600 dark:bg-primary-950 dark:text-primary-100",
                status === "pending" &&
                  "bg-bg-muted text-fg-muted",
              )}
            >
              {status === "done" ? (
                <Check aria-hidden="true" className="size-4" />
              ) : (
                index + 1
              )}
            </span>
            <span
              className={cn(
                "text-caption",
                status === "active" ? "text-fg" : "text-fg-muted",
              )}
            >
              {step.label}
            </span>
            {index < steps.length - 1 ? (
              <span
                aria-hidden="true"
                className={cn(
                  "ml-1 hidden h-px flex-1 sm:block",
                  status === "done" ? "bg-primary-600" : "bg-border",
                )}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
