import { z, type ZodSchema } from "zod";

export function pagedResponseSchema<T>(itemSchema: ZodSchema<T>) {
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

export function springPageSchema<T>(itemSchema: ZodSchema<T>) {
  return z.object({
    content: z.array(itemSchema),
    number: z.number(),
    size: z.number(),
    totalElements: z.number(),
    totalPages: z.number(),
  });
}

export function productListResponseSchema<T>(itemSchema: ZodSchema<T>) {
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
