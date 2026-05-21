import { http, HttpResponse } from "msw";

import { TEST_GATEWAY } from "./auth";

const successPayload = {
  success: true,
  data: {
    content: [
      { id: 1, nameUz: "Materiallar", nameRu: "Материалы", nameEn: "Materials", slug: "materials", isActive: true },
      { id: 2, nameUz: "Tekstil", nameRu: "Текстиль", nameEn: "Textile", slug: "textile", isActive: true },
      { id: 3, nameUz: "Quruvchilik", nameRu: "Строй материалы", nameEn: "Building", slug: "stroy", isActive: true },
      { id: 4, nameUz: "Kimyo", nameRu: "Химическое сырьё", nameEn: "Chemicals", slug: "chemicals", isActive: true },
    ],
    number: 0,
    size: 20,
    totalElements: 4,
    totalPages: 1,
  },
};

/**
 * `/api/v1/category` is PUBLIC (backend §3.4) — no auth needed.
 *
 * The proxy route test (`app/api/proxy/[...path]/route.test.ts`) uses two
 * special bearer values to drive its scenarios:
 *  - `Bearer expired` → 401 (triggers the proxy refresh dance)
 *  - everything else (incl. no auth) → 200, exercising the happy path
 */
export const categoryHandlers = [
  http.get(`${TEST_GATEWAY}/api/v1/category`, ({ request }) => {
    const auth = request.headers.get("authorization") ?? "";
    if (auth === "Bearer expired") {
      return HttpResponse.json(
        { success: false, message: "token.expired" },
        { status: 401 },
      );
    }
    return HttpResponse.json(successPayload);
  }),
  http.get(`${TEST_GATEWAY}/api/v1/category/:slug`, ({ params }) => {
    const slug = String(params.slug);
    if (slug === "missing") {
      return HttpResponse.json(
        { success: false, message: "category.not.found" },
        { status: 404 },
      );
    }
    return HttpResponse.json({
      success: true,
      data: {
        id: 1,
        nameUz: "Materiallar",
        nameRu: "Материалы",
        nameEn: "Materials",
        slug,
        isActive: true,
      },
    });
  }),
];
