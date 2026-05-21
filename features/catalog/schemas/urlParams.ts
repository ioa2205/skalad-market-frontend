import { z } from "zod";

import { SaleTypeEnum } from "@/lib/api/schemas";

export const ViewModeEnum = z.enum(["grid", "map"]);
export type ViewMode = z.infer<typeof ViewModeEnum>;

export const PerPageEnum = z.union([z.literal(10), z.literal(20), z.literal(50)]);
export type PerPage = z.infer<typeof PerPageEnum>;

const QSchema = z.string().trim().max(120);
const PageSchema = z.coerce.number().int().min(1).default(1);
const PerPageDefault = 20 as const;

export const CatalogParams = z.object({
  q: QSchema.optional().default(""),
  category: z.string().trim().max(120).optional().default(""),
  regionId: z.coerce.number().int().positive().optional(),
  page: PageSchema,
  perPage: z.coerce
    .number()
    .int()
    .pipe(PerPageEnum)
    .catch(PerPageDefault)
    .default(PerPageDefault),
  saleType: SaleTypeEnum.optional(),
  mode: ViewModeEnum.catch("grid").default("grid"),
  inStock: z.coerce.boolean().default(false),
  verified: z.coerce.boolean().default(false),
});
export type CatalogParams = z.infer<typeof CatalogParams>;

export const CatalogParamsDefaults: CatalogParams = {
  q: "",
  category: "",
  page: 1,
  perPage: PerPageDefault,
  mode: "grid",
  inStock: false,
  verified: false,
};
