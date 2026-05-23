import { http, HttpResponse } from "msw";

import { TEST_GATEWAY } from "./auth";

export const sampleCompanyDetail = {
  id: 10,
  name: "UzMetal Pro",
  slug: "uzmetal-pro",
  status: "VERIFIED",
  regionId: 1,
  districtId: 1,
  address: "Tashkent, Uzbekistan",
  lat: "41.2995",
  lng: "69.2401",
} as const;

const requestId = (slug: string) => `req-test-company-${slug}`;

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
