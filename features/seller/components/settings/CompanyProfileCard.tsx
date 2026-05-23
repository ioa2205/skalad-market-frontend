import { Building2 } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import type { CompanySlugMapResponse, VerificationStatus } from "@/lib/api/schemas";
import { findRegion } from "@/lib/data/regions";

export interface CompanyProfileCardProps {
  company: CompanySlugMapResponse & {
    shortDescription?: string | null;
    phonePrimary?: string | null;
    website?: string | null;
    verificationStatus?: VerificationStatus;
  };
}

/**
 * Read-only company profile card matching seller_dashboard_5.png. The
 * "Изменить" link slot will become inline-edit popovers in a follow-up PR
 * once the field-level update endpoint pattern is stable; for now they
 * link to the dedicated edit screen.
 */
export function CompanyProfileCard({ company }: CompanyProfileCardProps) {
  const t = useTranslations("seller.dashboard.settings.profile");
  const tRegions = useTranslations("regionsStub");
  const region = findRegion(company.regionId);
  const regionLabel = region ? tRegions(region.i18nKey) : `#${company.regionId}`;
  const status = company.verificationStatus ?? company.status;

  const rows: { label: string; value: string }[] = [
    { label: t("name"), value: company.name },
    {
      label: t("industry"),
      value: company.shortDescription ?? t("industryUnknown"),
    },
    { label: t("phone"), value: company.phonePrimary ?? t("phoneMissing") },
    { label: t("email"), value: company.website ?? t("emailMissing") },
    {
      label: t("website"),
      value: company.website ?? t("websiteMissing"),
    },
    { label: t("city"), value: regionLabel },
  ];

  return (
    <section
      aria-labelledby="seller-company-profile-title"
      className="flex flex-col gap-4 rounded-lg border border-border bg-bg-elevated p-5"
    >
      <header className="flex flex-wrap items-center gap-3">
        <span
          aria-hidden="true"
          className="flex size-12 items-center justify-center rounded-md bg-primary-50 text-primary-600 dark:bg-primary-950 dark:text-primary-100"
        >
          <Building2 className="size-5" />
        </span>
        <div className="flex flex-1 flex-col">
          <h2
            id="seller-company-profile-title"
            className="text-h4 font-semibold text-fg"
          >
            {t("title")}
          </h2>
          <p className="text-caption text-fg-muted">{company.shortDescription ?? ""}</p>
        </div>
        {status === "VERIFIED" ? (
          <Badge variant="success">{t("verified")}</Badge>
        ) : null}
      </header>

      <dl className="flex flex-col divide-y divide-border">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto] items-center gap-3 py-3"
          >
            <dt className="text-body-sm text-fg-muted">{row.label}</dt>
            <dd className="text-body-sm text-fg">{row.value}</dd>
            <Link
              href="/seller/onboarding"
              aria-label={t("editFieldAria", { label: row.label })}
              className="text-body-sm font-medium text-primary-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {t("edit")}
            </Link>
          </div>
        ))}
      </dl>
    </section>
  );
}
