"use client";

import { Inbox } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import { useCallback, useMemo } from "react";

import { EmptyState, ErrorState } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import type { LeadResponse } from "@/lib/api/schemas/lead";
import type { LeadStatus } from "@/lib/api/schemas/enums";

import { LeadDetailDrawer } from "./LeadDetailDrawer";
import { LeadListRow } from "./LeadListRow";
import { LeadStatusFilter } from "./LeadStatusFilter";
import { LeadsPager } from "./LeadsPager";

export interface LeadsViewProps {
  items: LeadResponse[];
  meta: { total: number; page: number; perPage: number; totalPages: number };
  status?: LeadStatus;
  selectedId: number | null;
  error?: { code: string; correlationId?: string | undefined } | undefined;
}

export function LeadsView({
  items,
  meta,
  status,
  selectedId,
  error,
}: LeadsViewProps) {
  const t = useTranslations("leads");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setSelected = useCallback(
    (id: number | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (id === null) params.delete("selected");
      else params.set("selected", String(id));
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const initial = useMemo(
    () => (selectedId !== null ? items.find((l) => l.id === selectedId) : undefined),
    [items, selectedId],
  );

  return (
    <section className="flex flex-col gap-6">
      <LeadStatusFilter active={status} />

      {error ? (
        <ErrorState
          title={t("error.title")}
          description={t("error.description")}
          correlationId={error.correlationId}
          correlationIdLabel={t("error.correlationLabel")}
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={status ? t("emptyFiltered.title") : t("empty.title")}
          description={status ? t("emptyFiltered.description") : t("empty.description")}
          action={
            <Button asChild variant="primary">
              <Link href="/catalog">{t("empty.cta")}</Link>
            </Button>
          }
        />
      ) : (
        <>
          <ul className="flex flex-col gap-3">
            {items.map((lead) => (
              <li key={lead.id}>
                <LeadListRow lead={lead} onOpen={(id) => setSelected(id)} />
              </li>
            ))}
          </ul>
          <div className="flex justify-center">
            <LeadsPager
              page={meta.page}
              perPage={meta.perPage}
              totalItems={meta.total}
            />
          </div>
        </>
      )}

      <LeadDetailDrawer
        leadId={selectedId}
        initial={initial}
        onClose={() => setSelected(null)}
      />
    </section>
  );
}
