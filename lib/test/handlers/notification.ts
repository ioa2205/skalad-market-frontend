import { http, HttpResponse } from "msw";

const PROXY = "http://localhost:3000/api/proxy/api/v1/notifications";

interface NotificationFixture {
  id: number;
  type: string;
  payload: Record<string, unknown>;
  sent_at: string;
  read_at?: string;
}

let seedNotifications: NotificationFixture[] = [
  {
    id: 1,
    type: "lead.new",
    payload: { leadId: 5001, productName: "Цемент" },
    sent_at: "2026-04-27T09:30:00",
  },
  {
    id: 2,
    type: "chat.new_message",
    payload: { threadId: 101, fromName: "Алтын Цемент" },
    sent_at: "2026-04-27T08:00:00",
  },
  {
    id: 3,
    type: "lead.status.changed",
    payload: { leadId: 5002, newStatus: "VIEWED" },
    sent_at: "2026-04-26T18:15:00",
    read_at: "2026-04-26T19:00:00",
  },
];

let preferences = { in_app: true, push: false, email: true };

/**
 * Sentinel ids for tests:
 *   - GET ?error=1   → 500
 *   - PUT preferences body { push: false, in_app: false, email: false } → 500 (validation-style)
 */
export const notificationHandlers = [
  http.get(PROXY, ({ request }) => {
    const url = new URL(request.url);
    if (url.searchParams.get("error") === "1") {
      return HttpResponse.json(
        { success: false, message: "notifications.list.failed" },
        { status: 500, headers: { "x-request-id": "req-test-notif-fail" } },
      );
    }
    const isReadParam = url.searchParams.get("is_read");
    const page = Number(url.searchParams.get("page") ?? "1");
    const perPage = Number(url.searchParams.get("per_page") ?? "20");
    let items = seedNotifications;
    if (isReadParam === "true") items = items.filter((n) => n.read_at);
    if (isReadParam === "false") items = items.filter((n) => !n.read_at);
    const start = (page - 1) * perPage;
    return HttpResponse.json(
      {
        success: true,
        data: {
          items: items.slice(start, start + perPage),
          meta: {
            total: items.length,
            page,
            perPage,
            totalPages: Math.max(Math.ceil(items.length / perPage), 1),
          },
        },
      },
      { headers: { "x-request-id": `req-test-notif-list-${page}` } },
    );
  }),

  http.post(`${PROXY}/mark-read`, async ({ request }) => {
    const body = (await request.json()) as {
      notification_ids?: number[];
      mark_all?: boolean;
    };
    if (body.mark_all) {
      const now = "2026-04-27T11:00:00";
      seedNotifications = seedNotifications.map((n) => ({
        ...n,
        ...(n.read_at ? {} : { read_at: now }),
      }));
    } else if (body.notification_ids?.length) {
      const ids = new Set(body.notification_ids);
      const now = "2026-04-27T11:00:00";
      seedNotifications = seedNotifications.map((n) =>
        ids.has(n.id) ? { ...n, read_at: n.read_at ?? now } : n,
      );
    }
    return HttpResponse.json(
      { success: true, data: null },
      { headers: { "x-request-id": "req-test-notif-mark-read" } },
    );
  }),

  http.get(`${PROXY}/preferences`, () => {
    return HttpResponse.json(
      { success: true, data: preferences },
      { headers: { "x-request-id": "req-test-notif-prefs" } },
    );
  }),

  http.put(`${PROXY}/preferences`, async ({ request }) => {
    const body = (await request.json()) as {
      in_app: boolean;
      push: boolean;
      email: boolean;
    };
    if (body.in_app === false && body.push === false && body.email === false) {
      return HttpResponse.json(
        { success: false, message: "notifications.preferences.failed" },
        { status: 500, headers: { "x-request-id": "req-test-notif-prefs-fail" } },
      );
    }
    preferences = body;
    return HttpResponse.json(
      { success: true, data: preferences },
      { headers: { "x-request-id": "req-test-notif-prefs-saved" } },
    );
  }),
];
