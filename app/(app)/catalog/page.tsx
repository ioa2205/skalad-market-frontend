import { getLocale } from "next-intl/server";

import {
  CatalogResults,
  CatalogToolbar,
  FilterSidebar,
} from "@/features/catalog";
import {
  fetchCatalog,
  fetchCatalogBySaleType,
  fetchCatalogFilters,
} from "@/features/catalog/api/catalog.server";
import type { CategoryLocale } from "@/features/category";
import { fetchCategories } from "@/features/category/api/categories.server";
import { SaleTypeEnum } from "@/lib/api/schemas";

function isCategoryLocale(value: string): value is CategoryLocale {
  return value === "ru" || value === "en" || value === "uz";
}

const PER_PAGE_VALUES = new Set([10, 20, 50]);

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  const q = stringParam(sp.q) ?? "";
  const category = stringParam(sp.category) ?? "";
  const regionId = numberParam(sp.regionId);
  const page = clampPage(numberParam(sp.page) ?? 1);
  const perPageRaw = numberParam(sp.perPage) ?? 20;
  const perPage = PER_PAGE_VALUES.has(perPageRaw) ? perPageRaw : 20;
  const saleTypeRaw = stringParam(sp.saleType);
  const saleType =
    saleTypeRaw && SaleTypeEnum.safeParse(saleTypeRaw).success
      ? SaleTypeEnum.parse(saleTypeRaw)
      : undefined;

  const localeRaw = await getLocale();
  const locale = isCategoryLocale(localeRaw) ? localeRaw : "ru";

  const [list, filters, categoriesResult] = await Promise.all([
    saleType
      ? fetchCatalogBySaleType({ saleType, page, perPage })
      : fetchCatalog({ q, category, regionId, page, perPage }),
    fetchCatalogFilters(category || null),
    fetchCategories({ size: 30 }),
  ]);

  const regions = filters.data?.regionIds ?? [];

  return (
    <div className="mx-auto flex w-full max-w-[1296px] flex-col px-4 py-10 md:px-0">
      <CatalogToolbar totalCount={list.meta.total} />
      <div className="mt-10 flex flex-col gap-9 md:flex-row">
        <div className="md:w-[361px] md:shrink-0">
          <FilterSidebar
            categories={categoriesResult.categories}
            regions={regions}
            locale={locale}
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
        <CatalogResults
          items={list.items}
          meta={list.meta}
          error={list.error}
        />
        </div>
      </div>
    </div>
  );
}

function stringParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function numberParam(value: string | string[] | undefined): number | undefined {
  const raw = stringParam(value);
  if (!raw) return undefined;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function clampPage(page: number): number {
  return Math.max(1, Math.floor(page));
}
