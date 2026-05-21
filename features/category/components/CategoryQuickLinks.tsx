import { useTranslations } from "next-intl";
import Link from "next/link";

import type { CategoryResponse } from "@/lib/api/schemas";

import { localizedCategoryName } from "../utils/localized-name";

export interface CategoryQuickLinksProps {
  categories: CategoryResponse[];
  locale: "ru" | "en" | "uz";
  /** Limit visible chips on the home page. */
  limit?: number;
}

export function CategoryQuickLinks({
  categories,
  locale,
  limit = 8,
}: CategoryQuickLinksProps) {
  const t = useTranslations("categoryExplorer");

  if (categories.length === 0) {
    return (
      <p className="text-body-sm text-fg-muted">{t("empty")}</p>
    );
  }

  const visible = categories.slice(0, limit);
  return (
    <ul aria-label={t("title")} className="flex flex-wrap gap-2">
      {visible.map((category) => (
        <li key={category.id}>
          <Link
            href={`/catalog?category=${encodeURIComponent(category.slug)}`}
            className="inline-flex items-center rounded-full border border-border bg-bg-elevated px-4 py-2 text-body-sm font-medium text-fg hover:bg-bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            {localizedCategoryName(category, locale)}
          </Link>
        </li>
      ))}
    </ul>
  );
}
