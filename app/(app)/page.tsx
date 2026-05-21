import { getLocale, getTranslations } from "next-intl/server";

import { EmptyState, ErrorState } from "@/components/feedback";
import { BannerStrip } from "@/features/banner";
import { fetchBanners } from "@/features/banner/api/banners.server";
import { HomeHero, HomePriceView } from "@/features/catalog";
import { fetchHomepage } from "@/features/catalog/api/catalog.server";
import { CategoryQuickLinks, type CategoryLocale } from "@/features/category";
import { fetchCategories } from "@/features/category/api/categories.server";
import { PopularProducts, ProductCardSkeleton } from "@/features/product";

function isCategoryLocale(value: string): value is CategoryLocale {
  return value === "ru" || value === "en" || value === "uz";
}

export default async function HomePage() {
  const localeRaw = await getLocale();
  const locale = isCategoryLocale(localeRaw) ? localeRaw : "ru";
  const t = await getTranslations();

  const [topResult, middleResult, homepage, categoriesResult] = await Promise.all([
    fetchBanners("HOME_TOP"),
    fetchBanners("HOME_MIDDLE"),
    fetchHomepage(),
    fetchCategories({ size: 12 }),
  ]);

  const featured = homepage.data?.featuredProducts ?? [];
  const verifiedCompanyIds = homepage.data?.verifiedCompanies ?? [];

  return (
    <div className="flex w-full flex-col gap-10 bg-bg p-10">
      <HomeHero />

      <BannerStrip
        result={topResult}
        ariaLabel={t("home.banners.topAria")}
        emptyCells={4}
      />

      <HomePriceView />

      {homepage.error ? (
        <ErrorState
          title={t("feedback.errorDefault.title")}
          description={t("feedback.errorDefault.description")}
          correlationId={homepage.error.correlationId}
          correlationIdLabel={t("feedback.errorDefault.correlationId", {
            id: homepage.error.correlationId ?? "—",
          })}
        />
      ) : featured.length === 0 ? (
        <EmptyState
          title={t("home.popular.emptyTitle")}
          description={t("home.popular.emptyDescription")}
        />
      ) : (
        <PopularProducts
          products={featured}
          verifiedCompanyIds={verifiedCompanyIds}
        />
      )}

      {middleResult.banners.length > 0 ? (
        <BannerStrip
          result={middleResult}
          ariaLabel={t("home.banners.middleAria")}
          emptyCells={2}
          className="mt-0"
        />
      ) : null}

      <section className="flex flex-col gap-4">
        <h2 className="text-h3 font-semibold text-fg">
          {t("categoryExplorer.title")}
        </h2>
        {categoriesResult.error ? (
          <ErrorState
            title={t("feedback.errorDefault.title")}
            description={t("feedback.errorDefault.description")}
            correlationId={categoriesResult.error.correlationId}
            correlationIdLabel={t("feedback.errorDefault.correlationId", {
              id: categoriesResult.error.correlationId ?? "—",
            })}
          />
        ) : (
          <CategoryQuickLinks
            categories={categoriesResult.categories}
            locale={locale}
          />
        )}
      </section>
    </div>
  );
}

// Skeleton helper kept for IDE jump-to; rendered by app/(app)/loading.tsx.
export const _PopularSkeleton = function PopularSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
};
