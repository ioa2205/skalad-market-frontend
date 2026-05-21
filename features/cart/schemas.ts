import { z } from "zod";

import { CurrencyEnum } from "@/lib/api/schemas";

export const MAX_CART_QTY = 99_999;

export const CartItem = z.object({
  productId: z.number(),
  slug: z.string(),
  name: z.string(),
  companyId: z.number(),
  companyName: z.string().optional(),
  primaryImage: z.string().optional(),
  unitPrice: z.number().nullable(),
  currency: CurrencyEnum,
  qty: z.number().int().positive().max(MAX_CART_QTY),
});
export type CartItem = z.infer<typeof CartItem>;

export const CartStateV1 = z.object({
  items: z.array(CartItem),
});
export type CartStateV1 = z.infer<typeof CartStateV1>;
