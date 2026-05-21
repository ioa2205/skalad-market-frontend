"use client";

import dynamic from "next/dynamic";

import type { LeafletMapProps } from "./leaflet-map.types";

/**
 * Client-only Leaflet map. Loaded dynamically with `ssr: false` because the
 * underlying `react-leaflet` package touches `window` at import time.
 *
 * Render this from a client boundary that has already decided the feature
 * flag is on (`featureFlags.leafletMap`). Pin coordinates are still client
 * data — there is no geo endpoint.
 */
const LeafletMap = dynamic<LeafletMapProps>(
  () => import("./leaflet-map.client").then((mod) => mod.LeafletMapClient),
  {
    ssr: false,
    loading: () => (
      <div
        aria-busy="true"
        className="h-[520px] w-full animate-pulse rounded-lg border border-border bg-bg-muted"
      />
    ),
  },
);

export { LeafletMap };
export type { LeafletMapProps, LeafletMapPin } from "./leaflet-map.types";
