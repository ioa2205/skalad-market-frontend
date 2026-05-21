/**
 * Client-safe barrel for the seller feature.
 *
 * Server-only fetchers (`company-onboarding.server.ts`) are NOT re-exported
 * here — pulling them through the barrel would force the `"server-only"`
 * import into client modules that touch any of these symbols (error
 * boundaries, the wizard, etc.). Server components import them directly
 * from `./api/company-onboarding.server`.
 */
export { sellerKeys } from "./api/queryKeys";
export type {
  SellerLeadsListParams,
  SellerProductsListParams,
} from "./api/queryKeys";
export {
  createCompany,
  submitCompanyVerification,
  updateCompany,
  uploadCompanyCover,
  uploadCompanyLogo,
} from "./api/company-onboarding.client";
export { SellerHeader } from "./components/SellerHeader";
export { SellerTabsNav } from "./components/SellerTabsNav";
export { CompanyStatusBanner } from "./components/CompanyStatusBanner";
export { SellerRouteError } from "./components/SellerRouteError";
export { OnboardingWizard } from "./components/onboarding/OnboardingWizard";
export {
  CompanyStepProfileSchema,
  CompanyStepContactSchema,
  CompanyStepBrandingSchema,
  CompanyWizardSchema,
  toCompanyRequestDTO,
  type CompanyStepBrandingValues,
  type CompanyStepContactValues,
  type CompanyStepProfileValues,
  type CompanyWizardValues,
} from "./schemas/companyForm";
