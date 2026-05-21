import { z } from "zod";

import type { CompanyRequestDTO } from "@/lib/api/schemas/company";

/**
 * Form schemas for the company onboarding wizard. Field-level zod messages
 * stay as i18n keys (`seller.onboarding.validation.*`) so the form layer can
 * resolve them via `next-intl` without having to plumb intl into the schema.
 */

const trimmedString = (key: string, min = 1) =>
  z
    .string()
    .transform((v) => v.trim())
    .pipe(z.string().min(min, key));

const stirSchema = trimmedString("seller.onboarding.validation.stirRequired", 1)
  .pipe(
    z
      .string()
      .regex(/^\d{9,14}$/u, "seller.onboarding.validation.stirFormat"),
  );

const phoneSchema = trimmedString("seller.onboarding.validation.phoneRequired").pipe(
  z
    .string()
    .regex(
      /^[+0-9()\-\s]{6,24}$/u,
      "seller.onboarding.validation.phoneFormat",
    ),
);

const optionalPhone = z
  .string()
  .transform((v) => v.trim())
  .optional()
  .refine(
    (value) => value === undefined || value === "" || /^[+0-9()\-\s]{6,24}$/u.test(value),
    "seller.onboarding.validation.phoneFormat",
  );

const optionalUrl = z
  .string()
  .transform((v) => v.trim())
  .optional()
  .refine(
    (value) => value === undefined || value === "" || value.length <= 200,
    "seller.onboarding.validation.websiteFormat",
  );

export const CompanyStepProfileSchema = z.object({
  name: trimmedString("seller.onboarding.validation.nameRequired", 2),
  shortDescription: z
    .string()
    .max(160, "seller.onboarding.validation.shortDescMax")
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .max(2000, "seller.onboarding.validation.descMax")
    .optional()
    .or(z.literal("")),
  stir: stirSchema,
});
export type CompanyStepProfileValues = z.infer<typeof CompanyStepProfileSchema>;

export const CompanyStepContactSchema = z.object({
  phonePrimary: phoneSchema,
  phoneSecondary: optionalPhone,
  website: optionalUrl,
  regionId: z
    .number({ invalid_type_error: "seller.onboarding.validation.regionRequired" })
    .int()
    .positive("seller.onboarding.validation.regionRequired"),
  districtId: z
    .number({ invalid_type_error: "seller.onboarding.validation.districtRequired" })
    .int()
    .positive("seller.onboarding.validation.districtRequired"),
  address: trimmedString("seller.onboarding.validation.addressRequired", 4),
});
export type CompanyStepContactValues = z.infer<typeof CompanyStepContactSchema>;

export const CompanyStepBrandingSchema = z.object({
  /** Carried in form state so we can preview after upload — not sent to backend. */
  logoUrl: z.string().optional(),
  coverFileName: z.string().optional(),
});
export type CompanyStepBrandingValues = z.infer<typeof CompanyStepBrandingSchema>;

export const CompanyWizardSchema = CompanyStepProfileSchema
  .and(CompanyStepContactSchema)
  .and(CompanyStepBrandingSchema);
export type CompanyWizardValues = z.infer<typeof CompanyWizardSchema>;

/**
 * Strips wizard-only fields and produces the wire `CompanyRequestDTO`
 * (camelCase, optional fields omitted when empty).
 */
export function toCompanyRequestDTO(
  values: CompanyWizardValues,
): CompanyRequestDTO {
  const dto: CompanyRequestDTO = {
    name: values.name,
    stir: values.stir,
    phonePrimary: values.phonePrimary,
    regionId: values.regionId,
    districtId: values.districtId,
    address: values.address,
  };
  if (values.shortDescription && values.shortDescription.length > 0) {
    dto.shortDescription = values.shortDescription;
  }
  if (values.description && values.description.length > 0) {
    dto.description = values.description;
  }
  if (values.phoneSecondary && values.phoneSecondary.length > 0) {
    dto.phoneSecondary = values.phoneSecondary;
  }
  if (values.website && values.website.length > 0) {
    dto.website = values.website;
  }
  return dto;
}
