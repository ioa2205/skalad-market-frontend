import { z } from "zod";

import { isFullNameComplete, splitFullName } from "./splitName";

/**
 * Form-layer zod schemas. These shape what the UI captures; mappers in
 * `./mappers.ts` convert them to the wire DTOs in `lib/api/schemas/auth.ts`.
 *
 * Validation messages are i18n keys — the form layer feeds them through
 * `useTranslations("auth.validation")`.
 */

export const LOGIN_METHODS = ["PHONE", "EMAIL"] as const;
export type LoginMethod = (typeof LOGIN_METHODS)[number];

export const REGISTER_ROLES = ["BUYER", "SELLER"] as const;
export type RegisterRole = (typeof REGISTER_ROLES)[number];

const phoneRegex = /^\+?[0-9 ()\-]{7,20}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const LoginFormSchema = z
  .object({
    method: z.enum(LOGIN_METHODS),
    username: z.string(),
    password: z.string().min(1, "auth.validation.passwordRequired"),
  })
  .superRefine((value, ctx) => {
    const trimmed = value.username.trim();
    if (value.method === "PHONE") {
      if (trimmed.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["username"],
          message: "auth.validation.phoneRequired",
        });
      } else if (!phoneRegex.test(value.username)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["username"],
          message: "auth.validation.phoneInvalid",
        });
      }
    } else {
      if (trimmed.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["username"],
          message: "auth.validation.emailRequired",
        });
      } else if (!emailRegex.test(value.username)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["username"],
          message: "auth.validation.emailInvalid",
        });
      }
    }
  });
export type LoginFormValues = z.infer<typeof LoginFormSchema>;

export const RegisterFormSchema = z
  .object({
    role: z.enum(REGISTER_ROLES),
    fullName: z
      .string()
      .min(1, "auth.validation.nameRequired")
      .refine(isFullNameComplete, "auth.validation.nameTwoWords"),
    companyName: z.string(),
    phone: z
      .string()
      .refine(
        (value) => value.trim().length === 0 || phoneRegex.test(value.trim()),
        "auth.validation.phoneInvalid",
      ),
    email: z
      .string()
      .min(1, "auth.validation.emailRequired")
      .regex(emailRegex, "auth.validation.emailInvalid"),
    password: z
      .string()
      .min(1, "auth.validation.passwordRequired")
      .min(8, "auth.validation.passwordMin"),
  })
  .superRefine((value, ctx) => {
    if (value.role === "SELLER" && value.companyName.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["companyName"],
        message: "auth.validation.companyRequiredForSeller",
      });
    }
  });
export type RegisterFormValues = z.infer<typeof RegisterFormSchema>;

export const ResetRequestFormSchema = z.object({
  email: z
    .string()
    .min(1, "auth.validation.emailRequired")
    .regex(emailRegex, "auth.validation.emailInvalid"),
});
export type ResetRequestFormValues = z.infer<typeof ResetRequestFormSchema>;

export const ResetConfirmFormSchema = z
  .object({
    username: z.string().min(1, "auth.validation.usernameRequired"),
    code: z.string().regex(/^\d{6}$/, "auth.validation.codeFormat"),
    newPassword: z
      .string()
      .min(1, "auth.validation.passwordRequired")
      .min(8, "auth.validation.passwordMin"),
    confirmPassword: z.string().min(1, "auth.validation.passwordRequired"),
  })
  .superRefine((value, ctx) => {
    if (value.newPassword !== value.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "auth.validation.passwordMismatch",
      });
    }
  });
export type ResetConfirmFormValues = z.infer<typeof ResetConfirmFormSchema>;

/**
 * Form-to-wire mappers. Backend `RegistrationDTO` requires firstName + lastName
 * separately; we split the single "Имя" field at the form layer.
 */
export interface RegistrationWirePayload {
  role: RegisterRole;
  body: {
    firstName: string;
    lastName: string;
    username: string;
    password: string;
  };
  intent: {
    role: RegisterRole;
    companyName?: string;
    phone?: string;
  };
}

export function toRegistrationWire(values: RegisterFormValues): RegistrationWirePayload {
  const { firstName, lastName } = splitFullName(values.fullName);
  const intent: RegistrationWirePayload["intent"] = { role: values.role };
  if (values.role === "SELLER" && values.companyName.trim().length > 0) {
    intent.companyName = values.companyName.trim();
  }
  if (values.phone.trim().length > 0) {
    intent.phone = values.phone.trim();
  }
  return {
    role: values.role,
    body: {
      firstName,
      lastName,
      username: values.email.trim(),
      password: values.password,
    },
    intent,
  };
}
