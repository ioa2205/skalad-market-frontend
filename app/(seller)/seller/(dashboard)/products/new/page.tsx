import { getTranslations } from "next-intl/server";

import { ErrorState } from "@/components/feedback";
import { fetchCategories } from "@/features/category/api/categories.server";
import { fetchSellerCompanies } from "@/features/seller/api/company-onboarding.server";
import { ProductForm } from "@/features/seller/components/products/ProductForm";

export default async function SellerProductNewPage() {
  const t = await getTranslations("seller.dashboard.products.form");
  const [{ companies }, { categories, error }] = await Promise.all([
    fetchSellerCompanies(),
    fetchCategories({ size: 50 }),
  ]);

  const company = companies[0];
  if (!company) {
    return (
      <ErrorState
        title={t("noCompanyTitle")}
        description={t("noCompanyDescription")}
      />
    );
  }
  if (error) {
    return (
      <ErrorState
        title={t("categoryErrorTitle")}
        description={t("categoryErrorDescription")}
        correlationId={error.correlationId}
      />
    );
  }

  return (
    <section
      aria-labelledby="seller-product-new-title"
      className="flex flex-col gap-6"
    >
      <h2
        id="seller-product-new-title"
        className="text-h3 font-semibold text-fg"
      >
        {t("createTitle")}
      </h2>
      <ProductForm
        mode="create"
        companyId={company.id}
        categories={categories}
      />
    </section>
  );
}
