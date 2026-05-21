import { z } from "zod";

import {
  ReasonCodeEnum,
  type ReasonCode,
  type TargetType,
} from "@/lib/api/schemas/enums";

export const REPORT_REASON_CODES: readonly ReasonCode[] = [
  "SAME",
  "FAKE",
  "OFFENSIVE",
  "DUPLICATE",
  "SCAM",
] as const;

export const REPORT_TARGET_TYPES: readonly TargetType[] = [
  "PRODUCT",
  "COMPANY",
  "CHAT",
] as const;

/**
 * RHF-friendly form schema. `reasonCode` accepts the empty string as the
 * "nothing picked yet" state so that the radio group can render unselected on
 * mount; validation forces a real enum value before submit.
 */
export const ReportFormSchema = z.object({
  reasonCode: ReasonCodeEnum.or(z.literal("")).refine(
    (v): v is ReasonCode => v !== "",
    { message: "reasonRequired" },
  ),
  comment: z
    .string()
    .max(500, { message: "commentMax" })
    .optional()
    .transform((v) => {
      if (!v) return undefined;
      const trimmed = v.trim();
      return trimmed.length > 0 ? trimmed : undefined;
    }),
});

export type ReportFormValues = z.input<typeof ReportFormSchema>;
export type ReportFormParsed = z.output<typeof ReportFormSchema>;

export const REPORT_FORM_DEFAULTS: ReportFormValues = {
  reasonCode: "",
  comment: "",
};
