import type { SaleType } from "@/lib/api/schemas";

export interface CatalogListParams {
  q: string;
  category: string;
  regionId: number | null;
  page: number;
  perPage: number;
}

export const catalogKeys = {
  all: ["catalog"] as const,
  homepage: () => [...catalogKeys.all, "homepage"] as const,
  list: (params: CatalogListParams) =>
    [...catalogKeys.all, "list", params] as const,
  saleType: (saleType: SaleType, page: number, perPage: number) =>
    [...catalogKeys.all, "saleType", saleType, page, perPage] as const,
  suggestions: (q: string) => [...catalogKeys.all, "suggestions", q] as const,
  filters: (category: string | null) =>
    [...catalogKeys.all, "filters", category] as const,
};
