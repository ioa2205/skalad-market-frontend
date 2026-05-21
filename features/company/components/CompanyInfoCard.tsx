import { Box, Briefcase, CalendarDays, MapPin } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Card } from "@/components/ui/card";

export interface CompanyInfoCardProps {
  /** Display string built from `address` (+ region/district names if available). */
  location: string;
  /** Backend doesn't expose industry/founded/products on the profile DTO yet. */
  industry?: string | null;
  founded?: string | number | null;
  productsCount?: number | null;
}

export function CompanyInfoCard({
  location,
  industry,
  founded,
  productsCount,
}: CompanyInfoCardProps) {
  const t = useTranslations("company.profile.info");

  return (
    <Card className="flex flex-col gap-3 p-5">
      <h2 className="text-body font-semibold text-fg">{t("title")}</h2>
      <ul className="flex flex-col gap-3">
        <Row icon={MapPin} label={t("location")} value={location} />
        <Row
          icon={Briefcase}
          label={t("industry")}
          value={industry ?? null}
          fallback={t("industry_pending")}
        />
        <Row
          icon={CalendarDays}
          label={t("founded")}
          value={founded != null ? String(founded) : null}
          fallback={t("founded_pending")}
        />
        <Row
          icon={Box}
          label={t("products")}
          value={productsCount != null ? String(productsCount) : null}
          fallback={t("products_pending")}
        />
      </ul>
    </Card>
  );
}

function Row({
  icon: Icon,
  label,
  value,
  fallback,
}: {
  icon: LucideIcon;
  label: string;
  value: string | null;
  fallback?: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-bg-muted text-fg-muted">
        <Icon aria-hidden="true" className="size-4" />
      </span>
      <div className="flex min-w-0 flex-col">
        <span className="text-caption text-fg-subtle">{label}</span>
        <span className="text-body-sm text-fg">
          {value ?? fallback ?? "—"}
        </span>
      </div>
    </li>
  );
}
