import { describe, expect, it } from "vitest";

import { featureFlags } from "../featureFlags";

describe("featureFlags", () => {
  it("defaults the leaflet flag to false when env var is unset", () => {
    // vitest.setup.ts does not set NEXT_PUBLIC_FEATURE_LEAFLET_MAP
    expect(featureFlags.leafletMap).toBe(false);
  });
});
