import "server-only";

import { ApiError } from "@/lib/api/errors";
import { serverFetch } from "@/lib/api/server";
import {
  CompanyMapResponse,
  CompanyProductResponse,
  CompanyShortDTO,
  CompanySlugMapResponse,
  springPageSchema,
  type CompanyMapResponse as CompanyMapT,
  type CompanyProductResponse as CompanyProductT,
  type CompanyShortDTO as CompanyShortT,
  type CompanySlugMapResponse as CompanyT,
} from "@/lib/api/schemas";
import { log } from "@/lib/log";

const CompanyShortPage = springPageSchema(CompanyShortDTO);
const CompanyMapPage = springPageSchema(CompanyMapResponse);
const CompanyProductsPage = springPageSchema(CompanyProductResponse);

export interface CompanyDetailFetchResult {
  data: CompanyT | null;
  status: "ok" | "not-found" | "error";
  error?: { code: string; correlationId?: string | undefined };
}

export interface CompanyDirectoryFetchInput {
  q?: string;
  page?: number;
  perPage?: number;
}

export interface CompanyDirectoryFetchResult {
  items: CompanyShortT[];
  totalElements: number;
  error?: { code: string; correlationId?: string | undefined };
}

export interface CompanyMapFetchResult {
  items: CompanyMapT[];
  error?: { code: string; correlationId?: string | undefined };
}

export interface CompanyProductsFetchResult {
  items: CompanyProductT[];
  totalElements: number;
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
        schema: CompanySlugMapResponse,
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

export async function fetchCompanyDirectory(
  input: CompanyDirectoryFetchInput = {},
): Promise<CompanyDirectoryFetchResult> {
  const page = input.page ?? 1;
  const perPage = input.perPage ?? 60;
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  });
  if (input.q?.trim()) params.set("q", input.q.trim());
  const path = input.q?.trim()
    ? `/api/v1/companies/search?${params.toString()}`
    : `/api/v1/companies/public?${params.toString()}`;

  try {
    const data = await serverFetch(path, {
      schema: CompanyShortPage,
      cache: "no-store",
    });
    return { items: data.content, totalElements: data.totalElements };
  } catch (error) {
    const err = error as { code?: string; correlationId?: string };
    log.warn("company.directory.failed", {
      code: err.code ?? "unknown.error",
      correlationId: err.correlationId,
    });
    return {
      items: [],
      totalElements: 0,
      error: {
        code: err.code ?? "unknown.error",
        correlationId: err.correlationId,
      },
    };
  }
}

export async function fetchCompanyMap(input: {
  q?: string;
  page?: number;
  perPage?: number;
} = {}): Promise<CompanyMapFetchResult> {
  const params = new URLSearchParams({
    page: String(input.page ?? 1),
    per_page: String(input.perPage ?? 60),
  });
  if (input.q?.trim()) params.set("q", input.q.trim());

  try {
    const data = await serverFetch(`/api/v1/companies/map?${params.toString()}`, {
      schema: CompanyMapPage,
      cache: "no-store",
    });
    return { items: data.content };
  } catch (error) {
    const err = error as { code?: string; correlationId?: string };
    log.warn("company.map.failed", {
      code: err.code ?? "unknown.error",
      correlationId: err.correlationId,
    });
    return {
      items: [],
      error: {
        code: err.code ?? "unknown.error",
        correlationId: err.correlationId,
      },
    };
  }
}

export async function fetchCompanyProducts(input: {
  slug: string;
  page?: number;
  perPage?: number;
}): Promise<CompanyProductsFetchResult> {
  const params = new URLSearchParams({
    page: String(input.page ?? 1),
    per_page: String(input.perPage ?? 12),
  });

  try {
    const data = await serverFetch(
      `/api/v1/companies/${encodeURIComponent(input.slug)}/products?${params.toString()}`,
      {
        schema: CompanyProductsPage,
        cache: "no-store",
      },
    );
    return { items: data.content, totalElements: data.totalElements };
  } catch (error) {
    const err = error as { code?: string; correlationId?: string };
    log.warn("company.products.failed", {
      slug: input.slug,
      code: err.code ?? "unknown.error",
      correlationId: err.correlationId,
    });
    return {
      items: [],
      totalElements: 0,
      error: {
        code: err.code ?? "unknown.error",
        correlationId: err.correlationId,
      },
    };
  }
}
