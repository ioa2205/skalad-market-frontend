import { z } from "zod";

import { GeneralStatusEnum, RolesEnum } from "./enums";

const nullableStringAsEmpty = z
  .string()
  .nullable()
  .optional()
  .transform((value) => value ?? "");

export const UsersDTO = z.object({
  firstName: nullableStringAsEmpty,
  lastName: nullableStringAsEmpty,
  position: nullableStringAsEmpty,
  telegram: nullableStringAsEmpty,
  extraPhone: nullableStringAsEmpty,
});
export type UsersDTO = z.infer<typeof UsersDTO>;

export const UsersUpdateRequestDTO = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  position: z.string(),
  telegram: z.string(),
  extraPhone: z.string(),
});
export type UsersUpdateRequestDTO = z.infer<typeof UsersUpdateRequestDTO>;

export const UsersResponse = z.object({
  id: z.number(),
  name: z.string(),
  username: z.string(),
  status: GeneralStatusEnum,
  warningCount: z.number().nullable().optional(),
  roles: RolesEnum,
  createdDate: z.string(),
});
export type UsersResponse = z.infer<typeof UsersResponse>;

export const AdminUserDetailResponse = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  fullName: z.string(),
  username: z.string(),
  position: z.string().optional(),
  telegram: z.string().optional(),
  extraPhone: z.string().optional(),
  status: GeneralStatusEnum,
  roles: RolesEnum,
  warningCount: z.number().nullable().optional(),
  createdDate: z.string(),
  modifiedDate: z.string().optional(),
});
export type AdminUserDetailResponse = z.infer<typeof AdminUserDetailResponse>;

export const AttachDTO = z.object({
  id: z.string(),
  url: z.string(),
});
export type AttachDTO = z.infer<typeof AttachDTO>;

export const UserPhotoDTO = z.object({
  photoId: z.string(),
});
export type UserPhotoDTO = z.infer<typeof UserPhotoDTO>;
