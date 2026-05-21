import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { ErrorState } from "@/components/feedback";
import { fetchCategories } from "@/features/category/api/categories.server";
import { fetchSellerCompanies } from "@/features/seller/api/company-onboarding.server";
import { fetchSellerProducts } from "@/features/seller/api/products.server";
import { ProductForm } from "@/features/seller/components/products/ProductForm";

interface SellerProductEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function SellerProductEditPage({
  params,
}: SellerProductEditPageProps) {
  const t = await getTranslations("seller.dashboard.products.form");
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isFinite(productId) || productId <= 0) notFound();

  const [{ companies }, { categories, error: categoriesError }] = await Promise.all([
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
  if (categoriesError) {
    return (
      <ErrorState
        title={t("categoryErrorTitle")}
        description={t("categoryErrorDescription")}
        correlationId={categoriesError.correlationId}
      />
    );
  }

  // Backend doesn't expose a per-id GET for sellers — pull the seller's
  // product page and find the entry there. Adequate for v1; if catalogs
  // grow large we'll add a dedicated endpoint.
  const myProducts = await fetchSellerProducts({
    page: 1,
    perPage: 200,
    companyId: company.id,
  });
  if (myProducts.error) {
    return (
      <ErrorState
        title={t("loadErrorTitle")}
        description={t("loadErrorDescription")}
        correlationId={myProducts.error.correlationId}
      />
    );
  }
  const product = myProducts.items.find((p) => p.id === productId);
  if (!product) notFound();

  const initialValues = {
    name: product.name,
    shortDescription: product.shortDescription ?? "",
    description: product.description ?? "",
    categoryId: product.categoryId,
    priceType: product.priceType,
    price: typeof product.price === "string"
      ? Number(product.price)
      : (product.price ?? 0),
    currency: product.currency,
    regionId: product.regionId,
    districtId: product.districtId ?? 0,
    attributes: (product.attributes ?? {}) as Record<string, unknown>,
  };

  return (
    <section
      aria-labelledby="seller-product-edit-title"
      className="flex flex-col gap-6"
    >
      <h2
        id="seller-product-edit-title"
        className="text-h3 font-semibold text-fg"
      >
        {t("editTitle", { name: product.name })}
      </h2>
      <ProductForm
        mode="edit"
        productId={product.id}
        companyId={company.id}
        categories={categories}
        initialValues={initialValues}
      />
    </section>
  );
}
