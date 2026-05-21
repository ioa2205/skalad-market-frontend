import "server-only";

import { serverFetch } from "@/lib/api/server";
import {
  ProductResponse,
  pagedResponseSchema,
  type ProductResponse as ProductT,
} from "@/lib/api/schemas";
import { log } from "@/lib/log";

const FavoritesPage = pagedResponseSchema(ProductResponse);

export interface FavoritesListResult {
  items: ProductT[];
  meta: { total: number; page: number; perPage: number; totalPages: number };
  error?: { code: string; correlationId?: string | undefined };
}

export interface FetchFavoritesInput {
  page: number;
  perPage: number;
}

export async function fetchFavorites(
  input: FetchFavoritesInput,
): Promise<FavoritesListResult> {
  const params = new URLSearchParams({
    page: String(input.page),
    perPage: String(input.perPage),
  });
  try {
    const data = await serverFetch(`/api/v1/favorites?${params.toString()}`, {
      schema: FavoritesPage,
      cache: "no-store",
    });
    return { items: data.items, meta: data.meta };
  } catch (error) {
    const err = error as { code?: string; correlationId?: string };
    log.warn("favorites.list.failed", {
      code: err.code ?? "unknown.error",
      correlationId: err.correlationId,
    });
    return {
      items: [],
      meta: { total: 0, page: input.page, perPage: input.perPage, totalPages: 0 },
      error: {
        code: err.code ?? "unknown.error",
        correlationId: err.correlationId,
      },
    };
  }
}
