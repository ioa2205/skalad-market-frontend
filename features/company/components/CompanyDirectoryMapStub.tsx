"use client";

import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";

import { LeafletMap, type LeafletMapPin } from "@/components/data/leaflet-map";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { featureFlags } from "@/lib/featureFlags";

interface StubPin {
  id: number;
  x: number;
  y: number;
  label: string;
}

const STUB_PINS: StubPin[] = [
  { id: 1, x: 35, y: 45, label: "UzMetal Pro" },
  { id: 2, x: 55, y: 35, label: "Asia Steel Group" },
  { id: 3, x: 30, y: 60, label: "Metal Trade LLC" },
  { id: 4, x: 70, y: 50, label: "BuildKaz LLP" },
  { id: 5, x: 50, y: 75, label: "Алтын Цемент" },
];

// Coordinates around Tashkent. CompanyResponseDTO doesn't expose lat/lng, so
// these are stand-ins until the backend exposes them on the public DTO.
const LEAFLET_BASE: Omit<LeafletMapPin, "body">[] = [
  { id: 1, lat: 41.3220, lng: 69.2680, label: "UzMetal Pro" },
  { id: 2, lat: 41.2920, lng: 69.2200, label: "Asia Steel Group" },
  { id: 3, lat: 41.2680, lng: 69.2050, label: "Metal Trade LLC" },
  { id: 4, lat: 41.3150, lng: 69.3050, label: "BuildKaz LLP" },
  { id: 5, lat: 41.2820, lng: 69.2480, label: "Алтын Цемент" },
];

const LEAFLET_CENTER = { lat: 41.2995, lng: 69.2401 };

/**
 * Static SVG stand-in for the company directory map. There is no
 * geo-search endpoint and `CompanyResponseDTO` doesn't expose `lat/lng`,
 * so pins are decorative until Phase 10 (or until backend exposes
 * coordinates, whichever lands first).
 */
export function CompanyDirectoryMapStub() {
  const t = useTranslations("company.directory.map");
  const stubBody = t("stubBody");
  const leafletPins: LeafletMapPin[] = LEAFLET_BASE.map((pin) => ({
    ...pin,
    body: stubBody,
  }));

  if (featureFlags.leafletMap) {
    return (
      <section
        aria-label={t("surfaceLabel")}
        className="relative w-full overflow-hidden rounded-lg border border-border bg-bg-elevated"
      >
        <div className="relative flex items-center border-b border-border px-4 py-3">
          <p className="text-body font-semibold text-fg">
            {t("surfaceTitle")}
          </p>
          <button
            type="button"
            aria-disabled="true"
            onClick={(event) => event.preventDefault()}
            className="absolute left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-body-sm text-fg-muted hover:bg-bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            {t("regionTashkent")}
            <ChevronDown aria-hidden="true" className="size-4" />
          </button>
        </div>
        <LeafletMap
          center={LEAFLET_CENTER}
          zoom={11}
          pins={leafletPins}
          ariaLabel={t("surfaceLabel")}
        />
      </section>
    );
  }

  return (
    <section
      aria-label={t("surfaceLabel")}
      className="relative h-[520px] w-full overflow-hidden rounded-lg border border-border bg-bg-elevated"
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <p className="text-body font-semibold text-fg">{t("surfaceTitle")}</p>
        <button
          type="button"
          aria-disabled="true"
          onClick={(event) => event.preventDefault()}
          className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-body-sm text-fg-muted hover:bg-bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        >
          {t("regionTashkent")}
          <ChevronDown aria-hidden="true" className="size-4" />
        </button>
      </div>
      <div className="relative h-[calc(100%-49px)] w-full bg-bg-muted">
        <svg
          aria-hidden="true"
          className="absolute inset-0 h-full w-full text-border-strong/40"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern
              id="company-grid"
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
          <rect width="100" height="100" fill="url(#company-grid)" />
          <path
            d="M0 60 Q 30 50 50 65 T 100 55"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <path
            d="M0 30 Q 20 40 45 32 T 100 28"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          />
        </svg>

        {STUB_PINS.map((pin) => (
          <Popover key={pin.id}>
            <PopoverTrigger
              aria-label={t("pinLabel", { id: pin.id })}
              className="absolute flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary-500 text-caption font-bold text-fg-on-primary shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
              style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
            >
              {pin.id}
            </PopoverTrigger>
            <PopoverContent side="top" className="w-56 p-3 text-body-sm">
              <p className="font-semibold text-fg">{pin.label}</p>
              <p className="mt-1 text-fg-muted">{stubBody}</p>
            </PopoverContent>
          </Popover>
        ))}
      </div>
    </section>
  );
}
