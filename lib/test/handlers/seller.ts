import { http, HttpResponse } from "msw";

import { TEST_GATEWAY } from "./auth";

const requestId = (label: string) => `req-test-seller-${label}`;

const sampleSellerCompanyShort = {
  id: 42,
  name: "Алтын Цемент",
  slug: "altyn-cement",
  logoUrl: null,
  verificationStatus: "VERIFIED" as const,
  isBlocked: false,
  createdAt: "2024-01-01T00:00:00",
};

const sampleSellerCompanyDetail = {
  ...sampleSellerCompanyShort,
  shortDescription: "Цемент М400 / М500",
  description: "Производство и оптовая поставка цемента и сухих смесей.",
  stir: "123456789",
  phonePrimary: "+998 90 123 45 67",
  phoneSecondary: null,
  website: "https://altyn-cement.uz",
  regionId: 1,
  districtId: 101,
  address: "Ташкент, Чиланзар, ул. Промышленная 1",
  verifiedAt: "2024-02-01T00:00:00",
} as const;

/**
 * Mode hooks for tests:
 *
 * - Default: a single VERIFIED company is returned, the layout proceeds to
 *   the dashboard.
 * - Header `x-test-seller-mode: empty`  → returns `[]` so onboarding kicks in.
 * - Header `x-test-seller-mode: pending` → returns one PENDING_VERIFICATION
 *   company so the banner shows.
 * - Header `x-test-seller-mode: error`  → returns 500 so the soft-fail path
 *   is exercised.
 */
function modeFromRequest(request: Request): string | null {
  return request.headers.get("x-test-seller-mode");
}

export const sellerHandlers = [
  http.get(`${TEST_GATEWAY}/api/v1/companies`, ({ request }) => {
    const mode = modeFromRequest(request);
    if (mode === "empty") {
      return HttpResponse.json(
        { success: true, data: [] },
        { headers: { "x-request-id": requestId("companies-empty") } },
      );
    }
    if (mode === "pending") {
      return HttpResponse.json(
        {
          success: true,
          data: [
            {
              ...sampleSellerCompanyShort,
              verificationStatus: "PENDING_VERIFICATION",
            },
          ],
        },
        { headers: { "x-request-id": requestId("companies-pending") } },
      );
    }
    if (mode === "error") {
      return HttpResponse.json(
        { success: false, message: "internal.error" },
        { status: 500, headers: { "x-request-id": requestId("companies-err") } },
      );
    }
    return HttpResponse.json(
      { success: true, data: [sampleSellerCompanyShort] },
      { headers: { "x-request-id": requestId("companies") } },
    );
  }),

  http.post(
    `${TEST_GATEWAY}/api/v1/companies/create`,
    async ({ request }) => {
      const mode = modeFromRequest(request);
      const body = (await request.json()) as Record<string, unknown>;

      if (mode === "validation") {
        return HttpResponse.json(
          { success: false, message: "company.validation.failed" },
          { status: 400, headers: { "x-request-id": requestId("create-400") } },
        );
      }

      return HttpResponse.json(
        {
          success: true,
          data: {
            ...sampleSellerCompanyDetail,
            verificationStatus: "DRAFT",
            name: (body.name as string) ?? sampleSellerCompanyDetail.name,
          },
        },
        {
          status: 201,
          headers: { "x-request-id": requestId("create") },
        },
      );
    },
  ),

  http.post(
    `${TEST_GATEWAY}/api/v1/companies/:id/logo`,
    ({ params }) =>
      HttpResponse.json(
        {
          success: true,
          data: { id: `logo-${params.id}`, url: `https://cdn.test/logo-${params.id}.png` },
        },
        { headers: { "x-request-id": requestId("logo") } },
      ),
  ),

  http.post(
    `${TEST_GATEWAY}/api/v1/companies/:id/coverUrl`,
    ({ params }) =>
      HttpResponse.json(
        {
          success: true,
          data: { id: `cover-${params.id}`, url: `https://cdn.test/cover-${params.id}.png` },
        },
        { headers: { "x-request-id": requestId("cover") } },
      ),
  ),

  http.post(
    `${TEST_GATEWAY}/api/v1/companies/:id/submit-verification`,
    () =>
      HttpResponse.json(
        { success: true, data: { status: "PENDING_VERIFICATION" } },
        { headers: { "x-request-id": requestId("submit") } },
      ),
  ),

  http.get(`${TEST_GATEWAY}/api/v1/products/my`, ({ request }) => {
    const mode = modeFromRequest(request);
    if (mode === "products-error") {
      return HttpResponse.json(
        { success: false, message: "internal.error" },
        { status: 500, headers: { "x-request-id": requestId("my-err") } },
      );
    }
    if (mode === "products-empty") {
      return HttpResponse.json(
        {
          success: true,
          data: {
            items: [],
            page: 1,
            per_page: 20,
            total_elements: 0,
            total_pages: 0,
          },
        },
        { headers: { "x-request-id": requestId("my-empty") } },
      );
    }
    return HttpResponse.json(
      {
        success: true,
        data: {
          items: sampleSellerProducts,
          page: 1,
          per_page: 20,
          total_elements: sampleSellerProducts.length,
          total_pages: 1,
        },
      },
      { headers: { "x-request-id": requestId("my") } },
    );
  }),

  http.post(`${TEST_GATEWAY}/api/v1/products`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      {
        success: true,
        data: { id: 9999, slug: `${(body.name as string) ?? "product"}-9999` },
      },
      { status: 201, headers: { "x-request-id": requestId("create-prod") } },
    );
  }),

  http.put(`${TEST_GATEWAY}/api/v1/products/:id`, async ({ params }) => {
    return HttpResponse.json(
      { success: true, data: { id: Number(params.id), slug: `slug-${params.id}` } },
      { headers: { "x-request-id": requestId("update-prod") } },
    );
  }),

  http.delete(`${TEST_GATEWAY}/api/v1/products/:id`, () =>
    HttpResponse.json(
      { success: true, data: { ok: true } },
      { headers: { "x-request-id": requestId("delete-prod") } },
    ),
  ),

  http.get(`${TEST_GATEWAY}/api/v1/leads/seller`, ({ request }) => {
    const mode = modeFromRequest(request);
    if (mode === "leads-error") {
      return HttpResponse.json(
        { success: false, message: "internal.error" },
        { status: 500, headers: { "x-request-id": requestId("seller-leads-err") } },
      );
    }
    if (mode === "leads-empty") {
      return HttpResponse.json(
        {
          success: true,
          data: {
            items: [],
            meta: { total: 0, page: 1, perPage: 20, totalPages: 0 },
          },
        },
        { headers: { "x-request-id": requestId("seller-leads-empty") } },
      );
    }
    return HttpResponse.json(
      {
        success: true,
        data: {
          items: sampleSellerLeads,
          meta: {
            total: sampleSellerLeads.length,
            page: 1,
            perPage: 20,
            totalPages: 1,
          },
        },
      },
      { headers: { "x-request-id": requestId("seller-leads") } },
    );
  }),

  http.put(
    `${TEST_GATEWAY}/api/v1/leads/:id/status`,
    async ({ request, params }) => {
      const body = (await request.json()) as Record<string, unknown>;
      return HttpResponse.json(
        {
          success: true,
          data: {
            ...sampleSellerLeads[0],
            id: Number(params.id),
            status: body.status,
            closeReason: body.closeReason ?? null,
          },
        },
        { headers: { "x-request-id": requestId("lead-status") } },
      );
    },
  ),
];

