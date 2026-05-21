"use client";

import { AlertTriangle, Building2, Package } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

import { ErrorState } from "@/components/feedback";
import { Skeleton } from "@/components/ui/skeleton";
import type { CompanyResponseDTO } from "@/lib/api/schemas/company";
import type { ProductResponse } from "@/lib/api/schemas/product";
import { cn } from "@/lib/utils/cn";

import {
  useCompaniesQueue,
  useProductsQueue,
  useReportsList,
} from "../api/queries.client";

import { ModeratorStatCard } from "./ModeratorStatCard";

export interface OverviewTabProps {
  /** Lets recent-activity cards jump straight to the matching tab. */
  onJump: (tab: "products" | "companies" | "reports" | "accounts") => void;
}

/**
 * Overview tab: three KPI cards + a recent-activity list.
 *
 * The figma "Latest activity" list shows mixed product/company decisions with
 * timestamps. There is no backend audit-log endpoint, so we surface the head of
 * each moderation queue instead — same read-only row layout as the figma, with
 * a real status badge and a relative timestamp from `createdAt`.
 */
export function OverviewTab({ onJump }: OverviewTabProps) {
  const t = useTranslations("moderator");
  const products = useProductsQueue();
  const companies = useCompaniesQueue();
  const reports = useReportsList({ status: "NEW", size: 1 });

  const allFailed = products.isError && companies.isError && reports.isError;

  if (allFailed) {
    return (
      <ErrorState
        title={t("loadError.title")}
        description={t("loadError.description")}
        correlationIdLabel={t("loadError.correlationLabel")}
      />
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <section
        aria-label={t("title")}
        className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3"
      >
        <KpiCardOrSkeleton
          title={t("overview.kpi.productsPending")}
          loading={products.isPending}
          error={products.isError}
          value={products.data?.length ?? 0}
          icon={Package}
          accent="indigo"
        />
        <KpiCardOrSkeleton
          title={t("overview.kpi.companiesPending")}
          loading={companies.isPending}
          error={companies.isError}
          value={companies.data?.length ?? 0}
          icon={Building2}
          accent="purple"
        />
        <KpiCardOrSkeleton
          title={t("overview.kpi.reportsNew")}
          loading={reports.isPending}
          error={reports.isError}
          value={reports.data?.totalElements ?? 0}
          icon={AlertTriangle}
          accent="purple"
        />
      </section>

      <section className="rounded-mod border border-mod-border bg-bg-elevated px-4 py-5">
        <h2 className="mb-5 text-[22px] font-bold text-chrome-strong">
          {t("overview.recent.title")}
        </h2>
        {products.isPending || companies.isPending ? (
          <div className="flex flex-col gap-5">
            <Skeleton className="h-[108px] w-full rounded-mod" />
            <Skeleton className="h-[108px] w-full rounded-mod" />
          </div>
        ) : (
          <RecentList
            products={products.data ?? []}
            companies={companies.data ?? []}
            onJump={onJump}
          />
        )}
      </section>
    </div>
  );
}

interface KpiCardOrSkeletonProps {
  title: string;
  loading: boolean;
  error: boolean;
  value: number;
  icon: typeof Package;
  accent: "indigo" | "purple";
}

function KpiCardOrSkeleton({
  title,
  loading,
  error,
  value,
  icon,
  accent,
}: KpiCardOrSkeletonProps) {
  if (loading) {
    return <Skeleton className="h-[102px] w-full rounded-mod-lg" />;
  }
  return (
    <ModeratorStatCard
      title={title}
      value={error ? "—" : value}
      icon={icon}
      accent={accent}
    />
  );
}

interface RecentListProps {
  products: ProductResponse[];
  companies: CompanyResponseDTO[];
  onJump: (tab: "products" | "companies" | "reports" | "accounts") => void;
}

function RecentList({ products, companies, onJump }: RecentListProps) {
  const t = useTranslations("moderator");
  const topProducts = products.slice(0, 3);
  const topCompanies = companies.slice(0, 2);
  if (topProducts.length === 0 && topCompanies.length === 0) {
    return (
      <p className="text-body-sm text-fg-muted">
        {t("overview.recent.empty")}
      </p>
    );
  }
  return (
    <ul className="flex flex-col gap-5">
      {topProducts.map((product) => (
        <li key={`product-${product.id}`}>
          <ActivityRow
            kind="product"
            title={product.name}
            subline={formatPriceLine(product)}
            imageUrl={product.images?.[0]?.url ?? null}
            createdAt={product.createdAt}
            onClick={() => onJump("products")}
          />
        </li>
      ))}
      {topCompanies.map((company) => (
        <li key={`company-${company.id}`}>
          <ActivityRow
            kind="company"
            title={company.name}
            subline={company.shortDescription ?? company.address ?? ""}
            imageUrl={company.logoUrl ?? null}
            createdAt={company.createdAt}
            onClick={() => onJump("companies")}
          />
        </li>
      ))}
    </ul>
  );
}

interface ActivityRowProps {
  kind: "product" | "company";
  title: string;
  subline: string;
  imageUrl: string | null;
  createdAt: string;
  onClick: () => void;
}

function ActivityRow({
  kind,
  title,
  subline,
  imageUrl,
  createdAt,
  onClick,
}: ActivityRowProps) {
  const t = useTranslations("moderator.overview.recent");
  const format = useFormatter();
  const created = safeDate(createdAt);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-stretch justify-between gap-3 rounded-mod border border-mod-border bg-bg-elevated px-[18px] py-[21px] text-left",
        "transition-colors duration-fast ease-standard hover:bg-bg-muted/60",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        {kind === "product" ? (
          <span className="flex h-[66px] w-[127px] shrink-0 items-center justify-center overflow-hidden rounded-mod-xs bg-mod-thumb text-mod-meta">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              <Package className="size-5" aria-hidden="true" />
            )}
          </span>
        ) : (
          <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-mod bg-primary-600 text-body-sm font-semibold text-fg-on-primary">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              initials(title)
            )}
          </span>
        )}
        <div className="flex min-w-0 flex-col gap-1">
          <p className="truncate text-body-sm font-bold text-chrome-strong">
            {title}
          </p>
          {subline ? (
            <p className="truncate text-caption text-mod-meta">{subline}</p>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end justify-between">
        <span className="inline-flex h-[22px] items-center rounded-mod-xs bg-mod-badge-amber/20 px-2 text-caption font-medium text-mod-btn-orange">
          {t("statusPending")}
        </span>
        {created ? (
          <span className="text-caption text-mod-meta">
            {format.relativeTime(created)}
          </span>
        ) : null}
      </div>
    </button>
  );
}

function formatPriceLine(product: ProductResponse): string {
  const { price, currency } = product;
  if (price === null || price === undefined) return "";
  const value = typeof price === "number" ? price : Number(price);
  if (!Number.isFinite(value)) return "";
  const amount = value.toLocaleString();
  return currency === "USD" ? `$${amount}` : `${amount} ${currency}`;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function safeDate(iso: string): Date | null {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}
