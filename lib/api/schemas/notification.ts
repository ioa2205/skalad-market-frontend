import { z } from "zod";

import { isoDateTimeSchema } from "./common";
import { PushPlatformEnum } from "./enums";

export const NotificationResponse = z.object({
  id: z.number(),
  type: z.string(),
  payload: z.record(z.string(), z.unknown()),
  sent_at: isoDateTimeSchema,
  read_at: isoDateTimeSchema.nullable().optional(),
});
export type NotificationResponse = z.infer<typeof NotificationResponse>;

/**
 * `in_app` is snake_case via `@JsonProperty`; `push` and `email` ride camelCase
 * (single-word, no override).
 */
export const NotificationPreferences = z.object({
  in_app: z.boolean(),
  push: z.boolean(),
  email: z.boolean(),
});
export type NotificationPreferences = z.infer<typeof NotificationPreferences>;

export const NotificationMarkReadRequest = z
  .object({
    notification_ids: z.array(z.number()).optional(),
    mark_all: z.boolean().optional(),
  })
  .refine((v) => !!v.mark_all || !!v.notification_ids?.length, {
    message: "mark.read.payload.empty",
  });
export type NotificationMarkReadRequest = z.infer<typeof NotificationMarkReadRequest>;

export const PushTokenRequest = z.object({
  token: z.string().min(1),
  platform: PushPlatformEnum,
});
export type PushTokenRequest = z.infer<typeof PushTokenRequest>;
