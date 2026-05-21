"use client";

import { Building2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";

import { EmptyState } from "@/components/feedback";
import type { Locale } from "@/lib/i18n/config";

import {
  filterStubCompanies,
  type DirectoryStubEntry,
} from "../api/fixtures";
import { useCompanyDirectoryParams } from "../hooks/useCompanyDirectoryParams";

import { CompanyCard } from "./CompanyCard";
import { CompanyDirectoryMapStub } from "./CompanyDirectoryMapStub";

export interface CompanyDirectoryViewProps {
  /** Inject fixture entries; tests pass a deterministic array. */
  entries: DirectoryStubEntry[];
}

export function CompanyDirectoryView({
  entries,
}: CompanyDirectoryViewProps) {
  const t = useTranslations("company.directory");
  const locale = useLocale() as Locale;
  const [params] = useCompanyDirectoryParams();

  const filtered = useMemo(() => {
    if (!params.q.trim()) return entries;
    return filterStubCompanies(params.q).filter((stub) =>
      entries.some((e) => e.id === stub.id),
    );
  }, [entries, params.q]);

  if (params.view === "map") {
    return <CompanyDirectoryMapStub />;
  }

  return (
    <div className="flex flex-col gap-4">
      {filtered.length === 0 ? (
        <EmptyState
          icon={Building2}
          title={t("empty.title")}
          description={t("empty.description")}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((entry) => (
            <CompanyCard
              key={entry.id}
              company={{
                id: entry.id,
                name: entry.name,
                slug: entry.slug,
                logoInitials: entry.logoInitials,
                logoUrl: null,
                shortDescription: entry.shortDescription[locale],
                industry: entry.industry[locale],
                region: entry.region[locale],
                verified: entry.verified,
                ratingStub: entry.ratingStub,
                reviewsCountStub: entry.reviewsCountStub,
                productsCountStub: entry.productsCountStub,
                isStub: true,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
