"use client";

import { useTranslations } from "next-intl";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type FavoritesTabValue = "products" | "companies";

export interface FavoritesTabsProps {
  active: FavoritesTabValue;
  onChange: (value: FavoritesTabValue) => void;
}

/**
 * Companies tab is a stub — `/favorites` only returns products. Backend has
 * no company-favorite endpoint (build-plan §1.1, Phase 4). The trigger is
 * disabled and wrapped in a tooltip that explains the gap.
 */
export function FavoritesTabs({ active, onChange }: FavoritesTabsProps) {
  const t = useTranslations("favorites.tabs");

  return (
    <Tabs
      value={active}
      onValueChange={(value) => {
        if (value === "companies") return;
        onChange(value as FavoritesTabValue);
      }}
    >
      <TabsList className="flex h-12 w-full p-1">
        <TabsTrigger value="products" className="flex-1 py-2">
          {t("products")}
        </TabsTrigger>
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <TabsTrigger value="companies" disabled className="flex-1 py-2">
                {t("companies")}
              </TabsTrigger>
            </TooltipTrigger>
            <TooltipContent>{t("companiesDisabledTooltip")}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TabsList>
    </Tabs>
  );
}
