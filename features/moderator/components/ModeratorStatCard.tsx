import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils/cn";

export type ModeratorStatAccent = "indigo" | "purple";

export interface ModeratorStatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  accent: ModeratorStatAccent;
}

/**
 * KPI card for the moderator Overview tab — Figma-exact (moderator_dashboard_1).
 *
 * Separate from the seller `KpiStatCard` on purpose: the moderator frame uses a
 * larger 18px title, a 15.5px radius, and a solid-fill icon circle, so reusing
 * the seller card would mean either regressing the seller dashboard or piling
 * variant props onto a shared component.
 */
const ACCENT_BG: Record<ModeratorStatAccent, string> = {
  indigo: "bg-kpi-indigo",
  purple: "bg-kpi-purple",
};

export function ModeratorStatCard({
  title,
  value,
  icon: Icon,
  accent,
}: ModeratorStatCardProps) {
  return (
    <article className="flex h-[102px] items-center justify-between gap-4 rounded-mod-lg border border-mod-border bg-mod-card px-5">
      <div className="flex min-w-0 flex-col gap-1.5">
        <p className="truncate text-[18px] leading-none text-mod-meta-2">
          {title}
        </p>
        <p className="text-h2 font-bold text-fg" data-testid="kpi-value">
          {value}
        </p>
      </div>
      <span
        aria-hidden="true"
        className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-full text-white",
          ACCENT_BG[accent],
        )}
      >
        <Icon className="size-6" />
      </span>
    </article>
  );
}
