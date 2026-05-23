import { z } from "zod";

import { RolesEnum } from "./enums";

export const RegistrationDTO = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  username: z.string().min(1),
  password: z.string().min(1),
});
export type RegistrationDTO = z.infer<typeof RegistrationDTO>;

export const LoginDTO = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});
export type LoginDTO = z.infer<typeof LoginDTO>;

const normalizeTokenFields = (val: unknown): unknown => {
  if (typeof val !== "object" || val === null) return val;
  const v = val as Record<string, unknown>;
  return {
    ...v,
    firstName: v.firstName ?? v.first_name ?? "",
    lastName: v.lastName ?? v.last_name ?? "",
    accessToken: v.accessToken ?? v.access_token,
    refreshToken: v.refreshToken ?? v.refresh_token,
    expiresIn:
      typeof v.expiresIn === "string"
        ? Number(v.expiresIn)
        : typeof v.expires_in === "string"
          ? Number(v.expires_in)
          : (v.expiresIn ?? v.expires_in),
  };
};

export const ProfileDTO = z.preprocess(
  normalizeTokenFields,
  z.object({
    firstName: z.string(),
    lastName: z.string(),
    username: z.string(),
    role: RolesEnum,
    accessToken: z.string(),
    refreshToken: z.string(),
    expiresIn: z.number(),
  }),
);
export type ProfileDTO = z.infer<typeof ProfileDTO>;

export const RefreshTokenDTO = z.object({
  refreshToken: z.string().min(1),
});
export type RefreshTokenDTO = z.infer<typeof RefreshTokenDTO>;

export const TokenResponseDTO = z.preprocess(
  (val) => {
    if (typeof val !== "object" || val === null) return val;
    const v = val as Record<string, unknown>;
    return {
      access_token: v.access_token ?? v.accessToken,
      refresh_token: v.refresh_token ?? v.refreshToken,
      expires_in:
        typeof v.expires_in === "string"
          ? Number(v.expires_in)
          : typeof v.expiresIn === "string"
            ? Number(v.expiresIn)
            : (v.expires_in ?? v.expiresIn),
    };
  },
  z.object({
    access_token: z.string(),
    refresh_token: z.string(),
    expires_in: z.number(),
  }),
);
export type TokenResponseDTO = z.infer<typeof TokenResponseDTO>;

export const ResetPasswordDTO = z.object({
  username: z.string().min(1),
});
export type ResetPasswordDTO = z.infer<typeof ResetPasswordDTO>;

export const UpdatePasswordDTO = z.object({
  username: z.string().min(1),
  confirmCode: z.string().min(1),
  newPassword: z.string().min(1),
});
export type UpdatePasswordDTO = z.infer<typeof UpdatePasswordDTO>;
