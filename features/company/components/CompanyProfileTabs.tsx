"use client";

import { useTranslations } from "next-intl";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useCompanyProfileParams } from "../hooks/useCompanyProfileParams";

import { CompanyProductsTab } from "./CompanyProductsTab";
import { CompanyReviewsTab } from "./CompanyReviewsTab";

export interface CompanyProfileTabsProps {
  /** Optional product count rendered next to the tab label. Backend doesn't
   * yet expose a per-company products count, so this is only shown when a
   * caller has the number on hand. */
  productsCount?: number | null;
  /** Optional review count rendered next to the tab label. Reviews aren't in
   * scope of the current backend; left wired so the figma layout slots in
   * cleanly when the API ships. */
  reviewsCount?: number | null;
}

const TABS_LIST_CLASSNAME =
  "h-auto justify-start gap-6 rounded-none bg-transparent p-0 text-fg-muted border-b border-border";

const TABS_TRIGGER_CLASSNAME =
  "rounded-none bg-transparent px-0 pb-3 pt-0 text-body font-medium border-b-2 border-transparent shadow-none data-[state=active]:bg-transparent data-[state=active]:text-fg data-[state=active]:border-primary-500 data-[state=active]:shadow-none";

export function CompanyProfileTabs({
  productsCount,
  reviewsCount,
}: CompanyProfileTabsProps = {}) {
  const t = useTranslations("company.profile.tabs");
  const [params, setParams] = useCompanyProfileParams();

  const productsLabel =
    typeof productsCount === "number"
      ? t("productsWithCount", { count: productsCount })
      : t("products");
  const reviewsLabel =
    typeof reviewsCount === "number"
      ? t("reviewsWithCount", { count: reviewsCount })
      : t("reviews");

  return (
    <Tabs
      value={params.tab}
      onValueChange={(next) => {
        if (next === "products" || next === "reviews") {
          void setParams({ tab: next });
        }
      }}
      className="flex flex-col gap-4"
    >
      <TabsList className={TABS_LIST_CLASSNAME}>
        <TabsTrigger value="products" className={TABS_TRIGGER_CLASSNAME}>
          {productsLabel}
        </TabsTrigger>
        <TabsTrigger value="reviews" className={TABS_TRIGGER_CLASSNAME}>
          {reviewsLabel}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="products">
        <CompanyProductsTab />
      </TabsContent>
      <TabsContent value="reviews">
        <CompanyReviewsTab />
      </TabsContent>
    </Tabs>
  );
}
