import { z } from "zod";

export const RolesEnum = z.preprocess(
  (val) => (typeof val === "string" ? val.toUpperCase() : val),
  z.enum(["ADMIN", "SUPER_ADMIN", "BUYER", "SELLER", "MODERATOR"]),
);
export type Roles = z.infer<typeof RolesEnum>;

export const GeneralStatusEnum = z.enum(["IN_REGISTRATION", "ACTIVE", "BLOCK"]);
export type GeneralStatus = z.infer<typeof GeneralStatusEnum>;

export const AppLanguageEnum = z.enum(["UZ", "EN", "RU"]);
export type AppLanguage = z.infer<typeof AppLanguageEnum>;

export const VerificationStatusEnum = z.enum([
  "DRAFT",
  "PENDING_VERIFICATION",
  "VERIFIED",
  "REJECTED",
]);
export type VerificationStatus = z.infer<typeof VerificationStatusEnum>;

export const DataTypeEnum = z.enum(["TEXT", "NUMBER", "BOOLEAN", "SELECT"]);
export type DataType = z.infer<typeof DataTypeEnum>;

export const PriceTypeEnum = z.enum(["FIXED", "FROM_PRICE", "NEGOTIABLE"]);
export type PriceType = z.infer<typeof PriceTypeEnum>;

export const SaleTypeEnum = z.enum(["WHOLESALE", "RETAIL"]);
export type SaleType = z.infer<typeof SaleTypeEnum>;

export const PlacementCodeEnum = z.enum(["HOME_TOP", "HOME_MIDDLE", "SIDEBAR"]);
export type PlacementCode = z.infer<typeof PlacementCodeEnum>;

export const CurrencyEnum = z.enum(["UZS", "USD"]);
export type Currency = z.infer<typeof CurrencyEnum>;

export const ProductModerationStatusEnum = z.enum([
  "PENDING",
  "APPROVED",
  "REJECTED",
  "ARCHIVED",
]);
export type ProductModerationStatus = z.infer<typeof ProductModerationStatusEnum>;

export const ProductStatusEnum = z.enum(["DRAFT", "PENDING", "APPROVED", "ARCHIVED"]);
export type ProductStatus = z.infer<typeof ProductStatusEnum>;

export const LeadSourceEnum = z.enum(["PRODUCT", "CART"]);
export type LeadSource = z.infer<typeof LeadSourceEnum>;

export const LeadStatusEnum = z.enum(["NEW", "VIEWED", "CONTACTED", "CLOSED", "CANCELED"]);
export type LeadStatus = z.infer<typeof LeadStatusEnum>;

export const ChatParticipantTypeEnum = z.enum(["BUYER", "SELLER"]);
export type ChatParticipantType = z.infer<typeof ChatParticipantTypeEnum>;

export const PushPlatformEnum = z.enum(["ANDROID", "IOS"]);
export type PushPlatform = z.infer<typeof PushPlatformEnum>;

export const ReportStatusEnum = z.enum(["NEW", "RESOLVED", "REJECTED"]);
export type ReportStatus = z.infer<typeof ReportStatusEnum>;

export const TargetTypeEnum = z.enum(["PRODUCT", "COMPANY", "CHAT"]);
export type TargetType = z.infer<typeof TargetTypeEnum>;

export const ReasonCodeEnum = z.enum(["SAME", "FAKE", "OFFENSIVE", "DUPLICATE", "SCAM"]);
export type ReasonCode = z.infer<typeof ReasonCodeEnum>;

export const EmailTypeEnum = z.enum([
  "REGISTRATION",
  "RESET_PASSWORD",
  "CONFIRM_RESET_PASSWORD",
]);
export type EmailType = z.infer<typeof EmailTypeEnum>;
