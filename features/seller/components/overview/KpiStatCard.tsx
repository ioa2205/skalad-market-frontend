import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils/cn";

export type KpiAccent =
  | "primary"
  | "success"
  | "warning"
  | "info"
  | "indigo"
  | "purple";

export interface KpiStatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  accent?: KpiAccent;
  /** Optional sub-line (e.g. "+3,4% за месяц" — currently unused, hooks for later). */
  trendLabel?: string;
}

const ACCENT_BG: Record<KpiAccent, string> = {
  primary: "bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-100",
  success: "bg-success-soft text-success-soft-foreground",
  warning: "bg-warning-soft text-warning-soft-foreground",
  info: "bg-info-soft text-info-soft-foreground",
  indigo: "bg-kpi-indigo text-white",
  purple: "bg-kpi-purple text-white",
};

export function KpiStatCard({
  title,
  value,
  icon: Icon,
  accent = "primary",
  trendLabel,
}: KpiStatCardProps) {
  return (
    <article className="flex h-[102px] items-center justify-between gap-4 rounded-lg border border-chrome-border bg-bg-muted p-5">
      <div className="flex flex-col gap-1">
        <p className="text-body-sm text-fg-muted">{title}</p>
        <p className="text-h2 font-bold text-fg" data-testid="kpi-value">
          {value}
        </p>
        {trendLabel ? (
          <p className="text-caption text-fg-muted">{trendLabel}</p>
        ) : null}
      </div>
      <span
        aria-hidden="true"
        className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-full",
          ACCENT_BG[accent],
        )}
      >
        <Icon className="size-6" />
      </span>
    </article>
  );
}
