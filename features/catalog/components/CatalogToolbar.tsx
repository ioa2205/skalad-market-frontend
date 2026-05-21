"use client";

import { Globe2, List, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { SearchInput } from "@/components/data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

import { useCatalogParams } from "../hooks/useCatalogParams";

export interface CatalogToolbarProps {
  totalCount: number | null;
  className?: string;
}

export function CatalogToolbar({ totalCount, className }: CatalogToolbarProps) {
  const t = useTranslations("catalog");
  const [params, setParams] = useCatalogParams();
  const [draftQ, setDraftQ] = useState(params.q);

  // Keep the input in sync if the URL changes from outside (back/forward).
  useEffect(() => {
    setDraftQ(params.q);
  }, [params.q]);

  const onSearch = (next: string) => {
    setDraftQ(next);
    void setParams({ q: next, page: 1 });
  };

  const isMap = params.mode === "map";
  const countLabel =
    totalCount === null
      ? t("count.loading")
      : t("count.total", { count: totalCount });

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-start">
        <div>
          <h1 className="text-[32px] font-bold leading-[39px] tracking-normal text-chrome-strong">
            {t("title")}
          </h1>
          <p className="mt-3 text-[15px] leading-[18px] text-chrome-strong">
            {countLabel}
          </p>
        </div>
        <div className="flex w-full items-center gap-3 pt-[11px] md:w-auto">
          <SearchInput
            value={draftQ}
            onSearchChange={onSearch}
            placeholder={t("search.placeholder")}
            className="w-full md:w-[245px]"
            iconClassName="left-[19px] size-6 text-chrome-strong"
            inputClassName="h-[47px] rounded-[10px] border-catalog-control-border pl-[50px] pr-4 text-[15px] leading-[18px] text-chrome-strong placeholder:text-catalog-placeholder"
          />
          <Button
            variant="secondary"
            size="lg"
            onClick={() => setParams({ mode: isMap ? "grid" : "map" })}
            aria-pressed={isMap}
            className="h-[47px] rounded-[10px] border border-catalog-control-border px-5 text-[15px] font-medium leading-[18px] text-chrome-strong shadow-none ring-0 hover:bg-bg-elevated"
          >
            {isMap ? (
              <List aria-hidden="true" className="size-6" />
            ) : (
              <Globe2 aria-hidden="true" className="size-6" />
            )}
            <span className="hidden sm:inline whitespace-nowrap">
              {isMap ? t("map.switchToGrid") : t("map.switchToMap")}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
