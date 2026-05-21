"use client";

import "leaflet/dist/leaflet.css";

import L from "leaflet";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
import { useTranslations } from "next-intl";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  ZoomControl,
} from "react-leaflet";

import type { LeafletMapPin, LeafletMapProps } from "./leaflet-map.types";

// Webpack/Next bundle the marker images by URL — re-bind them so Leaflet's
// default icon factory picks up the bundled paths instead of guessing relative
// URLs that don't exist in production.
const DefaultIcon = L.icon({
  iconRetinaUrl: (iconRetinaUrl as { src: string }).src ?? (iconRetinaUrl as unknown as string),
  iconUrl: (iconUrl as { src: string }).src ?? (iconUrl as unknown as string),
  shadowUrl: (shadowUrl as { src: string }).src ?? (shadowUrl as unknown as string),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

export function LeafletMapClient({
  center,
  zoom = 11,
  pins,
  height = 520,
  ariaLabel,
}: LeafletMapProps) {
  const t = useTranslations("maps.leaflet");

  return (
    <div
      role="region"
      aria-label={ariaLabel ?? t("regionLabel")}
      className="relative w-full overflow-hidden rounded-lg border border-border"
      style={{ height }}
    >
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        scrollWheelZoom={false}
        zoomControl={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution={t("attribution")}
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="topright" />
        {pins.map((pin: LeafletMapPin) => (
          <Marker key={pin.id} position={[pin.lat, pin.lng]}>
            <Popup>
              <p className="text-body-sm font-semibold text-fg">{pin.label}</p>
              {pin.body ? (
                <p className="mt-1 text-caption text-fg-muted">{pin.body}</p>
              ) : null}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
