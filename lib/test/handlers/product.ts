import { http, HttpResponse } from "msw";

import { TEST_GATEWAY } from "./auth";
import { sampleCompanyResponse, sampleProductDetail } from "./product-fixtures";

export const productHandlers = [
  http.get(`${TEST_GATEWAY}/api/v1/products/:slug`, ({ params }) => {
    const slug = String(params.slug);
    if (slug === "missing") {
      return HttpResponse.json(
        { success: false, message: "product.not.found" },
        { status: 404 },
      );
    }
    if (slug === "server-error") {
      return HttpResponse.json(
        { success: false, message: "internal.error" },
        { status: 500 },
      );
    }
    return HttpResponse.json({
      success: true,
      data: { ...sampleProductDetail, slug },
    });
  }),

  http.get(`${TEST_GATEWAY}/api/v1/companies/:slug`, ({ params }) => {
    const slug = String(params.slug);
    if (slug === "missing-company") {
      return HttpResponse.json(
        { success: false, message: "company.not.found" },
        { status: 404 },
      );
    }
    return HttpResponse.json({
      success: true,
      data: { ...sampleCompanyResponse, slug },
    });
  }),
];
