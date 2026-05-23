"use client";

import { ArrowRight, Heart } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { VerifiedBadge } from "@/components/badges";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils/cn";

import { CompanyLogoMark } from "./CompanyLogoMark";

export interface CompanyCardData {
  id: number;
  name: string;
  slug: string;
  logoInitials?: string | undefined;
  logoUrl?: string | null | undefined;
  shortDescription: string | null;
  industry: string | null;
  region: string | null;
  verified: boolean;
  ratingStub: number | null;
  reviewsCountStub: number | null;
  productsCountStub: number | null;
  /** When true, render the small "макет" tooltip on the favorite icon. */
  isStub?: boolean;
}

export interface CompanyCardProps {
  company: CompanyCardData;
  className?: string;
}

export function CompanyCard({ company, className }: CompanyCardProps) {
  const t = useTranslations("company");
  const href = `/companies/${company.slug}`;

  return (
    <Card
      className={cn(
        "group relative flex flex-col gap-4 overflow-hidden p-5 transition-shadow duration-fast ease-standard",
        "hover:shadow-md focus-within:shadow-md",
        className,
      )}
    >
      <Link
        href={href}
        aria-label={t("card.openLabel", { name: company.name })}
        className="absolute inset-0 z-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <CompanyLogoMark
            name={company.name}
            logoUrl={company.logoUrl}
            {...(company.logoInitials !== undefined
              ? { initials: company.logoInitials }
              : {})}
            size="md"
          />
          <div className="flex min-w-0 flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-body font-semibold text-fg">
                {company.name}
              </span>
              {company.verified ? (
                <VerifiedBadge
                  label={t("verified")}
                  ariaLabel={t("verifiedAriaLabel")}
                  className="shrink-0"
                  withIcon
                />
              ) : null}
            </div>
            {company.industry || company.region ? (
              <span className="truncate text-caption text-fg-muted">
                {[company.industry, company.region].filter(Boolean).join(" ")}
              </span>
            ) : null}
          </div>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label={t("card.favoriteAria")}
              aria-disabled="true"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
              className="relative z-10 flex size-8 items-center justify-center rounded-full text-fg-muted hover:bg-bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              <Heart className="size-4" aria-hidden="true" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">{t("card.stubTooltip")}</TooltipContent>
        </Tooltip>
      </div>

      <p className="relative line-clamp-2 text-body-sm text-fg-muted">
        {company.shortDescription ?? t("card.descriptionPending")}
      </p>

      <div className="relative grid grid-cols-3 gap-2 text-center">
        <Metric
          value={company.ratingStub}
          label={t("card.metrics.rating")}
          kind="rating"
        />
        <Metric
          value={company.reviewsCountStub}
          label={t("card.metrics.reviews")}
          kind="integer"
        />
        <Metric
          value={company.productsCountStub}
          label={t("card.metrics.products")}
          kind="integer"
        />
      </div>

      <Link
        href={href}
        className={cn(
          "relative inline-flex w-fit items-center gap-1.5 rounded-md py-1 text-body-sm font-medium text-primary-600",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        )}
      >
        {t("card.cta")}
        <ArrowRight aria-hidden="true" className="size-4" />
      </Link>
    </Card>
  );
}

function Metric({
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
    <div className="flex flex-col items-center justify-center rounded-2xl bg-bg-muted px-2 py-2.5">
      <span className="text-body font-semibold text-fg">{formatted}</span>
      <span className="text-caption text-fg-muted">{label}</span>
    </div>
  );
}
