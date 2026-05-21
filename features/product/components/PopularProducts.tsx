"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { SearchInput } from "@/components/data";
import type { ProductResponse } from "@/lib/api/schemas";

import { ProductCard } from "./ProductCard";

export interface PopularProductsProps {
  products: ProductResponse[];
  verifiedCompanyIds: number[];
}

export function PopularProducts({
  products,
  verifiedCompanyIds,
}: PopularProductsProps) {
  const t = useTranslations("home.popular");
  const [query, setQuery] = useState("");

  const verifiedSet = useMemo(
    () => new Set(verifiedCompanyIds),
    [verifiedCompanyIds],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, query]);

  return (
    <section
      aria-label={t("sectionLabel")}
      className="rounded-xl bg-bg-elevated px-[62px] pb-6"
    >
      <header className="flex h-12 items-center justify-between gap-3">
        <h2 className="text-[24px] font-semibold leading-[30px] text-fg">
          {t("title")}
        </h2>
        <SearchInput
          value={query}
          onSearchChange={setQuery}
          placeholder={t("searchPlaceholder")}
          className="h-12 w-[245px]"
          iconClassName="left-5 size-5"
          inputClassName="h-12 rounded-lg border-chrome-input-border bg-bg-elevated px-12 text-[16px] leading-5"
        />
      </header>
      <div className="grid grid-cols-1 gap-[13px] pt-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            verified={verifiedSet.has(product.companyId)}
            className="h-[353px]"
          />
        ))}
      </div>
    </section>
  );
}
