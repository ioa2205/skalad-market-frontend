import { z } from "zod";

import {
  CurrencyEnum,
  PriceTypeEnum,
  SaleTypeEnum,
} from "@/lib/api/schemas/enums";

/**
 * Form schemas for the seller product create/edit screens.
 *
 * These mirror the backend `CreateProductRequest` / `UpdateProductRequest`
 * shapes but with form-friendly types (numbers, not BigDecimal strings) and
 * i18n-key validation messages. The wire serializers below collapse them
 * into the camelCase / snake_case wire shapes the backend actually wants.
 */

const positiveNumber = (key: string) =>
  z
    .preprocess(
      (value) => {
        if (typeof value === "string") {
          const trimmed = value.trim();
          if (trimmed === "") return undefined;
          const parsed = Number(trimmed.replace(",", "."));
          return Number.isFinite(parsed) ? parsed : value;
        }
        return value;
      },
      z.number({ invalid_type_error: key }).positive(key),
    );

export const ProductCreateFormSchema = z.object({
  name: z.string().trim().min(2, "seller.dashboard.products.validation.nameRequired"),
  shortDescription: z
    .string()
    .max(160, "seller.dashboard.products.validation.shortDescMax")
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .trim()
    .min(1, "seller.dashboard.products.validation.descriptionRequired"),
  categoryId: z
    .number({ invalid_type_error: "seller.dashboard.products.validation.categoryRequired" })
    .int()
    .positive("seller.dashboard.products.validation.categoryRequired"),
  priceType: PriceTypeEnum,
  saleType: SaleTypeEnum,
  price: positiveNumber("seller.dashboard.products.validation.priceRequired"),
  currency: CurrencyEnum,
  regionId: z
    .number({ invalid_type_error: "seller.dashboard.products.validation.regionRequired" })
    .int()
    .positive("seller.dashboard.products.validation.regionRequired"),
  districtId: z.number().int().optional(),
  minProduct: positiveNumber("seller.dashboard.products.validation.minProductRequired"),
  attributes: z.record(z.string(), z.unknown()).optional(),
});
export type ProductCreateFormValues = z.infer<typeof ProductCreateFormSchema>;

/** Edit form: no `saleType` / `minProduct`, price is optional per backend. */
export const ProductEditFormSchema = z.object({
  name: z.string().trim().min(2, "seller.dashboard.products.validation.nameRequired"),
  shortDescription: z
    .string()
    .max(160, "seller.dashboard.products.validation.shortDescMax")
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),
  categoryId: z
    .number({ invalid_type_error: "seller.dashboard.products.validation.categoryRequired" })
    .int()
    .positive("seller.dashboard.products.validation.categoryRequired"),
  priceType: PriceTypeEnum,
  price: positiveNumber("seller.dashboard.products.validation.priceRequired").optional(),
  currency: CurrencyEnum,
  regionId: z
    .number({ invalid_type_error: "seller.dashboard.products.validation.regionRequired" })
    .int()
    .positive("seller.dashboard.products.validation.regionRequired"),
  districtId: z.number().int().optional(),
  attributes: z.record(z.string(), z.unknown()).optional(),
});
export type ProductEditFormValues = z.infer<typeof ProductEditFormSchema>;

export interface CreateProductWire {
  companyId: number;
  categoryId: number;
  name: string;
  shortDescription?: string;
  description: string;
  priceType: ProductCreateFormValues["priceType"];
  saleType: ProductCreateFormValues["saleType"];
  price: number;
  currency: ProductCreateFormValues["currency"];
  regionId: number;
  districtId?: number;
  minProduct: number;
  attributes?: Record<string, unknown>;
}

export function toCreateProductWire(
  values: ProductCreateFormValues,
  companyId: number,
): CreateProductWire {
  const wire: CreateProductWire = {
    companyId,
    categoryId: values.categoryId,
    name: values.name,
    description: values.description,
    priceType: values.priceType,
    saleType: values.saleType,
    price: values.price,
    currency: values.currency,
    regionId: values.regionId,
    minProduct: values.minProduct,
  };
  if (values.shortDescription && values.shortDescription.length > 0) {
    wire.shortDescription = values.shortDescription;
  }
  if (values.districtId && values.districtId > 0) {
    wire.districtId = values.districtId;
  }
  if (values.attributes && Object.keys(values.attributes).length > 0) {
    wire.attributes = values.attributes;
  }
  return wire;
}

export interface UpdateProductWire {
  company_id: number;
  category_id: number;
  name: string;
  short_description?: string;
  description?: string;
  price_type: ProductEditFormValues["priceType"];
  price?: number;
  currency: ProductEditFormValues["currency"];
  region_id: number;
  district_id?: number;
  attributes?: Record<string, unknown>;
}

export function toUpdateProductWire(
  values: ProductEditFormValues,
  companyId: number,
): UpdateProductWire {
  const wire: UpdateProductWire = {
    company_id: companyId,
    category_id: values.categoryId,
    name: values.name,
    price_type: values.priceType,
    currency: values.currency,
    region_id: values.regionId,
  };
  if (values.shortDescription && values.shortDescription.length > 0) {
    wire.short_description = values.shortDescription;
  }
  if (values.description && values.description.length > 0) {
    wire.description = values.description;
  }
  if (values.price !== undefined) {
    wire.price = values.price;
  }
  if (values.districtId && values.districtId > 0) {
    wire.district_id = values.districtId;
  }
  if (values.attributes && Object.keys(values.attributes).length > 0) {
    wire.attributes = values.attributes;
  }
  return wire;
}
