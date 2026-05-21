import { useTranslations } from "next-intl";

import { Card } from "@/components/ui/card";

export interface CompanyAboutCardStats {
  rating?: number | null;
  reviewsCount?: number | null;
  productsCount?: number | null;
}

export interface CompanyAboutCardProps {
  description?: string | null | undefined;
  stats?: CompanyAboutCardStats;
}

export function CompanyAboutCard({
  description,
  stats,
}: CompanyAboutCardProps) {
  const t = useTranslations("company.profile");

  return (
    <Card className="flex flex-col gap-4 p-5">
      <h2 className="text-body font-semibold text-fg">{t("about.title")}</h2>
      <p className="text-body-sm text-fg-muted">
        {description?.trim() ? description : t("about.fallback")}
      </p>
      <div className="grid grid-cols-3 gap-2 rounded-lg bg-bg-muted p-2">
        <Stat
          value={stats?.rating ?? null}
          label={t("stats.rating")}
          kind="rating"
        />
        <Stat
          value={stats?.reviewsCount ?? null}
          label={t("stats.reviews")}
          kind="integer"
        />
        <Stat
          value={stats?.productsCount ?? null}
          label={t("stats.products")}
          kind="rating"
        />
      </div>
    </Card>
  );
}

function Stat({
  value,
  label,
  kind,
}: {
  value: number | null;
  label: string;
  kind: "integer" | "rating";
}) {
  const formatted =
    value === null
      ? "—"
      : kind === "rating"
        ? value.toFixed(1)
        : String(Math.trunc(value));
  return (
    <div className="flex flex-col items-center justify-center gap-0.5 rounded-md border border-border bg-bg-elevated px-2 py-2 text-center shadow-xs">
      <span className="text-h4 font-bold text-fg">{formatted}</span>
      <span className="text-caption text-fg-muted">{label}</span>
    </div>
  );
}
