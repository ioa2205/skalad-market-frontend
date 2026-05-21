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
}

export const REGION_FIXTURES: RegionFixture[] = [
  {
    id: 1,
    i18nKey: "tashkent",
    districts: [
      { id: 101, i18nKey: "tashkentChilanzar" },
      { id: 102, i18nKey: "tashkentMirzoUlugbek" },
      { id: 103, i18nKey: "tashkentYunusobod" },
      { id: 104, i18nKey: "tashkentSergeli" },
    ],
  },
  {
    id: 2,
    i18nKey: "samarkand",
    districts: [
      { id: 201, i18nKey: "samarkandCenter" },
      { id: 202, i18nKey: "samarkandUrgut" },
    ],
  },
  {
    id: 3,
    i18nKey: "bukhara",
    districts: [
      { id: 301, i18nKey: "bukharaCenter" },
      { id: 302, i18nKey: "bukharaKagan" },
    ],
  },
  {
    id: 4,
    i18nKey: "ferghana",
    districts: [
      { id: 401, i18nKey: "ferghanaCenter" },
      { id: 402, i18nKey: "ferghanaKokand" },
    ],
  },
  {
    id: 5,
    i18nKey: "namangan",
    districts: [
      { id: 501, i18nKey: "namanganCenter" },
      { id: 502, i18nKey: "namanganChartak" },
    ],
  },
  {
    id: 6,
    i18nKey: "andijan",
    districts: [
      { id: 601, i18nKey: "andijanCenter" },
      { id: 602, i18nKey: "andijanAsaka" },
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
