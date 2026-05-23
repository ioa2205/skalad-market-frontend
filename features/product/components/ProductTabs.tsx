"use client";

import { useTranslations } from "next-intl";
import { useQueryState } from "nuqs";
import type { ReactNode } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils/cn";

export type ProductTabKey = "description" | "attributes" | "delivery" | "reviews";

const ORDER: ReadonlyArray<ProductTabKey> = [
  "description",
  "attributes",
  "delivery",
  "reviews",
];

function isTabKey(value: string | null): value is ProductTabKey {
  return value !== null && (ORDER as ReadonlyArray<string>).includes(value);
}

export interface ProductTabsProps {
  description: ReactNode;
  attributes: ReactNode;
  delivery: ReactNode;
  reviews: ReactNode;
  className?: string;
}

export function ProductTabs({
  description,
  attributes,
  delivery,
  reviews,
  className,
}: ProductTabsProps) {
  const t = useTranslations("productDetail.tabs");

  const [tab, setTab] = useQueryState("tab", {
    defaultValue: "description",
    history: "replace",
  });
  const active: ProductTabKey = isTabKey(tab) ? tab : "description";

  const panels: Record<ProductTabKey, ReactNode> = {
    description,
    attributes,
    delivery,
    reviews,
  };

  return (
    <Tabs
      value={active}
      onValueChange={(value) => {
        if (isTabKey(value)) {
          // Default to clearing the param when on the default tab.
          void setTab(value === "description" ? null : value);
        }
      }}
      className={cn("flex flex-col gap-4", className)}
    >
      <TabsList className="h-auto justify-start gap-6 rounded-none border-b border-chrome-input-border bg-transparent p-0 text-mod-meta">
        {ORDER.map((key) => (
          <TabsTrigger
            key={key}
            value={key}
            className="-mb-px rounded-none border-b-2 border-transparent px-0 pb-3 pt-0 text-body font-normal text-mod-meta data-[state=active]:border-primary-600 data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:shadow-none data-[state=active]:text-primary-600"
          >
            {t(key)}
          </TabsTrigger>
        ))}
      </TabsList>
      {ORDER.map((key) => (
        <TabsContent key={key} value={key}>
          {panels[key]}
        </TabsContent>
      ))}
    </Tabs>
  );
}
