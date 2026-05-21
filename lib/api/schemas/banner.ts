import { z } from "zod";

export const BannerResponse = z.object({
  id: z.number(),
  imageUrl: z.string(),
});
export type BannerResponse = z.infer<typeof BannerResponse>;

export const BannersListResponse = z.array(BannerResponse);
export type BannersListResponse = z.infer<typeof BannersListResponse>;
