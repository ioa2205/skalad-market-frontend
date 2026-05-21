"use client";

import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api/client";
import { CategoryResponse, springPageSchema } from "@/lib/api/schemas";

import { categoryKeys } from "./queryKeys";

const CategoriesPage = springPageSchema(CategoryResponse);

export function useCategories(size = 200) {
  return useQuery({
    queryKey: categoryKeys.list(0, size),
    queryFn: () =>
      apiFetch(`/api/v1/category?page=0&size=${size}`, {
        schema: CategoriesPage,
      }),
    staleTime: 5 * 60_000,
  });
}
