import { z } from "zod";

import { VerificationStatusEnum } from "./enums";
import { ProductResponse } from "./product";

export const CompanyRequestDTO = z.object({
  name: z.string().min(1),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  stir: z.string().min(1),
  phonePrimary: z.string().min(1),
  phoneSecondary: z.string().optional(),
  website: z.string().optional(),
  regionId: z.number(),
  districtId: z.number(),
  address: z.string().min(1),
  lng: z.string().min(1),
  lat: z.string().min(1),
});
export type CompanyRequestDTO = z.infer<typeof CompanyRequestDTO>;

export const CompanyResponseDTO = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  shortDescription: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  coverUrl: z.string().optional().nullable(),
  stir: z.string(),
  phonePrimary: z.string(),
  phoneSecondary: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  regionId: z.number(),
  districtId: z.number(),
  address: z.string(),
  verificationStatus: VerificationStatusEnum,
  isBlocked: z.boolean().optional().nullable(),
  verifiedAt: z.string().optional().nullable(),
  createdAt: z.string(),
});
export type CompanyResponseDTO = z.infer<typeof CompanyResponseDTO>;

export const CompanyShortDTO = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  logoUrl: z.string().optional().nullable(),
  verificationStatus: VerificationStatusEnum,
  isBlocked: z.boolean(),
  createdAt: z.string(),
});
export type CompanyShortDTO = z.infer<typeof CompanyShortDTO>;

export const CompanySlugMapResponse = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  status: VerificationStatusEnum,
  regionId: z.number(),
  districtId: z.number(),
  address: z.string(),
  lat: z.string().optional().nullable(),
  lng: z.string().optional().nullable(),
});
export type CompanySlugMapResponse = z.infer<typeof CompanySlugMapResponse>;

export const CompanyMapResponse = z.object({
  companyId: z.number(),
  companyName: z.string(),
  companyAddress: z.string().optional().nullable(),
  slug: z.string(),
  lng: z.string().optional().nullable(),
  lat: z.string().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  verificationStatus: VerificationStatusEnum,
});
export type CompanyMapResponse = z.infer<typeof CompanyMapResponse>;

export const CompanyProductResponse = ProductResponse;
export type CompanyProductResponse = z.infer<typeof CompanyProductResponse>;

export const ModerationDecisionRequest = z.object({
  reasonCode: z.string().optional(),
  comment: z.string().optional(),
});
export type ModerationDecisionRequest = z.infer<typeof ModerationDecisionRequest>;

export const ReasonRequest = z.object({
  reason: z.string().optional(),
});
export type ReasonRequest = z.infer<typeof ReasonRequest>;
