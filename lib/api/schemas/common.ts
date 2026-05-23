import { z } from "zod";

import type { ApiDataSchema } from "../response";

export function pagedResponseSchema<T>(itemSchema: ApiDataSchema<T>) {
  return z.object({
    items: z.array(itemSchema),
    meta: z.object({
      total: z.number(),
      page: z.number(),
      perPage: z.number(),
      totalPages: z.number(),
    }),
  });
}

export function springPageSchema<T>(itemSchema: ApiDataSchema<T>) {
  return z.object({
    content: z.array(itemSchema),
    number: z.number(),
    size: z.number(),
    totalElements: z.number(),
    totalPages: z.number(),
  });
}

export function productListResponseSchema<T>(itemSchema: ApiDataSchema<T>) {
  return z.object({
    items: z.array(itemSchema),
    page: z.number(),
    per_page: z.number(),
    total_elements: z.number(),
    total_pages: z.number(),
  });
}

export const moneyStringSchema = z.union([z.string(), z.number()]);
export const isoDateTimeSchema = z.string();
