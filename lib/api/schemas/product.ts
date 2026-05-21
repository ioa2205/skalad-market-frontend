import { z } from "zod";

import {
  CurrencyEnum,
  PriceTypeEnum,
  ProductModerationStatusEnum,
  SaleTypeEnum,
} from "./enums";

export const ProductImageResponse = z.object({
  id: z.string(),
  url: z.string(),
  thumbnail_urls: z.record(z.string(), z.string()).optional().nullable(),
  is_primary: z.boolean(),
});
export type ProductImageResponse = z.infer<typeof ProductImageResponse>;

/**
 * Wire format: camelCase. Backend uses no `@JsonProperty` overrides on
 * `CreateProductRequest`. `description`, `price`, `saleType`, `minProduct`
 * are all required at create-time per backend service validation.
 */
export const CreateProductRequest = z.object({
  companyId: z.number(),
  categoryId: z.number(),
  name: z.string().min(1),
  shortDescription: z.string().optional(),
  description: z.string().min(1),
  priceType: PriceTypeEnum,
  saleType: SaleTypeEnum,
  price: z.union([z.string(), z.number()]),
  currency: CurrencyEnum,
  regionId: z.number(),
  districtId: z.number().optional(),
  minProduct: z.number().int().positive(),
  attributes: z.record(z.string(), z.unknown()).optional(),
});
export type CreateProductRequest = z.infer<typeof CreateProductRequest>;

/**
 * Wire format: snake_case for most fields via `@JsonProperty`, except
 * `description` and `currency` which stay camelCase. `saleType` and
 * `minProduct` are NOT accepted on update — they're create-time only.
 */
export const UpdateProductRequest = z.object({
  company_id: z.number(),
  category_id: z.number(),
  name: z.string().min(1),
  short_description: z.string().optional(),
  description: z.string().optional(),
  price_type: PriceTypeEnum,
  price: z.union([z.string(), z.number()]).optional(),
  currency: CurrencyEnum,
  region_id: z.number(),
  district_id: z.number().optional(),
  attributes: z.record(z.string(), z.unknown()).optional(),
});
export type UpdateProductRequest = z.infer<typeof UpdateProductRequest>;

export const ProductResponse = z.object({
  id: z.number(),
  companyId: z.number(),
  sellerId: z.number(),
  categoryId: z.number(),
  name: z.string(),
  slug: z.string(),
  shortDescription: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  priceType: PriceTypeEnum,
  price: z.union([z.string(), z.number()]).optional().nullable(),
  currency: CurrencyEnum,
  regionId: z.number(),
  districtId: z.number().optional().nullable(),
  attributes: z.record(z.string(), z.unknown()).optional().nullable(),
  status: ProductModerationStatusEnum,
  isActive: z.boolean(),
  isPromoted: z.boolean(),
  promotedUntil: z.string().optional().nullable(),
  rejectReason: z.string().optional().nullable(),
  viewsCountCache: z.number(),
  favoritesCountCache: z.number(),
  createdAt: z.string(),
  images: z.array(ProductImageResponse).optional(),
});
export type ProductResponse = z.infer<typeof ProductResponse>;

export const SimilarProductResponse = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  price: z.union([z.string(), z.number()]).optional().nullable(),
  currency: CurrencyEnum.optional(),
  is_promoted: z.boolean().optional().nullable(),
  primary_image: z.string().optional().nullable(),
});
export type SimilarProductResponse = z.infer<typeof SimilarProductResponse>;

export const ProductDetailCompanySummary = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  logo_path: z.string().optional().nullable(),
});
export type ProductDetailCompanySummary = z.infer<typeof ProductDetailCompanySummary>;

export const ProductDetailCategorySummary = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
});
export type ProductDetailCategorySummary = z.infer<typeof ProductDetailCategorySummary>;

export const ProductDetailResponse = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional().nullable(),
  short_description: z.string().optional().nullable(),
  price_type: PriceTypeEnum,
  price: z.union([z.string(), z.number()]).optional().nullable(),
  currency: CurrencyEnum,
  region_id: z.number().optional().nullable(),
  district_id: z.number().optional().nullable(),
  images: z.array(ProductImageResponse).optional().nullable(),
  attributes: z.record(z.string(), z.unknown()).optional().nullable(),
  status: ProductModerationStatusEnum,
  is_promoted: z.boolean().optional().nullable(),
  views_count_cache: z.number().optional().nullable(),
  favorites_count_cache: z.number().optional().nullable(),
  created_at: z.string().optional().nullable(),
  company: ProductDetailCompanySummary.optional().nullable(),
  category: ProductDetailCategorySummary.optional().nullable(),
  similar_products: z.array(SimilarProductResponse).optional().nullable(),
});
export type ProductDetailResponse = z.infer<typeof ProductDetailResponse>;

export const ProductSearchResponse = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  price: z.union([z.string(), z.number()]).optional().nullable(),
  currency: CurrencyEnum.optional(),
});
export type ProductSearchResponse = z.infer<typeof ProductSearchResponse>;
