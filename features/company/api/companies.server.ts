import "server-only";

import { ApiError } from "@/lib/api/errors";
import { serverFetch } from "@/lib/api/server";
import {
  CompanyResponseDTO,
  type CompanyResponseDTO as CompanyT,
} from "@/lib/api/schemas";
import { log } from "@/lib/log";

export interface CompanyDetailFetchResult {
  data: CompanyT | null;
  status: "ok" | "not-found" | "error";
  error?: { code: string; correlationId?: string | undefined };
}

/**
 * Profile-page fetcher. Distinguishes 404 from generic failure so the route
 * can call `notFound()` instead of bubbling to `error.tsx`. The
 * `fetchCompanyBySlug` already exposed by `features/product` soft-fails
 * (the seller mini-card hides on error) — this one is stricter because the
 * profile page is *only* the company.
 */
export async function fetchCompanyDetail(
  slug: string,
): Promise<CompanyDetailFetchResult> {
  try {
    const data = await serverFetch(
      `/api/v1/companies/${encodeURIComponent(slug)}`,
      {
        schema: CompanyResponseDTO,
        next: { revalidate: 300, tags: [`company:${slug}`] },
      },
    );
    return { data, status: "ok" };
  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.status === 404 ||
        (error.status === 400 && error.code === "company.not.found"))
    ) {
      return {
        data: null,
        status: "not-found",
        error: { code: error.code, correlationId: error.correlationId },
      };
    }
    const err = error as { code?: string; correlationId?: string };
    log.warn("company.detail.failed", {
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
