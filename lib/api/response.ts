import { z, type ZodType, type ZodTypeDef } from "zod";

export type ApiDataSchema<T> = ZodType<T, ZodTypeDef, any>;

export function apiResponseSchema<T>(dataSchema: ApiDataSchema<T>) {
  return z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    message: z.string().optional(),
  });
}

export const apiErrorEnvelopeSchema = z.object({
  success: z.literal(false),
  message: z.string().optional(),
  data: z.unknown().optional(),
});

export type ApiEnvelope<T> = {
  success: boolean;
  data?: T;
  message?: string;
};
