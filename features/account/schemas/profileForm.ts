import { z } from "zod";

const TEXT_MAX = 200;

const trimmed = z.string().transform((value) => value.trim());

const required = (requiredMessage: string) =>
  trimmed
    .refine((value) => value.length > 0, { message: requiredMessage })
    .refine((value) => value.length <= TEXT_MAX, { message: "tooLong" });

/**
 * Mirrors `UsersUpdateRequestDTO`; all fields are required by the backend.
 */
export const ProfileFormSchema = z.object({
  firstName: required("firstNameRequired"),
  lastName: required("lastNameRequired"),
  position: required("positionRequired"),
  telegram: required("telegramRequired"),
  extraPhone: required("extraPhoneRequired"),
});

export type ProfileFormInput = z.input<typeof ProfileFormSchema>;
export type ProfileFormValues = z.output<typeof ProfileFormSchema>;
