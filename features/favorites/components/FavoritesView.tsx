"use client";

import { Heart, Map } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { SearchInput } from "@/components/data";
import { EmptyState, ErrorState } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { ProductCard } from "@/features/product";
import type { ProductResponse } from "@/lib/api/schemas";

import { primeFavoritedIds } from "../api/favorites.client";

import { FavoritesPager } from "./FavoritesPager";
import { FavoritesTabs, type FavoritesTabValue } from "./FavoritesTabs";

export interface FavoritesViewProps {
  items: ProductResponse[];
  meta: { total: number; page: number; perPage: number; totalPages: number };
  error?: { code: string; correlationId?: string | undefined } | undefined;
}

export function FavoritesView({ items, meta, error }: FavoritesViewProps) {
  const t = useTranslations("favorites");
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<FavoritesTabValue>("products");
  const [query, setQuery] = useState("");

  // Hot-prime the optimistic-toggle cache so every ProductCard's heart already
  // knows it's filled — saves a duplicate fetch on page load.
  useEffect(() => {
    if (!error) primeFavoritedIds(queryClient, items.map((p) => p.id));
  }, [items, error, queryClient]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((p) => p.name.toLowerCase().includes(q));
  }, [items, query]);

  const onMapClick = () => {
    toast.info(t("map.comingSoonTitle"), {
      description: t("map.comingSoonDescription"),
    });
  };

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-h1 font-bold text-fg">{t("title")}</h1>
          <p className="text-body-sm text-fg-muted">
            {t("count", { count: meta.total })}
          </p>
        </div>
        <div className="flex w-full items-center gap-2 md:w-auto">
          <SearchInput
            value={query}
            onSearchChange={setQuery}
            placeholder={t("search.placeholder")}
            className="w-full md:w-72"
          />
          <Button
            variant="secondary"
            size="md"
            onClick={onMapClick}
            aria-label={t("map.switchToMap")}
          >
            <Map aria-hidden="true" />
            <span className="hidden sm:inline">{t("map.switchToMap")}</span>
          </Button>
        </div>
      </header>

      <FavoritesTabs active={tab} onChange={setTab} />

      {error ? (
        <ErrorState
          title={t("error.title")}
          description={t("error.description")}
          correlationId={error.correlationId}
          correlationIdLabel={t("error.correlationLabel")}
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Heart}
          title={t("empty.title")}
          description={t("empty.description")}
          action={
            <Button asChild variant="primary">
              <Link href="/catalog">{t("empty.cta")}</Link>
            </Button>
          }
        />
      ) : (
        <>
          <div className="rounded-2xl border border-border bg-bg-elevated p-[18px]">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
          <div className="flex justify-center">
            <FavoritesPager
              page={meta.page}
              perPage={meta.perPage}
              totalItems={meta.total}
            />
          </div>
        </>
      )}
    </section>
  );
}
