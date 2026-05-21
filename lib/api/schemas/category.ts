import { z } from "zod";

import { DataTypeEnum } from "./enums";

export const CategoryResponse = z.object({
  id: z.number(),
  nameUz: z.string(),
  nameRu: z.string(),
  nameEn: z.string(),
  slug: z.string(),
  icon: z.string().optional().nullable(),
  sortOrder: z.number().optional().nullable(),
  isActive: z.boolean(),
});
export type CategoryResponse = z.infer<typeof CategoryResponse>;

export const CategoryCreateRequest = z.object({
  parentId: z.number().optional().nullable(),
  nameUz: z.string().min(1),
  nameRu: z.string().min(1),
  nameEn: z.string().min(1),
  slug: z.string().min(1),
  icon: z.string().optional(),
  sortOrder: z.number().optional(),
  isActive: z.boolean().default(true),
});
export type CategoryCreateRequest = z.infer<typeof CategoryCreateRequest>;

export const CategoryUpdateRequest = CategoryCreateRequest;
export type CategoryUpdateRequest = z.infer<typeof CategoryUpdateRequest>;

export const CategoryAttributeCreateRequest = z.object({
  code: z.string().min(1),
  label: z.string().min(1),
  dataType: DataTypeEnum,
  isRequired: z.boolean().default(false),
  isFilterable: z.boolean().default(false),
  optionsJson: z.string().optional(),
  sortOrder: z.number().optional(),
});
export type CategoryAttributeCreateRequest = z.infer<typeof CategoryAttributeCreateRequest>;

export const CategoryAttributeResponse = CategoryAttributeCreateRequest.extend({
  id: z.number(),
});
export type CategoryAttributeResponse = z.infer<typeof CategoryAttributeResponse>;
