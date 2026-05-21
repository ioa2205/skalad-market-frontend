"use client";

import { useTranslations } from "next-intl";

import type { CategoryResponse } from "@/lib/api/schemas";
import { cn } from "@/lib/utils/cn";

import { localizedCategoryName, type CategoryLocale } from "../utils/localized-name";

export interface CategoryTreeProps {
  categories: CategoryResponse[];
  locale: CategoryLocale;
  /** Currently selected slug, or null when "all categories" is active. */
  selectedSlug: string | null;
  onSelect: (slug: string | null) => void;
}

/**
 * Vertical list of category buttons used by the catalog filter sidebar
 * (Figma: catalog_1.png left column). Mirrors the radio-group accessibility
 * pattern: roving tabindex via Tab + Enter.
 */
export function CategoryTree({
  categories,
  locale,
  selectedSlug,
  onSelect,
}: CategoryTreeProps) {
  const t = useTranslations("catalog.filters");

  return (
    <ul className="flex flex-col gap-2">
      <li>
        <CategoryRow
          label={t("allCategories")}
          active={selectedSlug === null}
          onClick={() => onSelect(null)}
        />
      </li>
      {categories.map((category) => (
        <li key={category.id}>
          <CategoryRow
            label={localizedCategoryName(category, locale)}
            active={selectedSlug === category.slug}
            onClick={() => onSelect(category.slug)}
          />
        </li>
      ))}
    </ul>
  );
}

function CategoryRow({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex h-[38px] w-full items-center justify-between rounded-[8px] px-3 text-[15px] font-normal leading-[18px]",
        "transition-colors duration-fast ease-standard",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        active
          ? "bg-catalog-active text-primary-600 dark:bg-primary-950 dark:text-primary-200"
          : "text-chrome-strong hover:bg-bg-muted",
      )}
    >
      <span className="truncate">{label}</span>
    </button>
  );
}
