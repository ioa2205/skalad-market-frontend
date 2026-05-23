import "server-only";

import { ApiError } from "@/lib/api/errors";
import { serverFetch } from "@/lib/api/server";
import {
  CompanySlugMapResponse,
  ProductDetailResponse,
  type CompanySlugMapResponse as CompanyT,
  type ProductDetailResponse as ProductDetailT,
} from "@/lib/api/schemas";
import { log } from "@/lib/log";

export interface ProductDetailFetchResult {
  data: ProductDetailT | null;
  status: "ok" | "not-found" | "error";
  error?: { code: string; correlationId?: string | undefined };
}

export interface CompanyDetailFetchResult {
  data: CompanyT | null;
  error?: { code: string; correlationId?: string | undefined };
}

export interface FetchProductDetailInput {
  slug: string;
  /** Forwarded as `X-SESSION-ID` header for view tracking. */
  sessionId?: string | undefined;
}

export async function fetchProductDetail({
  slug,
  sessionId,
}: FetchProductDetailInput): Promise<ProductDetailFetchResult> {
  try {
    const data = await serverFetch(
      `/api/v1/products/${encodeURIComponent(slug)}`,
      {
        schema: ProductDetailResponse,
        cache: "no-store",
        ...(sessionId ? { headers: { "x-session-id": sessionId } } : {}),
      },
    );
    return { data, status: "ok" };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return {
        data: null,
        status: "not-found",
        error: { code: error.code, correlationId: error.correlationId },
      };
    }
    const err = error as { code?: string; correlationId?: string };
    log.warn("product.detail.failed", {
      slug,
      code: err.code ?? "unknown.error",
      correlationId: err.correlationId,
    });
    return {
      data: null,
      status: "error",
      error: {
        code: err.code ?? "unknown.error",
        correlationId: err.correlationId,
      },
    };
  }
}

export async function fetchCompanyBySlug(
  slug: string,
): Promise<CompanyDetailFetchResult> {
  try {
    const data = await serverFetch(
      `/api/v1/companies/${encodeURIComponent(slug)}`,
      {
        schema: CompanySlugMapResponse,
        next: { revalidate: 300, tags: [`company:${slug}`] },
      },
    );
    return { data };
  } catch (error) {
    const err = error as { code?: string; correlationId?: string };
    // Soft-fail: the public profile feeds the seller mini-card and phone CTA.
    // If unreachable we still render the rest of the product page.
    log.warn("product.company.failed", {
      slug,
      code: err.code ?? "unknown.error",
      correlationId: err.correlationId,
    });
    return {
      data: null,
      error: {
        code: err.code ?? "unknown.error",
        correlationId: err.correlationId,
      },
    };
  }
}
