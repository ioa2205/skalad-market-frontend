import { getTranslations } from "next-intl/server";

import { ErrorState } from "@/components/feedback";
import { fetchSellerCompanies } from "@/features/seller/api/company-onboarding.server";
import { fetchSellerProducts } from "@/features/seller/api/products.server";
import { SellerProductsList } from "@/features/seller/components/products/SellerProductsList";

export default async function SellerProductsPage() {
  const t = await getTranslations("seller.dashboard.products");

  const { companies } = await fetchSellerCompanies();
  const company = companies[0];

  const result = await fetchSellerProducts({
    page: 1,
    perPage: 50,
    ...(company?.id !== undefined ? { companyId: company.id } : {}),
  });

  if (result.error) {
    return (
      <ErrorState
        title={t("loadErrorTitle")}
        description={t("loadErrorDescription")}
        correlationId={result.error.correlationId}
      />
    );
  }

  return <SellerProductsList initialItems={result.items} />;
}
