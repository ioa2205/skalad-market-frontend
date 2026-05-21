import { useTranslations } from "next-intl";

import { EmptyState } from "@/components/feedback";
import type { LeadResponse } from "@/lib/api/schemas/lead";

import { SellerLeadRow } from "./SellerLeadRow";

export interface SellerLeadsListProps {
  initialItems: LeadResponse[];
}

export function SellerLeadsList({ initialItems }: SellerLeadsListProps) {
  const t = useTranslations("seller.dashboard.leads");
  if (initialItems.length === 0) {
    return <EmptyState title={t("emptyTitle")} description={t("emptyDescription")} />;
  }

  return (
    <section
      aria-labelledby="seller-leads-title"
      className="rounded-lg border border-border bg-bg-elevated p-5"
    >
      <h2 id="seller-leads-title" className="text-h4 font-semibold text-fg">
        {t("listTitle")}
      </h2>
      <ul className="mt-4 flex flex-col gap-3">
        {initialItems.map((lead) => (
          <SellerLeadRow key={lead.id} lead={lead} />
        ))}
      </ul>
    </section>
  );
}
