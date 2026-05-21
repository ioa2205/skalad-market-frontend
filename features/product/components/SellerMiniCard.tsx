import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

import { VerifiedBadge } from "@/components/badges";
import { MinioImage } from "@/components/media";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

export interface SellerMiniCardCompany {
  id: number;
  name: string;
  slug: string;
  logoPath?: string | null;
  /** Optional short tagline ("Металлургия Ташкент"). */
  shortDescription?: string | null;
  verified?: boolean;
}

export interface SellerMiniCardProps {
  company: SellerMiniCardCompany;
  /** Stats are stubbed until backend exposes them. Pass null to hide a column. */
  stats?: {
    rating?: number | null;
    reviewsCount?: number | null;
    productsCount?: number | null;
  };
  className?: string;
}

export function SellerMiniCard({
  company,
  stats,
  className,
}: SellerMiniCardProps) {
  const t = useTranslations("productDetail.seller");
  const tCard = useTranslations("productCard");

  const initials = company.name.slice(0, 2).toUpperCase();
  const profileHref = `/companies/${company.slug}`;

  return (
    <Card className={cn("flex flex-col gap-4 rounded-xl p-[18px]", className)}>
      <h3 className="text-body font-semibold text-fg">{t("heading")}</h3>

      <div className="flex items-start gap-3">
        <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-primary-600 text-fg-on-primary">
          {company.logoPath ? (
            <MinioImage
              src={company.logoPath}
              alt=""
              fill
              sizes="48px"
              className="object-cover"
            />
          ) : (
            <span
              aria-hidden="true"
              className="flex size-full items-center justify-center text-body font-semibold"
            >
              {initials}
            </span>
          )}
        </div>
        <div className="flex min-w-0 flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-body font-semibold text-fg">
              {company.name}
            </span>
            {company.verified ? (
              <VerifiedBadge
                label={tCard("verified")}
                ariaLabel={tCard("verifiedLabel")}
              />
            ) : null}
          </div>
          {company.shortDescription ? (
            <span className="truncate text-caption text-fg-muted">
              {company.shortDescription}
            </span>
          ) : null}
        </div>
      </div>

      {stats ? (
        <div className="grid grid-cols-3 gap-[12px]">
          <StatChip
            value={stats.rating ?? null}
            label={t("rating")}
            kind="decimal"
          />
          <StatChip
            value={stats.reviewsCount ?? null}
            label={t("reviews")}
            kind="integer"
          />
          <StatChip
            value={stats.productsCount ?? null}
            label={t("products")}
            kind="integer"
          />
        </div>
      ) : null}

      <Link
        href={profileHref}
        className={cn(
          "inline-flex items-center justify-center gap-1.5 rounded-md py-2 text-body-sm font-medium text-primary-600 hover:bg-bg-muted",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        )}
      >
        {t("gotoProfile")}
        <ArrowRight aria-hidden="true" className="size-4" />
      </Link>
    </Card>
  );
}

function StatChip({
  value,
  label,
  kind,
}: {
  value: number | null;
  label: string;
  kind: "decimal" | "integer";
}) {
  const formatted =
    value === null
      ? "—"
      : kind === "decimal"
        ? value.toFixed(1)
        : String(Math.trunc(value));
  return (
    <div className="flex h-[54px] flex-col items-center justify-center rounded-2xl bg-bg-muted">
      <span className="text-body-sm font-semibold text-fg">{formatted}</span>
      <span className="text-[11px] leading-tight text-fg-muted">{label}</span>
    </div>
  );
}
