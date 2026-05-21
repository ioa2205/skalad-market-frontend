import { z, type ZodSchema } from "zod";

export function apiResponseSchema<T>(dataSchema: ZodSchema<T>) {
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
