"use client";

import {
  parseAsBoolean,
  parseAsInteger,
  parseAsNumberLiteral,
  parseAsString,
  parseAsStringEnum,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";

import type { SaleType } from "@/lib/api/schemas";

const SALE_TYPES: SaleType[] = ["WHOLESALE", "RETAIL"];
const PER_PAGE_VALUES = [10, 20, 50] as const;
const VIEW_MODES = ["grid", "map"] as const;

/**
 * Mirrors the URL params accepted by `/catalog`. Page is 1-indexed (matching
 * Spring's `page` query for `/catalog/saleType/product` and the `meta.page`
 * field on `PagedResponse<T>`). When a defaulted param matches its default
 * value, nuqs strips it from the URL so links stay clean.
 */
export const catalogParsers = {
  q: parseAsString.withDefault(""),
  category: parseAsString.withDefault(""),
  regionId: parseAsInteger,
  page: parseAsInteger.withDefault(1),
  perPage: parseAsNumberLiteral(PER_PAGE_VALUES).withDefault(20),
  saleType: parseAsStringEnum<SaleType>(SALE_TYPES),
  mode: parseAsStringLiteral(VIEW_MODES).withDefault("grid"),
  inStock: parseAsBoolean.withDefault(false),
  verified: parseAsBoolean.withDefault(false),
};

export function useCatalogParams() {
  return useQueryStates(catalogParsers, {
    history: "push",
    shallow: false,
  });
}
