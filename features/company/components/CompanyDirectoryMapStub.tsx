"use client";

import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";

import { LeafletMap, type LeafletMapPin } from "@/components/data/leaflet-map";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { CompanyMapResponse } from "@/lib/api/schemas";
import { featureFlags } from "@/lib/featureFlags";

interface DisplayPin {
  id: number;
  x: number;
  y: number;
  label: string;
  body: string;
}

export interface CompanyDirectoryMapStubProps {
  entries: CompanyMapResponse[];
}

const LEAFLET_CENTER = { lat: 41.2995, lng: 69.2401 };

function numberFrom(value: string | null | undefined): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toLeafletPins(
  entries: CompanyMapResponse[],
  fallbackBody: string,
): LeafletMapPin[] {
  const pins: LeafletMapPin[] = [];
  entries.forEach((entry) => {
    const lat = numberFrom(entry.lat);
    const lng = numberFrom(entry.lng);
    if (lat === null || lng === null) return;
    pins.push({
      id: entry.companyId,
      lat,
      lng,
      label: entry.companyName,
      body: entry.companyAddress ?? fallbackBody,
    });
  });
  return pins;
}

function toDisplayPins(
  entries: CompanyMapResponse[],
  fallbackBody: string,
): DisplayPin[] {
  return entries.map((entry, index) => ({
    id: entry.companyId,
    x: 24 + (index % 4) * 17,
    y: 32 + (Math.floor(index / 4) % 4) * 14,
    label: entry.companyName,
    body: entry.companyAddress ?? fallbackBody,
  }));
}

export function CompanyDirectoryMapStub({ entries }: CompanyDirectoryMapStubProps) {
  const t = useTranslations("company.directory.map");
  const fallbackBody = t("stubBody");
  const leafletPins = toLeafletPins(entries, fallbackBody);
  const displayPins = toDisplayPins(entries, fallbackBody);
  const center = leafletPins[0]
    ? { lat: leafletPins[0].lat, lng: leafletPins[0].lng }
    : LEAFLET_CENTER;

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
            className="absolute left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-md border border-border px-3 py-1.5 text-body-sm text-fg-muted hover:bg-bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            {t("regionTashkent")}
            <ChevronDown aria-hidden="true" className="size-4" />
          </button>
        </div>
        <LeafletMap
          center={center}
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

        {displayPins.map((pin) => (
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
              <p className="mt-1 text-fg-muted">{pin.body}</p>
            </PopoverContent>
          </Popover>
        ))}
      </div>
    </section>
  );
}
