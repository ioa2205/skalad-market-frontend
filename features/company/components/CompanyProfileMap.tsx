import { ChevronDown, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";

import { LeafletMap } from "@/components/data/leaflet-map";
import { featureFlags } from "@/lib/featureFlags";

export interface CompanyProfileMapProps {
  /** Used as the pin's tooltip and aria label. */
  address: string;
  lat?: string | null;
  lng?: string | null;
  /** Anchor id for the map header CTA to scroll to. */
  anchorId?: string;
}

// Fallback used only when the backend omits or returns invalid coordinates.
const PROFILE_CENTER = { lat: 41.2995, lng: 69.2401 };

function toNumber(value: string | null | undefined): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function CompanyProfileMap({
  address,
  lat,
  lng,
  anchorId = "company-profile-map",
}: CompanyProfileMapProps) {
  const t = useTranslations("company.profile.map");
  const tDir = useTranslations("company.directory.map");
  const parsedLat = toNumber(lat);
  const parsedLng = toNumber(lng);
  const center =
    parsedLat !== null && parsedLng !== null
      ? { lat: parsedLat, lng: parsedLng }
      : PROFILE_CENTER;
  const hasCoordinates = parsedLat !== null && parsedLng !== null;

  if (featureFlags.leafletMap) {
    return (
      <section
        id={anchorId}
        aria-label={t("title")}
        className="overflow-hidden rounded-lg border border-border bg-bg-elevated"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-body font-semibold text-fg">{t("title")}</p>
          <button
            type="button"
            aria-disabled="true"
            onClick={(event) => event.preventDefault()}
            className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-body-sm text-fg-muted hover:bg-bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            {tDir("regionTashkent")}
            <ChevronDown aria-hidden="true" className="size-4" />
          </button>
        </div>
        <LeafletMap
          center={center}
          zoom={12}
          height={420}
          ariaLabel={t("title")}
          pins={[
            {
              id: anchorId,
              lat: center.lat,
              lng: center.lng,
              label: address,
            },
          ]}
        />
        {!hasCoordinates ? (
          <p className="border-t border-border px-4 py-2 text-caption text-fg-subtle">
            {t("stubNote")}
          </p>
        ) : null}
      </section>
    );
  }

  return (
    <section
      id={anchorId}
      aria-label={t("title")}
      className="overflow-hidden rounded-lg border border-border bg-bg-elevated"
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <p className="text-body font-semibold text-fg">{t("title")}</p>
        <button
          type="button"
          aria-disabled="true"
          onClick={(event) => event.preventDefault()}
          className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-body-sm text-fg-muted hover:bg-bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        >
          {tDir("regionTashkent")}
          <ChevronDown aria-hidden="true" className="size-4" />
        </button>
      </div>
      <div className="relative h-[420px] w-full bg-bg-muted">
        <svg
          aria-hidden="true"
          className="absolute inset-0 h-full w-full text-border-strong/40"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern
              id="profile-map-grid"
              width="10"
              height="10"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 10 0 L 0 0 0 10"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.4"
              />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#profile-map-grid)" />
          <path
            d="M0 60 Q 30 50 50 65 T 100 55"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          />
        </svg>
        <div
          className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-full flex-col items-center gap-1"
          role="img"
          aria-label={t("pinLabel", { address })}
        >
          <span className="flex size-10 items-center justify-center rounded-full bg-primary-500 text-fg-on-primary shadow-md">
            <MapPin aria-hidden="true" className="size-5" />
          </span>
          <span className="rounded bg-bg-elevated/90 px-2 py-0.5 text-caption text-fg shadow-sm">
            {address}
          </span>
        </div>
      </div>
      {!hasCoordinates ? (
        <p className="border-t border-border px-4 py-2 text-caption text-fg-subtle">
          {t("stubNote")}
        </p>
      ) : null}
    </section>
  );
}
