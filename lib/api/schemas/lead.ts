import { z } from "zod";

import { LeadSourceEnum, LeadStatusEnum } from "./enums";

/**
 * Lead-service DTOs are camelCase on the wire (no `@JsonProperty` overrides
 * server-side — see backend_summary §3.6). Don't snake_case these.
 */
export const LeadCreateRequest = z
  .object({
    source: LeadSourceEnum,
    productIds: z.array(z.number()).optional(),
    productId: z.number().optional(),
    contactName: z.string().min(1),
    contactPhone: z.string().min(1),
    comment: z.string().optional(),
  })
  .refine(
    (value) =>
      (value.source === "CART" && !!value.productIds?.length) ||
      (value.source === "PRODUCT" && typeof value.productId === "number"),
    { message: "invalid.lead.source.payload" },
  );
export type LeadCreateRequest = z.infer<typeof LeadCreateRequest>;

export const LeadStatusUpdateRequest = z.object({
  status: LeadStatusEnum,
  closeReason: z.string().optional(),
});
export type LeadStatusUpdateRequest = z.infer<typeof LeadStatusUpdateRequest>;

export const LeadItem = z.object({
  productId: z.number(),
  productNameSnapshot: z.string(),
  priceSnapshot: z.union([z.string(), z.number()]),
  quantity: z.number(),
});
export type LeadItem = z.infer<typeof LeadItem>;

export const LeadResponse = z.object({
  id: z.number(),
  buyerId: z.number(),
  sellerId: z.number(),
  companyId: z.number(),
  source: LeadSourceEnum,
  status: LeadStatusEnum,
  contactName: z.string(),
  contactPhone: z.string(),
  comment: z.string().optional().nullable(),
  closeReason: z.string().optional().nullable(),
  items: z.array(LeadItem),
});
export type LeadResponse = z.infer<typeof LeadResponse>;
