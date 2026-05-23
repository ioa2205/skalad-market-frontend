"use client";

import { Building2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { EmptyState } from "@/components/feedback";
import type { CompanyMapResponse, CompanyShortDTO } from "@/lib/api/schemas";

import { useCompanyDirectoryParams } from "../hooks/useCompanyDirectoryParams";

import { CompanyCard } from "./CompanyCard";
import { CompanyDirectoryMapStub } from "./CompanyDirectoryMapStub";

export interface CompanyDirectoryViewProps {
  entries: CompanyShortDTO[];
  mapEntries?: CompanyMapResponse[];
}

export function CompanyDirectoryView({
  entries,
  mapEntries = [],
}: CompanyDirectoryViewProps) {
  const t = useTranslations("company.directory");
  const [params] = useCompanyDirectoryParams();

  if (params.view === "map") {
    return <CompanyDirectoryMapStub entries={mapEntries} />;
  }

  return (
    <div className="flex flex-col gap-4">
      {entries.length === 0 ? (
        <EmptyState
          icon={Building2}
          title={t("empty.title")}
          description={t("empty.description")}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry) => (
            <CompanyCard
              key={entry.id}
              company={{
                id: entry.id,
                name: entry.name,
                slug: entry.slug,
                logoInitials: initials(entry.name),
                logoUrl: entry.logoUrl,
                shortDescription: null,
                industry: null,
                region: null,
                verified: entry.verificationStatus === "VERIFIED",
                ratingStub: null,
                reviewsCountStub: null,
                productsCountStub: null,
                isStub: false,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function initials(name: string): string {
  return name
    .split(/\s+/u)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
