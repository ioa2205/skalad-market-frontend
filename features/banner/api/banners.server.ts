import "server-only";

import { serverFetch } from "@/lib/api/server";
import {
  BannersListResponse,
  type BannerResponse,
  type PlacementCode,
} from "@/lib/api/schemas";
import { log } from "@/lib/log";

export interface BannerFetchResult {
  banners: BannerResponse[];
  error?: { code: string; correlationId?: string | undefined };
}

/**
 * Fetches a single placement; never throws — surfaces failure as `error` so
 * the page can still render the rest of the home above the strip.
 */
export async function fetchBanners(
  placementCode: PlacementCode,
): Promise<BannerFetchResult> {
  try {
    const banners = await serverFetch(
      `/api/v1/banners/getAll?placementCode=${placementCode}`,
      {
        schema: BannersListResponse,
        next: { revalidate: 60, tags: [`banners:${placementCode}`] },
      },
    );
    return { banners };
  } catch (error) {
    const err = error as { code?: string; correlationId?: string };
    log.warn("banners.fetch.failed", {
      placementCode,
      code: err.code ?? "unknown.error",
      correlationId: err.correlationId,
    });
    return {
      banners: [],
      error: {
        code: err.code ?? "unknown.error",
        correlationId: err.correlationId,
      },
    };
  }
}
