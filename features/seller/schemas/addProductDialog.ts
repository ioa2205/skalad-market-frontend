import { z } from "zod";

import { SaleTypeEnum } from "@/lib/api/schemas/enums";

/**
 * Modal-specific Add Product form. Matches the figma exactly:
 * Wholesale/Retail toggle + name + category + unit + price + min order +
 * description + photos. Currency is fixed to UZS and price type to FIXED
 * here — the verbose `/seller/products/new` page form still exists for
 * sellers who need the full control surface.
 *
 * `unit` is stored in the product's `attributes` bag because the backend has
 * no top-level unit field.
 */

export const UNIT_OPTIONS = [
  "TON",
  "KG",
  "PIECE",
  "M",
  "M2",
  "M3",
  "L",
  "PACK",
] as const;
export type UnitOption = (typeof UNIT_OPTIONS)[number];

const positiveNumber = (key: string) =>
  z.preprocess(
    (value) => {
      if (typeof value === "string") {
        const trimmed = value.trim();
        if (trimmed === "") return undefined;
        const parsed = Number(trimmed.replace(",", "."));
        return Number.isFinite(parsed) ? parsed : value;
      }
      return value;
    },
    z.number({ invalid_type_error: key }).positive(key),
  );

export const AddProductDialogSchema = z.object({
  saleType: SaleTypeEnum,
  name: z.string().trim().min(2, "addProduct.validation.nameRequired"),
  categoryId: z
    .number({ invalid_type_error: "addProduct.validation.categoryRequired" })
    .int()
    .positive("addProduct.validation.categoryRequired"),
  unit: z.enum(UNIT_OPTIONS, {
    errorMap: () => ({ message: "addProduct.validation.unitRequired" }),
  }),
  price: positiveNumber("addProduct.validation.priceRequired"),
  minProduct: positiveNumber("addProduct.validation.minOrderRequired"),
  description: z
    .string()
    .trim()
    .min(1, "addProduct.validation.descriptionRequired"),
});
export type AddProductDialogValues = z.infer<typeof AddProductDialogSchema>;

export const DEFAULT_ADD_PRODUCT_VALUES: AddProductDialogValues = {
  saleType: "WHOLESALE",
  name: "",
  categoryId: 0,
  unit: "TON",
  price: 0,
  minProduct: 1,
  description: "",
};
