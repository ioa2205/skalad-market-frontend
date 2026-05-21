import { http, HttpResponse } from "msw";

const PROXY = "http://localhost:3000/api/proxy/api/v1/chats";

interface ThreadFixture {
  thread_id: number;
  other_party: {
    id: number;
    type: "BUYER" | "SELLER";
    display_name: string;
    username?: string;
    slug?: string;
    avatar_url?: string;
  };
  last_message: {
    id: number;
    body?: string;
    attachment_url?: string;
    sent_at: string;
    status: string;
  };
  unread_count: number;
  product?: {
    id: number;
    name: string;
    slug: string;
    price?: string;
    currency?: string;
    primary_image?: string;
  };
}

interface MessageFixture {
  id: number;
  thread_id: number;
  sender_id: number;
  sender_type: "BUYER" | "SELLER";
  body?: string;
  attachment_key?: string;
  attachment_url?: string;
  sent_at: string;
  delivered_at?: string;
  read_at?: string;
  status: string;
}

const seedThreads: ThreadFixture[] = [
  {
    thread_id: 101,
    other_party: {
      id: 7,
      type: "SELLER",
      display_name: "Алтын Цемент",
      slug: "altyn-cement",
    },
    last_message: {
      id: 1003,
      body: "Минимальная партия для экспорта — 20 тонн.",
      sent_at: "2026-04-27T10:45:00",
      status: "DELIVERED",
    },
    unread_count: 3,
    product: {
      id: 9,
      name: "Стальной лист 3мм",
      slug: "steel-sheet-3mm",
      price: "120000",
      currency: "UZS",
    },
  },
  {
    thread_id: 102,
    other_party: {
      id: 8,
      type: "SELLER",
      display_name: "Алтын Цемент",
      slug: "altyn-cement-2",
    },
    last_message: {
      id: 2002,
      body: "Стальной лист 3мм",
      sent_at: "2026-04-27T10:10:00",
      status: "READ",
    },
    unread_count: 0,
  },
];

const seedMessages: Record<number, MessageFixture[]> = {
  101: [
    {
      id: 1001,
      thread_id: 101,
      sender_id: 1,
      sender_type: "BUYER",
      body: "Здравствуйте! Подскажите минимальную партию.",
      sent_at: "2026-04-27T10:30:00",
      status: "READ",
    },
    {
      id: 1002,
      thread_id: 101,
      sender_id: 7,
      sender_type: "SELLER",
      body: "Добрый день. Партия от 20 тонн.",
      sent_at: "2026-04-27T10:42:00",
      status: "READ",
    },
    {
      id: 1003,
      thread_id: 101,
      sender_id: 7,
      sender_type: "SELLER",
      body: "Минимальная партия для экспорта — 20 тонн.",
      sent_at: "2026-04-27T10:45:00",
      status: "DELIVERED",
    },
  ],
  102: [
    {
      id: 2001,
      thread_id: 102,
      sender_id: 1,
      sender_type: "BUYER",
      body: "Готовы оформить заказ.",
      sent_at: "2026-04-27T10:05:00",
      status: "READ",
    },
    {
      id: 2002,
      thread_id: 102,
      sender_id: 8,
      sender_type: "SELLER",
      body: "Стальной лист 3мм",
      sent_at: "2026-04-27T10:10:00",
      status: "READ",
    },
  ],
};

let nextThreadId = 9000;
let nextMessageId = 8000;

/**
 * Sentinel ids for tests:
 *   - threadId 9991 → list/messages return 500
 *   - threadId 9992 → ws-token returns 500
 *   - sellerCompanyId 9993 → POST /chats/create returns 500
 */
export const chatHandlers = [
  http.get(PROXY, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? "1");
    const perPage = Number(url.searchParams.get("per_page") ?? "20");
    const start = (page - 1) * perPage;
    const items = seedThreads.slice(start, start + perPage);
    return HttpResponse.json(
      {
        success: true,
        data: {
          items,
          meta: {
            total: seedThreads.length,
            page,
            perPage,
            totalPages: Math.max(Math.ceil(seedThreads.length / perPage), 1),
          },
        },
      },
      { headers: { "x-request-id": `req-test-chats-${page}` } },
    );
  }),

  http.post(`${PROXY}/create`, async ({ request }) => {
    const body = (await request.json()) as {
      seller_company_id: number;
      product_id?: number;
    };
    if (body.seller_company_id === 9993) {
      return HttpResponse.json(
        { success: false, message: "chat.create.failed" },
        { status: 500, headers: { "x-request-id": "req-test-chat-create-fail" } },
      );
    }
    const id = nextThreadId++;
    return HttpResponse.json(
      { success: true, data: { thread_id: id, is_new: true } },
      { headers: { "x-request-id": `req-test-chat-create-${id}` } },
    );
  }),

  http.get(`${PROXY}/unread-count`, () => {
    return HttpResponse.json(
      { success: true, data: { unread_count: 3 } },
      { headers: { "x-request-id": "req-test-chat-unread" } },
    );
  }),

  http.post(`${PROXY}/ws-token`, () => {
    return HttpResponse.json(
      { success: true, data: { ws_token: "test-ws-token", expires_in: 3600 } },
      { headers: { "x-request-id": "req-test-ws-token" } },
    );
  }),

  http.get(`${PROXY}/:threadId/messages`, ({ params, request }) => {
    const threadId = Number(params.threadId);
    if (threadId === 9991) {
      return HttpResponse.json(
        { success: false, message: "chat.messages.failed" },
        { status: 500, headers: { "x-request-id": "req-test-chat-msgs-fail" } },
      );
    }
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? "1");
    const perPage = Number(url.searchParams.get("per_page") ?? "20");
    const all = seedMessages[threadId] ?? [];
    const start = (page - 1) * perPage;
    const items = all.slice(start, start + perPage);
    return HttpResponse.json(
      {
        success: true,
        data: {
          items,
          meta: {
            total: all.length,
            page,
            perPage,
            totalPages: Math.max(Math.ceil(all.length / perPage), 1),
          },
        },
      },
      { headers: { "x-request-id": `req-test-chat-msgs-${threadId}-${page}` } },
    );
  }),

  http.post(`${PROXY}/:threadId/messages/image`, ({ params }) => {
    const threadId = Number(params.threadId);
    const key = `attachments/${threadId}/${nextMessageId++}.png`;
    return HttpResponse.json(
      {
        success: true,
        data: {
          attachment_key: key,
          attachment_url: `https://cdn.test/${key}`,
        },
      },
      { headers: { "x-request-id": `req-test-chat-upload-${threadId}` } },
    );
  }),

  http.delete(`${PROXY}/:threadId`, ({ params }) => {
    return HttpResponse.json(
      { success: true, data: { message: "Thread hidden" } },
      { headers: { "x-request-id": `req-test-chat-hide-${params.threadId}` } },
    );
  }),
];
