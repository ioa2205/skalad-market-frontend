import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { AppShell } from "@/components/layout";
import {
  CompanyStatusBanner,
  SellerHeader,
  SellerTabsNav,
} from "@/features/seller";
import {
  fetchSellerCompanies,
  fetchSellerCompanyBySlug,
} from "@/features/seller/api/company-onboarding.server";

interface SellerDashboardLayoutProps {
  children: ReactNode;
}

const ONBOARDING_PATH = "/seller/onboarding";

/**
 * Server-side gate for the seller dashboard tabs (Обзор / Товары / Запросы /
 * Сообщения / Настройки). Lives under the `(dashboard)` route group so the
 * sibling onboarding wizard can render without this chrome (and without
 * looping when we redirect).
 *
 * 1. SELLER role check: handled upstream by `middleware.ts`.
 * 2. We fetch the seller's companies. No company OR DRAFT → push to
 *    onboarding wizard. Anything else renders the dashboard with the
 *    appropriate status banner.
 * 3. When the company is verified and can add products, we hydrate the full
 *    `CompanyResponseDTO` so the "Add Product" modal in the header has the
 *    seller's region/district defaults without doing a client-side fetch.
 */
export default async function SellerDashboardLayout({
  children,
}: SellerDashboardLayoutProps) {
  const { companies } = await fetchSellerCompanies();
  const company = companies[0];

  if (!company || company.verificationStatus === "DRAFT") {
    redirect(ONBOARDING_PATH);
  }

  const tabsEnabled = !company.isBlocked;
  const canAddProduct =
    !company.isBlocked && company.verificationStatus === "VERIFIED";

  // Only hydrate the full DTO when we'll actually offer the modal — saves
  // a request on the pending/rejected/blocked screens.
  let fullCompany: Awaited<
    ReturnType<typeof fetchSellerCompanyBySlug>
  >["company"] = null;
  if (canAddProduct) {
    const detail = await fetchSellerCompanyBySlug(company.slug);
    fullCompany = detail.company;
  }

  return (
    <AppShell>
      <CompanyStatusBanner
        status={company.verificationStatus}
        isBlocked={company.isBlocked}
      />
      <div className="mx-auto flex w-full max-w-screen-xl flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
        <SellerHeader
          canAddProduct={canAddProduct}
          companyId={fullCompany?.id ?? company.id}
          {...(fullCompany?.regionId !== undefined
            ? { companyRegionId: fullCompany.regionId }
            : {})}
          {...(fullCompany?.districtId !== undefined
            ? { companyDistrictId: fullCompany.districtId }
            : {})}
        />
        <SellerTabsNav enabled={tabsEnabled} />
        {children}
      </div>
    </AppShell>
  );
}
