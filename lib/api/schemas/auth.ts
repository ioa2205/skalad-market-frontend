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

export const ProfileDTO = z.object({
  firstName: z.string(),
  lastName: z.string(),
  username: z.string(),
  role: RolesEnum,
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
});
export type ProfileDTO = z.infer<typeof ProfileDTO>;

export const RefreshTokenDTO = z.object({
  refreshToken: z.string().min(1),
});
export type RefreshTokenDTO = z.infer<typeof RefreshTokenDTO>;

export const TokenResponseDTO = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  expires_in: z.number(),
});
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
