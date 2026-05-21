"use client";

import { useTranslations } from "next-intl";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";

import { FilterChip } from "@/components/data";
import { LeadStatusEnum, type LeadStatus } from "@/lib/api/schemas/enums";

const ORDER: LeadStatus[] = ["NEW", "VIEWED", "CONTACTED", "CLOSED", "CANCELED"];

export function isLeadStatus(value: string | null | undefined): value is LeadStatus {
  if (!value) return false;
  return LeadStatusEnum.safeParse(value).success;
}

export interface LeadStatusFilterProps {
  active?: LeadStatus;
}

export function LeadStatusFilter({ active }: LeadStatusFilterProps) {
  const t = useTranslations("leads");
  const tStatus = useTranslations("status.lead");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const update = useCallback(
    (status: LeadStatus | undefined) => {
      const params = new URLSearchParams(searchParams.toString());
      if (status) params.set("status", status);
      else params.delete("status");
      // Reset paging on filter change so we never land on an out-of-range page.
      params.delete("page");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const chips = useMemo(
    () =>
      ORDER.map((status) => ({
        status,
        label: tStatus(status),
        active: active === status,
      })),
    [active, tStatus],
  );

  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t("filter.label")}>
      <FilterChip active={!active} onClick={() => update(undefined)}>
        {t("filter.all")}
      </FilterChip>
      {chips.map((chip) => (
        <FilterChip
          key={chip.status}
          active={chip.active}
          onClick={() => update(chip.status)}
        >
          {chip.label}
        </FilterChip>
      ))}
    </div>
  );
}
