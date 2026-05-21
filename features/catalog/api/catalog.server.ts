import "server-only";

import { serverFetch } from "@/lib/api/server";
import {
  CatalogHomepageResponse,
  CatalogFilterResponse,
  ProductResponse,
  pagedResponseSchema,
  springPageSchema,
  type SaleType,
  type CatalogHomepageResponse as HomepageT,
  type CatalogFilterResponse as FiltersT,
  type ProductResponse as ProductT,
} from "@/lib/api/schemas";
import { log } from "@/lib/log";

const CatalogList = pagedResponseSchema(ProductResponse);
const CatalogSaleType = springPageSchema(ProductResponse);

export interface FetchResult<T> {
  data: T | null;
  error?: { code: string; correlationId?: string | undefined };
}

export interface CatalogListResult {
  items: ProductT[];
  meta: { total: number; page: number; perPage: number; totalPages: number };
  error?: { code: string; correlationId?: string | undefined };
}

function handleError(scope: string, error: unknown) {
  const err = error as { code?: string; correlationId?: string };
  log.warn(`${scope}.failed`, {
    code: err.code ?? "unknown.error",
    correlationId: err.correlationId,
  });
  return {
    code: err.code ?? "unknown.error",
    correlationId: err.correlationId,
  };
}

export async function fetchHomepage(): Promise<FetchResult<HomepageT>> {
  try {
    const data = await serverFetch("/api/v1/catalog/homepage", {
      schema: CatalogHomepageResponse,
      next: { revalidate: 60, tags: ["catalog:homepage"] },
    });
    return { data };
  } catch (error) {
    return { data: null, error: handleError("catalog.homepage", error) };
  }
}

export interface CatalogListInput {
  q?: string;
  category?: string;
  regionId?: number | null;
  page: number;
  perPage: number;
}

export async function fetchCatalog(
  input: CatalogListInput,
): Promise<CatalogListResult> {
  const params = new URLSearchParams();
  if (input.q) params.set("q", input.q);
  if (input.category) params.set("category", input.category);
  if (input.regionId != null) params.set("regionId", String(input.regionId));
  params.set("page", String(input.page));
  params.set("perPage", String(input.perPage));

  try {
    const data = await serverFetch(`/api/v1/catalog?${params.toString()}`, {
      schema: CatalogList,
      cache: "no-store",
    });
    return { items: data.items, meta: data.meta };
  } catch (error) {
    return {
      items: [],
      meta: { total: 0, page: input.page, perPage: input.perPage, totalPages: 0 },
      error: handleError("catalog.list", error),
    };
  }
}

export async function fetchCatalogBySaleType(input: {
  saleType: SaleType;
  page: number;
  perPage: number;
}): Promise<CatalogListResult> {
  const params = new URLSearchParams({
    saleType: input.saleType,
    page: String(input.page),
    perPage: String(input.perPage),
  });
  try {
    const data = await serverFetch(
      `/api/v1/catalog/saleType/product?${params.toString()}`,
      {
        schema: CatalogSaleType,
        cache: "no-store",
      },
    );
    return {
      items: data.content,
      meta: {
        total: data.totalElements,
        page: data.number,
        perPage: data.size,
        totalPages: data.totalPages,
      },
    };
  } catch (error) {
    return {
      items: [],
      meta: { total: 0, page: input.page, perPage: input.perPage, totalPages: 0 },
      error: handleError("catalog.saleType", error),
    };
  }
}

export async function fetchCatalogFilters(
  category: string | null,
): Promise<FetchResult<FiltersT>> {
  const path = category
    ? `/api/v1/catalog/filters?category=${encodeURIComponent(category)}`
    : "/api/v1/catalog/filters";
  try {
    const data = await serverFetch(path, {
      schema: CatalogFilterResponse,
      next: { revalidate: 300, tags: ["catalog:filters"] },
    });
    return { data };
  } catch (error) {
    return { data: null, error: handleError("catalog.filters", error) };
  }
}
