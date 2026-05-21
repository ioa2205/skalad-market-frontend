"use client";

import { SlidersHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { SearchInput } from "@/components/data";
import { Button } from "@/components/ui/button";
import {
  SegmentedTabs,
  SegmentedTabsList,
  SegmentedTabsTrigger,
} from "@/components/ui/segmented-tabs";
import { cn } from "@/lib/utils/cn";

export interface HomeHeroProps {
  className?: string;
}

export function HomeHero({ className }: HomeHeroProps) {
  const t = useTranslations("home");
  const tCatalog = useTranslations("catalog");
  const router = useRouter();

  const onSubmit = (value: string) => {
    if (!value.trim()) return;
    router.push(`/catalog?q=${encodeURIComponent(value.trim())}`);
  };

  return (
    <section className={cn("flex h-12 w-full items-stretch gap-3", className)}>
      <Button
        asChild
        variant="secondary"
        className="h-12 w-40 shrink-0 rounded-lg border border-chrome-input-border bg-bg-elevated px-5 text-[16px] font-normal leading-5 text-fg shadow-none ring-0 hover:bg-bg-elevated"
      >
        <a href="/catalog">
          <SlidersHorizontal className="size-6" strokeWidth={1.5} aria-hidden="true" />
          {tCatalog("title")}
        </a>
      </Button>
      <SearchInput
        onSearchChange={onSubmit}
        placeholder={t("search.placeholder")}
        className="h-12 flex-1"
        iconClassName="left-6 size-6"
        inputClassName="h-12 rounded-lg border-chrome-input-border bg-bg-elevated px-14 text-[16px] leading-5"
      />
    </section>
  );
}

export function HomePriceView({ className }: HomeHeroProps) {
  const t = useTranslations("home");
  const [view, setView] = useState<"wholesale" | "retail">("wholesale");

  return (
    <SegmentedTabs
      value={view}
      onValueChange={(value) => setView(value as "wholesale" | "retail")}
      aria-label={t("priceView.label")}
      className={cn("h-12 w-full", className)}
    >
      <SegmentedTabsList className="grid h-12 w-full grid-cols-2 rounded-full border border-chrome-input-border bg-bg-muted p-1">
        <SegmentedTabsTrigger
          value="wholesale"
          className="h-10 rounded-full border border-transparent bg-transparent text-[16px] font-normal leading-5 text-fg-muted hover:bg-transparent data-[state=active]:border-chrome-input-border data-[state=active]:bg-bg-elevated data-[state=active]:text-fg"
        >
          {t("priceView.wholesale")}
        </SegmentedTabsTrigger>
        <SegmentedTabsTrigger
          value="retail"
          className="h-10 rounded-full border border-transparent bg-transparent text-[16px] font-normal leading-5 text-fg-muted hover:bg-transparent data-[state=active]:border-chrome-input-border data-[state=active]:bg-bg-elevated data-[state=active]:text-fg"
        >
          {t("priceView.retail")}
        </SegmentedTabsTrigger>
      </SegmentedTabsList>
    </SegmentedTabs>
  );
}
