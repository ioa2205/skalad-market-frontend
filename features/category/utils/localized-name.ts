import type { CategoryResponse } from "@/lib/api/schemas";

export type CategoryLocale = "ru" | "en" | "uz";

export function localizedCategoryName(
  category: Pick<CategoryResponse, "nameRu" | "nameEn" | "nameUz">,
  locale: CategoryLocale,
): string {
  if (locale === "en") return category.nameEn;
  if (locale === "uz") return category.nameUz;
  return category.nameRu;
}
