import type { LeadResponse } from "@/lib/api/schemas/lead";
import type { ProductResponse } from "@/lib/api/schemas/product";

export interface SellerKpiSnapshot {
  /** Live products: APPROVED moderation + isActive=true. */
  activeProducts: number;
  /** Open requests awaiting action: NEW + VIEWED. */
  openLeads: number;
  /** Distinct buyer ids across all returned leads — proxy for "Контакты". */
  distinctContacts: number;
}

/**
 * Pure aggregation — no analytics endpoint exists, so the seller "Обзор"
 * KPIs are derived client-side from `/products/my` + `/leads/seller`.
 *
 * Expects the *first page* of each list. The dashboard explicitly fetches
 * a large page (perPage=100) so the snapshot is stable for typical sellers;
 * for high-volume tenants this should be replaced by a real analytics
 * endpoint — see `// TODO(backend): add seller analytics`.
 */
export function aggregateKpis(input: {
  products: ProductResponse[];
  leads: LeadResponse[];
}): SellerKpiSnapshot {
  const activeProducts = input.products.filter(
    (product) => product.status === "APPROVED" && product.isActive,
  ).length;

  const openLeads = input.leads.filter(
    (lead) => lead.status === "NEW" || lead.status === "VIEWED",
  ).length;

  const distinctBuyerIds = new Set<number>();
  for (const lead of input.leads) {
    distinctBuyerIds.add(lead.buyerId);
  }

  return {
    activeProducts,
    openLeads,
    distinctContacts: distinctBuyerIds.size,
  };
}
