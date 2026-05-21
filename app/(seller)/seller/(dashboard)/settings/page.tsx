import { getTranslations } from "next-intl/server";

import { ErrorState } from "@/components/feedback";
import {
  fetchSellerCompanies,
  fetchSellerCompanyBySlug,
} from "@/features/seller/api/company-onboarding.server";
import { CompanyProfileCard } from "@/features/seller/components/settings/CompanyProfileCard";
import { TariffPlanCards } from "@/features/seller/components/settings/TariffPlanCards";

export default async function SellerSettingsPage() {
  const t = await getTranslations("seller.dashboard.settings");
  const { companies } = await fetchSellerCompanies();
  const short = companies[0];
  if (!short) {
    return (
      <ErrorState
        title={t("noCompanyTitle")}
        description={t("noCompanyDescription")}
      />
    );
  }
  const { company, error } = await fetchSellerCompanyBySlug(short.slug);
  if (error || !company) {
    return (
      <ErrorState
        title={t("loadErrorTitle")}
        description={t("loadErrorDescription")}
        correlationId={error?.correlationId}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <CompanyProfileCard company={company} />
      <TariffPlanCards />
    </div>
  );
}
