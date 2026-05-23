import "server-only";

import { z } from "zod";

import { ApiError } from "@/lib/api/errors";
import { serverFetch } from "@/lib/api/server";
import {
  CompanyShortDTO,
  CompanySlugMapResponse,
  type CompanyShortDTO as CompanyShortT,
  type CompanySlugMapResponse as CompanySlugT,
} from "@/lib/api/schemas";
import { log } from "@/lib/log";

const CompanyShortListSchema = z.array(CompanyShortDTO);

export interface FetchSellerCompaniesResult {
  companies: CompanyShortT[];
  /** Soft-fail flag — when true the layout falls back to the onboarding gate. */
  error?: { code: string; correlationId?: string | undefined };
}

/**
 * Lists the companies owned by the current seller. Used by the seller layout
 * to decide between rendering onboarding vs. the dashboard.
 *
 * Soft-fails: a missing token / 401 returns an empty list so the layout can
 * route to onboarding instead of crashing the whole shell.
 */
export async function fetchSellerCompanies(): Promise<FetchSellerCompaniesResult> {
  try {
    const data = await serverFetch("/api/v1/companies", {
      schema: CompanyShortListSchema,
      cache: "no-store",
    });
    return { companies: data };
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      return { companies: [] };
    }
    const err = error as { code?: string; correlationId?: string };
    log.warn("seller.companies.list.failed", {
      code: err.code ?? "unknown.error",
      correlationId: err.correlationId,
    });
    return {
      companies: [],
      error: {
        code: err.code ?? "unknown.error",
        correlationId: err.correlationId,
      },
    };
  }
}

export interface FetchSellerCompanyDetailResult {
  company: CompanySlugT | null;
  error?: { code: string; correlationId?: string | undefined };
}

/**
 * Fetches the public slug/map company detail for a single owned company.
 * Called from the seller layout so the bearer is attached for parity with
 * future ownership checks.
 */
export async function fetchSellerCompanyBySlug(
  slug: string,
): Promise<FetchSellerCompanyDetailResult> {
  try {
    const data = await serverFetch(
      `/api/v1/companies/${encodeURIComponent(slug)}`,
      {
        schema: CompanySlugMapResponse,
        cache: "no-store",
      },
    );
    return { company: data };
  } catch (error) {
    const err = error as { code?: string; correlationId?: string };
    log.warn("seller.company.detail.failed", {
      slug,
      code: err.code ?? "unknown.error",
      correlationId: err.correlationId,
    });
    return {
      company: null,
      error: {
        code: err.code ?? "unknown.error",
        correlationId: err.correlationId,
      },
    };
  }
}
