/**
 * Hardcoded region + district fixture.
 *
 * No backend exposes a public list of regions/districts (catalog filters
 * surface region *ids* but no labels, and the company-service request DTO
 * just takes raw `regionId`/`districtId` longs). Until we have a real
 * `/regions` endpoint, the seller-onboarding wizard and the company
 * settings form pick from this list.
 *
 * Ids are stable so saved companies keep referring to the same row when
 * we eventually swap in the real endpoint.
 *
 * TODO(backend): expose `GET /api/v1/regions` (and nested districts) so
 * we can drop this fixture.
 */
export interface RegionFixture {
  id: number;
  /** i18n key under `regionsStub.*` so existing copy is reused. */
  i18nKey: string;
  districts: DistrictFixture[];
}

export interface DistrictFixture {
  id: number;
  /** Resolved against `districtsStub.<i18nKey>`. */
  i18nKey: string;
  /** Approximate district center, used while the backend has no regions API. */
  lat: string;
  lng: string;
}

export const REGION_FIXTURES: RegionFixture[] = [
  {
    id: 1,
    i18nKey: "tashkent",
    districts: [
      { id: 101, i18nKey: "tashkentChilanzar", lat: "41.2814", lng: "69.2033" },
      { id: 102, i18nKey: "tashkentMirzoUlugbek", lat: "41.3268", lng: "69.3370" },
      { id: 103, i18nKey: "tashkentYunusobod", lat: "41.3667", lng: "69.2833" },
      { id: 104, i18nKey: "tashkentSergeli", lat: "41.2265", lng: "69.2197" },
    ],
  },
  {
    id: 2,
    i18nKey: "samarkand",
    districts: [
      { id: 201, i18nKey: "samarkandCenter", lat: "39.6542", lng: "66.9597" },
      { id: 202, i18nKey: "samarkandUrgut", lat: "39.4022", lng: "67.2431" },
    ],
  },
  {
    id: 3,
    i18nKey: "bukhara",
    districts: [
      { id: 301, i18nKey: "bukharaCenter", lat: "39.7747", lng: "64.4286" },
      { id: 302, i18nKey: "bukharaKagan", lat: "39.7228", lng: "64.5517" },
    ],
  },
  {
    id: 4,
    i18nKey: "ferghana",
    districts: [
      { id: 401, i18nKey: "ferghanaCenter", lat: "40.3842", lng: "71.7843" },
      { id: 402, i18nKey: "ferghanaKokand", lat: "40.5286", lng: "70.9425" },
    ],
  },
  {
    id: 5,
    i18nKey: "namangan",
    districts: [
      { id: 501, i18nKey: "namanganCenter", lat: "40.9983", lng: "71.6726" },
      { id: 502, i18nKey: "namanganChartak", lat: "41.0692", lng: "71.8237" },
    ],
  },
  {
    id: 6,
    i18nKey: "andijan",
    districts: [
      { id: 601, i18nKey: "andijanCenter", lat: "40.7821", lng: "72.3442" },
      { id: 602, i18nKey: "andijanAsaka", lat: "40.6415", lng: "72.2387" },
    ],
  },
];

export function findRegion(regionId: number): RegionFixture | undefined {
  return REGION_FIXTURES.find((region) => region.id === regionId);
}

export function findDistrict(
  regionId: number,
  districtId: number,
): DistrictFixture | undefined {
  return findRegion(regionId)?.districts.find(
    (district) => district.id === districtId,
  );
}
