import "server-only";

import { serverFetch } from "@/lib/api/server";
import { productListResponseSchema } from "@/lib/api/schemas/common";
import {
  ProductResponse,
  type ProductResponse as ProductT,
} from "@/lib/api/schemas/product";
import type { ProductModerationStatus } from "@/lib/api/schemas/enums";
import { log } from "@/lib/log";

const SellerProductsPage = productListResponseSchema(ProductResponse);

export interface FetchSellerProductsInput {
  companyId?: number | undefined;
  status?: ProductModerationStatus | undefined;
  page: number;
  perPage: number;
}

export interface FetchSellerProductsResult {
  items: ProductT[];
  page: number;
  perPage: number;
  totalElements: number;
  totalPages: number;
  error?: { code: string; correlationId?: string | undefined };
}

/**
 * Lists the seller's own products via `GET /api/v1/products/my`. Returns the
 * `ProductListResponse` paginator (snake_case, 1-indexed) reshaped into
 * camelCase for the dashboard.
 *
 * Soft-fails: returns an empty page with `error` populated so the products
 * tab can render an inline `ErrorState` rather than crashing the layout.
 */
export async function fetchSellerProducts(
  input: FetchSellerProductsInput,
): Promise<FetchSellerProductsResult> {
  const params = new URLSearchParams({
    page: String(input.page),
    per_page: String(input.perPage),
  });
  if (input.companyId !== undefined) params.set("company_id", String(input.companyId));
  if (input.status) params.set("status", input.status);

  try {
    const data = await serverFetch(`/api/v1/products/my?${params.toString()}`, {
      schema: SellerProductsPage,
      cache: "no-store",
    });
    return {
      items: data.items,
      page: data.page,
      perPage: data.per_page,
      totalElements: data.total_elements,
      totalPages: data.total_pages,
    };
  } catch (error) {
    const err = error as { code?: string; correlationId?: string };
    log.warn("seller.products.list.failed", {
      code: err.code ?? "unknown.error",
      correlationId: err.correlationId,
    });
    return {
      items: [],
      page: input.page,
      perPage: input.perPage,
      totalElements: 0,
      totalPages: 0,
      error: {
        code: err.code ?? "unknown.error",
        correlationId: err.correlationId,
      },
    };
  }
}
