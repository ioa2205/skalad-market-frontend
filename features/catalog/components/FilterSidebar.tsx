"use client";

import { Filter } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  CategoryTree,
  type CategoryLocale,
} from "@/features/category";
import type { CategoryResponse } from "@/lib/api/schemas";
import { cn } from "@/lib/utils/cn";

import { useCatalogParams } from "../hooks/useCatalogParams";

export interface FilterSidebarProps {
  categories: CategoryResponse[];
  /** Region ids surfaced via /catalog/filters; labels are stubbed locally. */
  regions: number[];
  locale: CategoryLocale;
  className?: string;
}

const REGION_LABEL_KEYS = [
  "tashkent",
  "samarkand",
  "bukhara",
  "ferghana",
  "namangan",
  "andijan",
] as const;

export function FilterSidebar({
  categories,
  regions,
  locale,
  className,
}: FilterSidebarProps) {
  const t = useTranslations("catalog.filters");
  const tRegions = useTranslations("regionsStub");
  const [params, setParams] = useCatalogParams();

  const handleResetFilters = () => {
    void setParams({
      q: "",
      category: "",
      regionId: null,
      page: 1,
      perPage: 20,
      saleType: null,
      mode: "grid",
      inStock: false,
      verified: false,
    });
  };

  return (
    <aside
      aria-label={t("title")}
      className={cn(
        "flex min-h-[814px] w-full flex-col gap-4 rounded-[16px] border border-chrome-input-border bg-bg-elevated p-4",
        className,
      )}
    >
      <div className="flex items-center gap-3 text-[17px] font-semibold leading-[21px] text-chrome-strong">
        <Filter className="size-5 text-chrome-icon" aria-hidden="true" strokeWidth={1.75} />
        <span>{t("title")}</span>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-[15px] font-normal leading-[18px] text-chrome-strong">{t("categories")}</p>
        <CategoryTree
          categories={categories}
          locale={locale}
          selectedSlug={params.category || null}
          onSelect={(slug) =>
            setParams({ category: slug ?? "", page: 1 })
          }
        />
      </div>

      <div className="flex flex-col gap-3 pt-1">
        <p className="text-[15px] font-normal leading-[18px] text-chrome-strong">{t("price")}</p>
        <Input
          inputMode="numeric"
          placeholder={t("priceFrom")}
          aria-label={t("priceFrom")}
          readOnly
          className="h-12 rounded-[8px] border-catalog-control-border px-3 text-[15px] leading-[18px] placeholder:text-catalog-placeholder"
        />
        <Input
          inputMode="numeric"
          placeholder={t("priceTo")}
          aria-label={t("priceTo")}
          readOnly
          className="h-12 rounded-[8px] border-catalog-control-border px-3 text-[15px] leading-[18px] placeholder:text-catalog-placeholder"
        />
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-[15px] font-normal leading-[18px] text-chrome-strong">{t("regions")}</p>
        <Select
          value={params.regionId ? String(params.regionId) : "all"}
          onValueChange={(value) =>
            setParams({
              regionId: value === "all" ? null : Number(value),
              page: 1,
            })
          }
        >
          <SelectTrigger
            aria-label={t("regions")}
            className="h-12 rounded-[8px] border-catalog-control-border px-3 text-[15px] leading-[18px] text-chrome-strong data-[placeholder]:text-catalog-placeholder"
          >
            <SelectValue placeholder={t("allRegions")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allRegions")}</SelectItem>
            {regions.map((id, index) => (
              <SelectItem key={id} value={String(id)}>
                {tRegions(REGION_LABEL_KEYS[index % REGION_LABEL_KEYS.length]!)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <fieldset className="flex flex-col gap-3 pt-1">
        <legend className="sr-only">{t("toggles")}</legend>
        <ToggleRow
          id="catalog-inStock"
          label={t("inStockOnly")}
          checked={params.inStock}
          onCheckedChange={(value) => setParams({ inStock: value, page: 1 })}
        />
        <ToggleRow
          id="catalog-verified"
          label={t("verifiedOnly")}
          checked={params.verified}
          onCheckedChange={(value) => setParams({ verified: value, page: 1 })}
        />
      </fieldset>

      <Button
        variant="danger-soft"
        onClick={handleResetFilters}
        className="mt-[1px] h-12 w-full rounded-[12px] text-[16px] font-medium leading-[19px]"
      >
        {t("reset")}
      </Button>
    </aside>
  );
}

function ToggleRow({
  id,
  label,
  checked,
  onCheckedChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
}) {
  return (
    <label htmlFor={id} className="flex items-center justify-start gap-3 text-[15px] leading-[18px] text-chrome-strong">
      <span>{label}</span>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="order-first h-6 w-12 border-0 data-[state=unchecked]:bg-bg-muted"
      />
    </label>
  );
}
