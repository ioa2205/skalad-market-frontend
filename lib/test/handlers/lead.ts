import { http, HttpResponse } from "msw";

const PROXY = "http://localhost:3000/api/proxy/api/v1/leads";

interface LeadCreateBody {
  source: "PRODUCT" | "CART";
  productIds?: number[];
  productId?: number;
  contactName: string;
  contactPhone: string;
  comment?: string;
}

type LeadStatus = "NEW" | "VIEWED" | "CONTACTED" | "CLOSED" | "CANCELED";

interface LeadFixture {
  id: number;
  buyerId: number;
  sellerId: number;
  companyId: number;
  source: "PRODUCT" | "CART";
  status: LeadStatus;
  contactName: string;
  contactPhone: string;
  comment?: string;
  closeReason?: string;
  items: Array<{
    productId: number;
    productNameSnapshot: string;
    priceSnapshot: string;
    quantity: number;
  }>;
}

let nextId = 1000;

const seedLeads: LeadFixture[] = [
  {
    id: 5001,
    buyerId: 1,
    sellerId: 2,
    companyId: 10,
    source: "CART",
    status: "NEW",
    contactName: "Иван Петров",
    contactPhone: "+998900000001",
    comment: "Срочно",
    items: [
      { productId: 1, productNameSnapshot: "Цемент", priceSnapshot: "100", quantity: 5 },
      { productId: 2, productNameSnapshot: "Кирпич", priceSnapshot: "200", quantity: 3 },
    ],
  },
  {
    id: 5002,
    buyerId: 1,
    sellerId: 3,
    companyId: 11,
    source: "PRODUCT",
    status: "VIEWED",
    contactName: "Иван Петров",
    contactPhone: "+998900000001",
    items: [
      { productId: 7, productNameSnapshot: "Лак", priceSnapshot: "50", quantity: 1 },
    ],
  },
  {
    id: 5003,
    buyerId: 1,
    sellerId: 4,
    companyId: 12,
    source: "PRODUCT",
    status: "CLOSED",
    contactName: "Иван Петров",
    contactPhone: "+998900000001",
    closeReason: "Завершено",
    items: [
      { productId: 9, productNameSnapshot: "Гипс", priceSnapshot: "75", quantity: 10 },
    ],
  },
];

/**
 * Sentinel ids for tests:
 *   - productIds containing 9990  → POST returns 500 (cart fan-out failure)
 *   - GET /leads/9991              → 500 (detail error)
 *   - DELETE /leads/9992           → 500 (cancel error)
 */
export const leadHandlers = [
  http.post(PROXY, async ({ request }) => {
    const body = (await request.json()) as LeadCreateBody;

    if (body.productIds?.includes(9990)) {
      return HttpResponse.json(
        { success: false, message: "lead.create.failed" },
        { status: 500, headers: { "x-request-id": "req-test-lead-fail" } },
      );
    }

    const id = nextId++;
    return HttpResponse.json(
      {
        success: true,
        data: {
          id,
          buyerId: 1,
          sellerId: 2,
          companyId: 10,
          source: body.source,
          status: "NEW",
          contactName: body.contactName,
          contactPhone: body.contactPhone,
          ...(body.comment ? { comment: body.comment } : {}),
          items: (body.productIds ?? [body.productId!]).map((pid) => ({
            productId: pid,
            productNameSnapshot: `Product ${pid}`,
            priceSnapshot: "100",
            quantity: 1,
          })),
        },
      },
      { headers: { "x-request-id": `req-test-lead-${id}` } },
    );
  }),

  http.get(PROXY, ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get("status") as LeadStatus | null;
    const page = Number(url.searchParams.get("page") ?? "1");
    const perPage = Number(url.searchParams.get("perPage") ?? "20");

    const filtered = status ? seedLeads.filter((l) => l.status === status) : seedLeads;
    const start = (page - 1) * perPage;
    const items = filtered.slice(start, start + perPage);
    const total = filtered.length;
    const totalPages = Math.max(Math.ceil(total / perPage), 1);

    return HttpResponse.json(
      {
        success: true,
        data: { items, meta: { total, page, perPage, totalPages } },
      },
      { headers: { "x-request-id": `req-test-leads-list-${page}` } },
    );
  }),

  http.get(`${PROXY}/:id`, ({ params }) => {
    const id = Number(params.id);
    if (id === 9991) {
      return HttpResponse.json(
        { success: false, message: "lead.detail.failed" },
        { status: 500, headers: { "x-request-id": "req-test-lead-detail-fail" } },
      );
    }
    const lead = seedLeads.find((l) => l.id === id);
    if (!lead) {
      return HttpResponse.json(
        { success: false, message: "lead.not.found" },
        { status: 404, headers: { "x-request-id": `req-test-lead-${id}-404` } },
      );
    }
    return HttpResponse.json(
      { success: true, data: lead },
      { headers: { "x-request-id": `req-test-lead-${id}` } },
    );
  }),

  http.delete(`${PROXY}/:id`, ({ params }) => {
    const id = Number(params.id);
    if (id === 9992) {
      return HttpResponse.json(
        { success: false, message: "lead.cancel.failed" },
        { status: 500, headers: { "x-request-id": "req-test-lead-cancel-fail" } },
      );
    }
    return HttpResponse.json(
      { success: true, data: true },
      { headers: { "x-request-id": `req-test-lead-${id}-deleted` } },
    );
  }),
];
