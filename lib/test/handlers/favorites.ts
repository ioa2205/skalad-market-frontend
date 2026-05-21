import { http, HttpResponse } from "msw";

import { TEST_GATEWAY } from "./auth";

const PROXY = "http://localhost:3000/api/proxy/api/v1/favorites";
const GATEWAY = `${TEST_GATEWAY}/api/v1/favorites`;

const sample = (overrides: Record<string, unknown>) => ({
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

const okPage = (page: number, perPage: number) =>
  HttpResponse.json(
    {
      success: true,
      data: {
        items: [sample({ id: 42 }), sample({ id: 43, slug: "rulon", name: "Оцинкованный рулон" })],
        meta: { total: 2, page, perPage, totalPages: 1 },
      },
    },
    { headers: { "x-request-id": "req-test-favorites-list" } },
  );

const errorResponse = (status: number, message: string, requestId: string) =>
  HttpResponse.json(
    { success: false, message },
    { status, headers: { "x-request-id": requestId } },
  );

export const favoritesHandlers = [
  // Gateway-direct (used by RSC server fetcher tests if any).
  http.get(GATEWAY, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? "1");
    const perPage = Number(url.searchParams.get("perPage") ?? "20");
    return okPage(page, perPage);
  }),

  // Proxy (used by `useFavoritedIds` + tests for the page render).
  http.get(PROXY, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? "1");
    const perPage = Number(url.searchParams.get("perPage") ?? "200");
    return okPage(page, perPage);
  }),

  http.post(`${PROXY}/:productId`, ({ params }) => {
    if (params.productId === "999-error") {
      return errorResponse(500, "favorites.toggle.failed", "req-test-fav-error");
    }
    return HttpResponse.json(
      { success: true, data: { favorited: true } },
      { headers: { "x-request-id": "req-test-fav-add" } },
    );
  }),

  http.delete(`${PROXY}/:productId`, ({ params }) => {
    if (params.productId === "999-error") {
      return errorResponse(500, "favorites.toggle.failed", "req-test-fav-error");
    }
    return HttpResponse.json(
      { success: true, data: { favorited: false } },
      { headers: { "x-request-id": "req-test-fav-del" } },
    );
  }),
];
