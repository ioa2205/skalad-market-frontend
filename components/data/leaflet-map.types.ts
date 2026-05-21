export interface LeafletMapPin {
  id: number | string;
  lat: number;
  lng: number;
  label: string;
  body?: string;
}

export interface LeafletMapProps {
  center: { lat: number; lng: number };
  zoom?: number;
  pins: LeafletMapPin[];
  /** Pixel height of the map container. Defaults to 520. */
  height?: number;
  /** Overrides the default `region` label for the surface. */
  ariaLabel?: string;
}
