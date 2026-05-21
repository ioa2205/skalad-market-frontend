import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { Logo } from "@/components/brand";
import { OnboardingWizard } from "@/features/seller";
import { fetchSellerCompanies } from "@/features/seller/api/company-onboarding.server";

/**
 * Company-onboarding wizard. Sits *outside* the dashboard `(dashboard)`
 * route group so the dashboard layout doesn't gate-redirect us back here.
 *
 * - If the seller already has a non-DRAFT company, send them to the dashboard.
 * - Otherwise render the three-step wizard.
 */
export default async function SellerOnboardingPage() {
  const [{ companies }, t] = await Promise.all([
    fetchSellerCompanies(),
    getTranslations("seller.onboarding"),
  ]);

  const existing = companies[0];
  if (existing && existing.verificationStatus !== "DRAFT") {
    redirect("/seller/overview");
  }

  return (
    <main className="flex min-h-screen w-full flex-col bg-bg">
      <header className="border-b border-border bg-bg-elevated">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 py-5 md:px-6">
          <Logo variant="full" size="md" className="text-fg" />
          <span className="ml-auto text-caption text-fg-muted">
            {t("eyebrow")}
          </span>
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-10 md:px-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-h1 font-bold text-fg">{t("title")}</h1>
          <p className="text-body text-fg-muted">{t("description")}</p>
        </div>
        <OnboardingWizard
          {...(existing ? { initialValues: { name: existing.name } } : {})}
        />
      </section>
    </main>
  );
}