const sampleSellerProducts = [
  {
    id: 1001,
    companyId: 42,
    sellerId: 7,
    categoryId: 1,
    name: "Оцинкованный рулон",
    slug: "ocinkovannyy-rulon",
    shortDescription: "Asia Steel Group",
    description: "Лист 1.5мм, рулон 1000кг",
    priceType: "FROM_PRICE",
    price: "610",
    currency: "USD",
    regionId: 1,
    districtId: 1,
    attributes: {},
    status: "APPROVED",
    isActive: true,
    isPromoted: false,
    promotedUntil: null,
    rejectReason: null,
    viewsCountCache: 320,
    favoritesCountCache: 4,
    createdAt: "2026-01-01T00:00:00",
    images: [],
  },
  {
    id: 1002,
    companyId: 42,
    sellerId: 7,
    categoryId: 1,
    name: "Профильная труба",
    slug: "profilnaya-truba",
    shortDescription: "Asia Steel Group",
    description: "ГОСТ 30245-2003",
    priceType: "FROM_PRICE",
    price: "540",
    currency: "USD",
    regionId: 1,
    districtId: 1,
    attributes: {},
    status: "APPROVED",
    isActive: true,
    isPromoted: false,
    promotedUntil: null,
    rejectReason: null,
    viewsCountCache: 210,
    favoritesCountCache: 1,
    createdAt: "2026-01-02T00:00:00",
    images: [],
  },
] as const;

const sampleSellerLeads = [
  {
    id: 5001,
    buyerId: 901,
    sellerId: 7,
    companyId: 42,
    source: "PRODUCT",
    status: "NEW",
    contactName: "Алтын Цемент",
    contactPhone: "+998 90 555 11 22",
    comment: "Срочно нужно 50 тонн.",
    closeReason: null,
    items: [
      {
        productId: 1001,
        productNameSnapshot: "Стальной лист 3мм",
        priceSnapshot: "610",
        quantity: 50,
      },
    ],
  },
  {
    id: 5002,
    buyerId: 902,
    sellerId: 7,
    companyId: 42,
    source: "PRODUCT",
    status: "VIEWED",
    contactName: "Алтын Цемент",
    contactPhone: "+998 90 555 11 22",
    comment: null,
    closeReason: null,
    items: [
      {
        productId: 1001,
        productNameSnapshot: "Стальной лист 3мм",
        priceSnapshot: "610",
        quantity: 50,
      },
    ],
  },
  {
    id: 5003,
    buyerId: 903,
    sellerId: 7,
    companyId: 42,
    source: "PRODUCT",
    status: "CLOSED",
    contactName: "Алтын Цемент",
    contactPhone: "+998 90 555 11 22",
    comment: null,
    closeReason: "Отгружено",
    items: [
      {
        productId: 1002,
        productNameSnapshot: "Стальной лист 3мм",
        priceSnapshot: "540",
        quantity: 50,
      },
    ],
  },
] as const;

export const sellerFixtures = {
  sampleSellerCompanyShort,
  sampleSellerCompanyDetail,
};
