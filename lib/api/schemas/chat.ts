import { z } from "zod";

import { isoDateTimeSchema, moneyStringSchema } from "./common";
import { ChatParticipantTypeEnum } from "./enums";

/* ------------------------------------------------------------------ */
/* REST                                                                */
/* ------------------------------------------------------------------ */

export const ChatMessageResponse = z.object({
  id: z.number(),
  thread_id: z.number(),
  sender_id: z.number(),
  sender_type: ChatParticipantTypeEnum,
  body: z.string().nullable().optional(),
  attachment_key: z.string().nullable().optional(),
  attachment_url: z.string().nullable().optional(),
  sent_at: isoDateTimeSchema,
  delivered_at: isoDateTimeSchema.nullable().optional(),
  read_at: isoDateTimeSchema.nullable().optional(),
  status: z.string(),
});
export type ChatMessageResponse = z.infer<typeof ChatMessageResponse>;

export const ChatParticipantResponse = z.object({
  id: z.number(),
  type: ChatParticipantTypeEnum,
  display_name: z.string(),
  username: z.string().nullable().optional(),
  slug: z.string().nullable().optional(),
  avatar_url: z.string().nullable().optional(),
});
export type ChatParticipantResponse = z.infer<typeof ChatParticipantResponse>;

export const ChatLastMessageResponse = z.object({
  id: z.number(),
  body: z.string().nullable().optional(),
  attachment_url: z.string().nullable().optional(),
  sent_at: isoDateTimeSchema,
  status: z.string(),
});
export type ChatLastMessageResponse = z.infer<typeof ChatLastMessageResponse>;

export const ChatProductSummaryResponse = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  price: moneyStringSchema.nullable().optional(),
  currency: z.string().nullable().optional(),
  primary_image: z.string().nullable().optional(),
});
export type ChatProductSummaryResponse = z.infer<typeof ChatProductSummaryResponse>;

export const ChatThreadResponse = z.object({
  thread_id: z.number(),
  other_party: ChatParticipantResponse,
  last_message: ChatLastMessageResponse.nullable().optional(),
  unread_count: z.number(),
  product: ChatProductSummaryResponse.nullable().optional(),
});
export type ChatThreadResponse = z.infer<typeof ChatThreadResponse>;

export const ChatCreateRequest = z.object({
  seller_company_id: z.number().int().positive(),
  product_id: z.number().int().positive().optional(),
});
export type ChatCreateRequest = z.infer<typeof ChatCreateRequest>;

export const ChatCreateResponse = z.object({
  thread_id: z.number(),
  is_new: z.boolean(),
});
export type ChatCreateResponse = z.infer<typeof ChatCreateResponse>;

export const ChatUnreadCountResponse = z.object({
  unread_count: z.number(),
});
export type ChatUnreadCountResponse = z.infer<typeof ChatUnreadCountResponse>;

export const ChatUploadAttachmentResponse = z.object({
  attachment_key: z.string(),
  attachment_url: z.string(),
});
export type ChatUploadAttachmentResponse = z.infer<typeof ChatUploadAttachmentResponse>;

/**
 * Wire shape uses `@JsonProperty` snake_case (`ws_token`, `expires_in`).
 */
export const WsTokenResponse = z.object({
  ws_token: z.string(),
  expires_in: z.number(),
});
export type WsTokenResponse = z.infer<typeof WsTokenResponse>;

/* ------------------------------------------------------------------ */
/* WebSocket                                                           */
/* ------------------------------------------------------------------ */

export const WsClientEvent = z.union([
  z.object({ event: z.literal("subscribe"), thread_id: z.number() }),
  z.object({
    event: z.literal("message"),
    thread_id: z.number(),
    body: z.string().nullable().optional(),
    attachment_key: z.string().nullable().optional(),
  }),
  z.object({
    event: z.literal("read"),
    thread_id: z.number(),
    message_ids: z.array(z.number()),
  }),
  z.object({ event: z.literal("typing"), thread_id: z.number() }),
]);
export type WsClientEvent = z.infer<typeof WsClientEvent>;

export const WsErrorCodeEnum = z.enum(["bad_request", "rate_limited", "internal_error"]);
export type WsErrorCode = z.infer<typeof WsErrorCodeEnum>;

export const WsServerEvent = z.union([
  z.object({
    event: z.literal("new_message"),
    thread_id: z.number(),
    message: ChatMessageResponse,
  }),
  z.object({
    event: z.literal("read_receipt"),
    thread_id: z.number(),
    message_ids: z.array(z.number()),
    read_by: z.number(),
  }),
  z.object({
    event: z.literal("typing"),
    thread_id: z.number(),
    user_id: z.number(),
  }),
  z.object({
    event: z.literal("error"),
    code: WsErrorCodeEnum,
    message: z.string(),
  }),
]);
export type WsServerEvent = z.infer<typeof WsServerEvent>;
