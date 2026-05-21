import "server-only";

import { serverFetch } from "@/lib/api/server";
import {
  CategoryResponse,
  springPageSchema,
  type CategoryResponse as CategoryResponseT,
} from "@/lib/api/schemas";
import { log } from "@/lib/log";

const CategoriesPage = springPageSchema(CategoryResponse);

export interface CategoriesFetchResult {
  categories: CategoryResponseT[];
  totalElements: number;
  error?: { code: string; correlationId?: string | undefined };
}

export async function fetchCategories(
  options: { size?: number } = {},
): Promise<CategoriesFetchResult> {
  const size = options.size ?? 20;
  try {
    const data = await serverFetch(`/api/v1/category?page=0&size=${size}`, {
      schema: CategoriesPage,
      next: { revalidate: 300, tags: ["categories"] },
    });
    return { categories: data.content, totalElements: data.totalElements };
  } catch (error) {
    const err = error as { code?: string; correlationId?: string };
    log.warn("category.fetch.failed", {
      code: err.code ?? "unknown.error",
      correlationId: err.correlationId,
    });
    return {
      categories: [],
      totalElements: 0,
      error: {
        code: err.code ?? "unknown.error",
        correlationId: err.correlationId,
      },
    };
  }
}
