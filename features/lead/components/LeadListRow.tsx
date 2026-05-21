"use client";

import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { StatusBadge, type LeadStatus } from "@/components/badges/status-badge";
import type { LeadResponse } from "@/lib/api/schemas/lead";

export interface LeadListRowProps {
  lead: LeadResponse;
  onOpen: (id: number) => void;
}

export function LeadListRow({ lead, onOpen }: LeadListRowProps) {
  const t = useTranslations("leads");
  const tStatus = useTranslations("status.lead");
  const tSource = useTranslations("leads.source");

  return (
    <button
      type="button"
      onClick={() => onOpen(lead.id)}
      className="group flex w-full items-center gap-4 rounded-lg border border-border bg-bg-elevated p-4 text-left transition-colors duration-fast ease-standard hover:bg-bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
      aria-label={t("row.openLabel", { id: lead.id })}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="text-body font-semibold text-fg">
            {t("row.idLabel", { id: lead.id })}
          </span>
          <StatusBadge
            kind="lead"
            status={lead.status as LeadStatus}
            label={tStatus(lead.status)}
          />
          <span className="text-caption text-fg-muted">{tSource(lead.source)}</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-body-sm text-fg-muted">
          <span>{t("row.itemCount", { count: lead.items.length })}</span>
          <span>{lead.contactName}</span>
          <span className="font-mono">{lead.contactPhone}</span>
        </div>
      </div>
      <ChevronRight
        aria-hidden="true"
        className="size-5 shrink-0 text-fg-subtle group-hover:text-fg"
      />
    </button>
  );
}
