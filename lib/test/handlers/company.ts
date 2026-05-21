import { http, HttpResponse } from "msw";

import { TEST_GATEWAY } from "./auth";

export const sampleCompanyDetail = {
  id: 10,
  name: "UzMetal Pro",
  slug: "uzmetal-pro",
  shortDescription: "Металлургия Ташкент",
  description:
    "Ведущий производитель металлопроката в Центральной Азии. Более 20 лет на рынке.",
  logoUrl: null,
  stir: "123456789",
  phonePrimary: "+998 90 123 45 67",
  phoneSecondary: null,
  website: "www.uzmetall.uz",
  regionId: 1,
  districtId: 1,
  address: "Ташкент, Узбекистан",
  verificationStatus: "VERIFIED",
  isBlocked: false,
  verifiedAt: "2025-12-01T00:00:00",
  createdAt: "2003-01-01T00:00:00",
} as const;

const requestId = (slug: string) => `req-test-company-${slug}`;

/**
 * Registered before the legacy product-fixtures `companies/:slug` handler
 * so this one wins for the dedicated profile tests. The product-detail
 * tests still pass because they hit different slugs (`uzmetal-pro` and
 * `missing-company` were the originals — both supported here).
 */
export const companyHandlers = [
  http.get(`${TEST_GATEWAY}/api/v1/companies/:slug`, ({ params }) => {
    const slug = String(params.slug);
    if (slug === "missing-company") {
      return HttpResponse.json(
        { success: false, message: "company.not.found" },
        { status: 404, headers: { "x-request-id": requestId(slug) } },
      );
    }
    if (slug === "server-error") {
      return HttpResponse.json(
        { success: false, message: "internal.error" },
        { status: 500, headers: { "x-request-id": requestId(slug) } },
      );
    }
    return HttpResponse.json(
      { success: true, data: { ...sampleCompanyDetail, slug } },
      { headers: { "x-request-id": requestId(slug) } },
    );
  }),
];
