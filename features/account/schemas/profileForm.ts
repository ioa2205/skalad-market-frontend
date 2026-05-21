import { z } from "zod";

const TEXT_MAX = 200;

const trimmed = z.string().transform((value) => value.trim());

const required = (requiredMessage: string) =>
  trimmed
    .refine((value) => value.length > 0, { message: requiredMessage })
    .refine((value) => value.length <= TEXT_MAX, { message: "tooLong" });

const optional = trimmed.refine((value) => value.length <= TEXT_MAX, {
  message: "tooLong",
});

/**
 * Mirrors `UsersUpdateRequestDTO` (firstName, lastName, position, telegram,
 * extraPhone — all required on the wire). Only the names are non-empty;
 * the optional fields ride as the empty string when the user clears them.
 */
export const ProfileFormSchema = z.object({
  firstName: required("firstNameRequired"),
  lastName: required("lastNameRequired"),
  position: optional,
  telegram: optional,
  extraPhone: optional,
});

export type ProfileFormInput = z.input<typeof ProfileFormSchema>;
export type ProfileFormValues = z.output<typeof ProfileFormSchema>;
