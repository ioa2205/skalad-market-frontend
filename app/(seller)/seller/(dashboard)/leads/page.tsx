import { getTranslations } from "next-intl/server";

import { ErrorState } from "@/components/feedback";
import { fetchSellerCompanies } from "@/features/seller/api/company-onboarding.server";
import { fetchSellerLeads } from "@/features/seller/api/seller-leads.server";
import { SellerLeadsList } from "@/features/seller/components/leads/SellerLeadsList";

export default async function SellerLeadsPage() {
  const t = await getTranslations("seller.dashboard.leads");

  const { companies } = await fetchSellerCompanies();
  const company = companies[0];

  const result = await fetchSellerLeads({
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

  return <SellerLeadsList initialItems={result.items} />;
}
