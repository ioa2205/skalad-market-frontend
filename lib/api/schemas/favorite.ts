import { z } from "zod";

export const FavoriteToggleResponse = z.object({
  favorited: z.boolean(),
});
export type FavoriteToggleResponse = z.infer<typeof FavoriteToggleResponse>;
