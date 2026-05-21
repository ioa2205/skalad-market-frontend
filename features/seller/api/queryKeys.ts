import type { LeadStatus } from "@/lib/api/schemas/enums";
import type { ProductModerationStatus } from "@/lib/api/schemas/enums";

export interface SellerProductsListParams {
  companyId?: number | undefined;
  status?: ProductModerationStatus | undefined;
  page: number;
  perPage: number;
}

export interface SellerLeadsListParams {
  companyId?: number | undefined;
  status?: LeadStatus | undefined;
  page: number;
  perPage: number;
}

export const sellerKeys = {
  all: ["seller"] as const,
  companies: () => [...sellerKeys.all, "companies"] as const,
  products: {
    all: () => [...sellerKeys.all, "products"] as const,
    list: (params: SellerProductsListParams) =>
      [...sellerKeys.products.all(), "list", params] as const,
    detail: (id: number) =>
      [...sellerKeys.products.all(), "detail", id] as const,
  },
  leads: {
    all: () => [...sellerKeys.all, "leads"] as const,
    list: (params: SellerLeadsListParams) =>
      [...sellerKeys.leads.all(), "list", params] as const,
    detail: (id: number) =>
      [...sellerKeys.leads.all(), "detail", id] as const,
  },
} as const;
