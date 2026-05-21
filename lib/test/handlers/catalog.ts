import { http, HttpResponse } from "msw";

import { TEST_GATEWAY } from "./auth";

const sampleProduct = (overrides: Record<string, unknown>) => ({
  id: 1,
  companyId: 10,
  sellerId: 100,
  categoryId: 1,
  name: "Листовая сталь 3мм",
  slug: "list-stali-3mm",
  shortDescription: null,
  description: null,
  priceType: "FROM_PRICE",
  price: "520",
  currency: "USD",
  regionId: 1,
  districtId: null,
  attributes: null,
  status: "APPROVED",
  isActive: true,
  isPromoted: false,
  promotedUntil: null,
  rejectReason: null,
  viewsCountCache: 0,
  favoritesCountCache: 0,
  createdAt: "2026-01-01T00:00:00",
  images: [],
  ...overrides,
});

const homepageProducts = [
  sampleProduct({ id: 1, slug: "list-stali-3mm" }),
  sampleProduct({
    id: 2,
    name: "Оцинкованный рулон",
    slug: "rulon",
    companyId: 11,
    priceType: "FIXED",
    price: "910",
  }),
  sampleProduct({
    id: 3,
    name: "Профильная труба",
    slug: "truba",
    companyId: 12,
    priceType: "NEGOTIABLE",
    price: null,
  }),
];

export const catalogHandlers = [
  http.get(`${TEST_GATEWAY}/api/v1/catalog/homepage`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        featuredProducts: homepageProducts,
        newProducts: [],
        banners: [],
        topCategories: [1, 2, 3],
        verifiedCompanies: [10],
      },
    });
  }),

  http.get(`${TEST_GATEWAY}/api/v1/catalog`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? "1");
    const perPage = Number(url.searchParams.get("perPage") ?? "20");
    const category = url.searchParams.get("category") ?? "";

    if (category === "empty") {
      return HttpResponse.json({
        success: true,
        data: {
          items: [],
          meta: { total: 0, page, perPage, totalPages: 0 },
        },
      });
    }

    if (category === "server-error") {
      return HttpResponse.json(
        { success: false, message: "internal.error" },
        { status: 500 },
      );
    }

    return HttpResponse.json({
      success: true,
      data: {
        items: [sampleProduct({ id: 1 }), sampleProduct({ id: 2, slug: "p-2" })],
        meta: { total: 2, page, perPage, totalPages: 1 },
      },
    });
  }),

  http.get(`${TEST_GATEWAY}/api/v1/catalog/search/suggestions`, ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get("q") ?? "";
    return HttpResponse.json({
      success: true,
      data: {
        suggestions: q.length >= 2 ? [`${q}-один`, `${q}-два`] : [],
      },
    });
  }),

  http.get(`${TEST_GATEWAY}/api/v1/catalog/filters`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        minPrice: 100,
        maxPrice: 5000,
        regionIds: [1, 2, 3],
        attributes: {},
      },
    });
  }),

  // /catalog/saleType/product returns Spring's PageImpl (1-indexed `number`
  // mirrors the `page` query param in this service per backend_summary §4).
  http.get(`${TEST_GATEWAY}/api/v1/catalog/saleType/product`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? "1");
    const perPage = Number(url.searchParams.get("perPage") ?? "10");
    const saleType = url.searchParams.get("saleType");
    const items = saleType === "WHOLESALE" ? homepageProducts : homepageProducts.slice(0, 1);
    return HttpResponse.json({
      success: true,
      data: {
        content: items,
        number: page,
        size: perPage,
        totalElements: items.length,
        totalPages: 1,
      },
    });
  }),
];
