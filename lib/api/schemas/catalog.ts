import { z } from "zod";

import { ProductResponse } from "./product";

export const CatalogFilterResponse = z.object({
  minPrice: z.number().optional().nullable(),
  maxPrice: z.number().optional().nullable(),
  regionIds: z.array(z.number()).optional().nullable(),
  attributes: z.record(z.string(), z.array(z.string())).optional().nullable(),
});
export type CatalogFilterResponse = z.infer<typeof CatalogFilterResponse>;

/**
 * `CatalogHomepageResponse.banners` is `string[]` (image URLs) per
 * backend_summary §3.5 — the dedicated `/banners/getAll` endpoint returns
 * the richer `BannerResponse` shape (`{ id, imageUrl }`).
 *
 * `topCategories` and `verifiedCompanies` are `Long[]` of ids, named exactly
 * like that on the wire (no `Ids` suffix).
 */
export const CatalogHomepageResponse = z.object({
  featuredProducts: z.array(ProductResponse).optional().nullable(),
  newProducts: z.array(ProductResponse).optional().nullable(),
  banners: z.array(z.string()).optional().nullable(),
  topCategories: z.array(z.number()).optional().nullable(),
  verifiedCompanies: z.array(z.number()).optional().nullable(),
});
export type CatalogHomepageResponse = z.infer<typeof CatalogHomepageResponse>;

export const CatalogSuggestionsResponse = z.object({
  suggestions: z.array(z.string()),
});
export type CatalogSuggestionsResponse = z.infer<typeof CatalogSuggestionsResponse>;
