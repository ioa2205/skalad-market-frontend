"use client";

import { Map as MapIcon, Phone } from "lucide-react";
import { useTranslations } from "next-intl";

import { VerifiedBadge } from "@/components/badges";
import { Button } from "@/components/ui/button";
import { StartChatButton } from "@/features/chat";
import type { VerificationStatus } from "@/lib/api/schemas";

import { CompanyLogoMark } from "./CompanyLogoMark";

export interface CompanyHeaderProps {
  company: {
    id: number;
    name: string;
    logoUrl?: string | null;
    shortDescription?: string | null;
    phonePrimary?: string | null;
    verificationStatus?: VerificationStatus;
    status?: VerificationStatus;
  };
  /** Element id of the map section so the "Карта" button can scroll to it. */
  mapAnchorId?: string;
}

export function CompanyHeader({
  company,
  mapAnchorId = "company-profile-map",
}: CompanyHeaderProps) {
  const t = useTranslations("company");
  const verified = (company.verificationStatus ?? company.status) === "VERIFIED";
  const phone = company.phonePrimary ?? null;

  const handleMapJump = () => {
    if (typeof document === "undefined") return;
    document
      .getElementById(mapAnchorId)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="overflow-hidden rounded-lg border border-border bg-bg-elevated">
      {/* The public slug detail has no cover image, so keep the profile hero
          as a stable tinted band. */}
      <div aria-hidden="true" className="h-44 w-full bg-primary-100" />
      <div className="relative -mt-16 flex flex-col gap-4 px-6 pb-6 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-end">
          {/* Circular pedestal wrapping the square logo mark (figma). */}
          <div className="flex size-40 shrink-0 items-center justify-center rounded-full border border-border bg-bg-elevated shadow-md">
            <CompanyLogoMark
              name={company.name}
              logoUrl={company.logoUrl}
              size="xl"
            />
          </div>
          <div className="flex flex-col gap-1.5 md:pb-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-h2 font-bold text-fg">{company.name}</h1>
              {verified ? (
                <VerifiedBadge
                  label={t("verified")}
                  ariaLabel={t("verifiedAriaLabel")}
                  withIcon
                />
              ) : null}
            </div>
            {company.shortDescription ? (
              <p className="text-body-sm text-fg-muted">
                {company.shortDescription}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:pb-2">
          <StartChatButton variant="primary" sellerCompanyId={company.id}>
            {t("profile.actions.message")}
          </StartChatButton>
          {phone ? (
            <Button variant="secondary" asChild>
              <a href={`tel:${phone}`}>
                <Phone aria-hidden="true" />
                {t("profile.actions.call")}
              </a>
            </Button>
          ) : (
            <Button variant="secondary" disabled>
              <Phone aria-hidden="true" />
              {t("profile.actions.callComingSoon")}
            </Button>
          )}
          <Button variant="secondary" onClick={handleMapJump}>
            <MapIcon aria-hidden="true" />
            {t("profile.actions.map")}
          </Button>
        </div>
      </div>
    </section>
  );
}
