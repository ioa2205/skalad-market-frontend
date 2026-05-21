/**
 * Build-time feature flags. Reading `process.env.*` directly (rather than at
 * runtime) lets Next inline the value into the client bundle for variables
 * prefixed with `NEXT_PUBLIC_`.
 *
 * Convention: flags are *additive* — a missing/undefined env var resolves to
 * `false` so production stays on the conservative path.
 */

function parseBool(raw: string | undefined): boolean {
  if (!raw) return false;
  return raw === "1" || raw.toLowerCase() === "true";
}

export const featureFlags = {
  /**
   * Phase 10 — swap the SVG map stub for a real Leaflet map. Pin coordinates
   * are still client-held (no geo endpoint exists) but the UI surface looks
   * production-ready when this is on. Defaults to off.
   */
  leafletMap: parseBool(process.env.NEXT_PUBLIC_FEATURE_LEAFLET_MAP),
} as const;

export type FeatureFlag = keyof typeof featureFlags;

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return featureFlags[flag];
}
