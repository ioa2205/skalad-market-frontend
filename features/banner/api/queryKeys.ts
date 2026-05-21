import type { PlacementCode } from "@/lib/api/schemas";

export const bannerKeys = {
  all: ["banners"] as const,
  byPlacement: (code: PlacementCode) => [...bannerKeys.all, code] as const,
};
