"use client";

import Image from "next/image";
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
  { id: 1, x: 60, y: 55, label: "Листовая сталь 3мм" },
  { id: 2, x: 75, y: 35, label: "Оцинкованный рулон" },
  { id: 3, x: 22, y: 30, label: "Профильная труба" },
  { id: 4, x: 14, y: 60, label: "Арматура" },
  { id: 5, x: 50, y: 80, label: "Кирпич полнотелый" },
  { id: 6, x: 88, y: 60, label: "Бетон В25" },
];

// Hard-coded coordinates around Tashkent + neighbouring regions. The backend
// has no geo endpoint for products yet — these stand in until one ships so
// the Leaflet surface looks production-ready when the flag is on.
const LEAFLET_PINS: LeafletMapPin[] = [
  { id: 1, lat: 41.2995, lng: 69.2401, label: "Листовая сталь 3мм", body: "Ташкент · стуб данных" },
  { id: 2, lat: 41.3111, lng: 69.2797, label: "Оцинкованный рулон", body: "Юнусабад · стуб данных" },
  { id: 3, lat: 41.2755, lng: 69.2034, label: "Профильная труба", body: "Чиланзар · стуб данных" },
  { id: 4, lat: 41.2486, lng: 69.2032, label: "Арматура", body: "Сергели · стуб данных" },
  { id: 5, lat: 39.6542, lng: 66.9597, label: "Кирпич полнотелый", body: "Самарканд · стуб данных" },
  { id: 6, lat: 39.7747, lng: 64.4286, label: "Бетон В25", body: "Бухара · стуб данных" },
];

const LEAFLET_CENTER = { lat: 41.2995, lng: 69.2401 };

/**
 * Static SVG stand-in for the catalog map. The real provider lands in Phase 10
 * once a geo endpoint exposes pin coordinates — until then we render fixed
 * decorative pins from `STUB_PINS` so the surface has the same composition as
 * Figma `catalog_2.png` / `catalog_3.png`.
 */
export function CatalogMapStub() {
  const t = useTranslations("catalog.map");

  if (featureFlags.leafletMap) {
    return (
      <section
        aria-label={t("surfaceLabel")}
        className="relative w-full overflow-hidden rounded-lg border border-border bg-bg-elevated"
      >
        <div className="border-b border-border px-4 py-3">
          <p className="text-body font-semibold text-fg">{t("surfaceTitle")}</p>
        </div>
        <LeafletMap
          center={LEAFLET_CENTER}
          zoom={6}
          pins={LEAFLET_PINS}
          ariaLabel={t("surfaceLabel")}
        />
      </section>
    );
  }

  return (
    <section
      aria-label={t("surfaceLabel")}
      className="relative h-[789px] w-full overflow-hidden rounded-[12px] bg-bg-elevated p-4"
    >
      <div className="pb-[29px] pt-3">
        <p className="text-[17px] font-semibold leading-[21px] text-chrome-strong">{t("surfaceTitle")}</p>
      </div>
      <div className="relative h-[698px] w-full overflow-hidden rounded-[16px] bg-catalog-map-muted">
        <Image
          src="/catalog-map-preview.png"
          alt=""
          fill
          priority
          sizes="(min-width: 768px) 889px, 100vw"
          className="object-cover"
        />

        {STUB_PINS.map((pin) => (
          <Popover key={pin.id}>
            <PopoverTrigger
              aria-label={t("pinLabel", { id: pin.id })}
              className="absolute flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-transparent text-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
              style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
            >
              {pin.id}
            </PopoverTrigger>
            <PopoverContent side="left" className="w-64 p-3 text-body-sm">
              <p className="font-semibold text-fg">{pin.label}</p>
              <p className="mt-1 text-fg-muted">шт./мин · стуб данных</p>
            </PopoverContent>
          </Popover>
        ))}
      </div>
    </section>
  );
}
