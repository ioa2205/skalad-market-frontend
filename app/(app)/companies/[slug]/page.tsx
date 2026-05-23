import { Building2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import {
  CompanyAboutCard,
  CompanyContactsCard,
  CompanyHeader,
  CompanyInfoCard,
  CompanyProfileMap,
  CompanyProfileTabs,
} from "@/features/company";
import {
  fetchCompanyDetail,
  fetchCompanyProducts,
} from "@/features/company/api/companies.server";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function CompanyProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const t = await getTranslations("company.profile");

  const [result, productsResult] = await Promise.all([
    fetchCompanyDetail(slug),
    fetchCompanyProducts({ slug }),
  ]);
  if (result.status === "not-found") notFound();
  if (result.status === "error" || !result.data) {
    throw Object.assign(new Error("company.detail.failed"), {
      digest: result.error?.correlationId,
    });
  }

  const company = result.data;
  const verified = company.status === "VERIFIED";
  const session = await getSession();
  const showSellerPanelCta = session?.roles.includes("SELLER") ?? false;

  return (
    <div className="mx-auto flex w-full max-w-screen-xl flex-col gap-6 px-4 py-6 md:px-6">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-h1 font-bold text-fg">{t("title")}</h1>
        {showSellerPanelCta ? (
          <Button variant="secondary" asChild>
            <Link href="/seller/onboarding">
              <Building2 aria-hidden="true" />
              {t("sellerPanelCta")}
            </Link>
          </Button>
        ) : null}
      </header>

      <CompanyHeader company={company} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="flex flex-col gap-4">
          <CompanyAboutCard
            description={null}
            stats={{
              rating: null,
              reviewsCount: null,
              productsCount: productsResult.totalElements,
            }}
          />
          <CompanyInfoCard
            location={company.address}
            industry={null}
            founded={null}
            productsCount={null}
          />
          <CompanyContactsCard
            phonePrimary={null}
            phoneSecondary={null}
            website={null}
          />
        </aside>

        <main className="flex flex-col gap-6">
          <CompanyProfileTabs
            products={productsResult.items}
            productsCount={productsResult.totalElements}
            companyName={company.name}
            verified={verified}
          />
          <CompanyProfileMap
            address={company.address}
            lat={company.lat}
            lng={company.lng}
          />
        </main>
      </div>
    </div>
  );
}
