import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { userEvent } from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { Toaster } from "@/components/ui/sonner";
import { renderWithIntl, screen, waitFor } from "@/lib/test/render";
import { mswServer } from "@/lib/test/server";

import { NotificationDropdown } from "../components/NotificationDropdown";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

function withClient(ui: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  renderWithIntl(
    <QueryClientProvider client={client}>
      {ui}
      <Toaster />
    </QueryClientProvider>,
  );
}

const PROXY = "http://localhost:3000/api/proxy/api/v1/notifications";

describe("NotificationDropdown", () => {
  it("shows the unread count badge and renders fetched items", async () => {
    mswServer.use(
      http.get(PROXY, () =>
        HttpResponse.json(
          {
            success: true,
            data: {
              items: [
                {
                  id: 1,
                  type: "lead.new",
                  payload: { leadId: 5001, productName: "Цемент" },
                  sent_at: "2026-04-27T09:30:00",
                },
                {
                  id: 2,
                  type: "chat.new_message",
                  payload: { threadId: 101, fromName: "Алтын" },
                  sent_at: "2026-04-27T08:00:00",
                },
              ],
              meta: { total: 2, page: 1, perPage: 10, totalPages: 1 },
            },
          },
          { headers: { "x-request-id": "req-notif-list" } },
        ),
      ),
    );

    const user = userEvent.setup();
    withClient(<NotificationDropdown />);

    // Wait for query to settle, badge should show "2".
    const trigger = await screen.findByRole("button", { name: /Уведомления/ });
    await waitFor(() => {
      expect(trigger).toHaveAccessibleName(/2/);
    });

    await user.click(trigger);

    expect(await screen.findByText("Новый запрос")).toBeInTheDocument();
    expect(screen.getByText("Новое сообщение")).toBeInTheDocument();
  });

  it("fires mark-all-read and invalidates the list", async () => {
    let listCalls = 0;
    mswServer.use(
      http.get(PROXY, () => {
        listCalls += 1;
        const items =
          listCalls === 1
            ? [
                {
                  id: 1,
                  type: "lead.new",
                  payload: { leadId: 5001 },
                  sent_at: "2026-04-27T09:30:00",
                },
              ]
            : [];
        return HttpResponse.json(
          {
            success: true,
            data: {
              items,
              meta: {
                total: items.length,
                page: 1,
                perPage: 10,
                totalPages: 1,
              },
            },
          },
          { headers: { "x-request-id": `req-notif-${listCalls}` } },
        );
      }),
    );

    const markAllSpy = vi.fn();
    mswServer.use(
      http.post(`${PROXY}/mark-read`, async ({ request }) => {
        markAllSpy(await request.json());
        return HttpResponse.json(
          { success: true, data: null },
          { headers: { "x-request-id": "req-mark-read" } },
        );
      }),
    );

    const user = userEvent.setup();
    withClient(<NotificationDropdown />);

    const trigger = await screen.findByRole("button", { name: /Уведомления/ });
    await user.click(trigger);

    const markAll = await screen.findByRole("button", { name: "Прочитать все" });
    await user.click(markAll);

    await waitFor(() => {
      expect(markAllSpy).toHaveBeenCalledWith({ mark_all: true });
    });
    // After invalidation, the second list fetch returns no items → empty state.
    await waitFor(() => {
      expect(listCalls).toBeGreaterThanOrEqual(2);
    });
  });

  it("renders the empty state when the inbox is empty", async () => {
    mswServer.use(
      http.get(PROXY, () =>
        HttpResponse.json(
          {
            success: true,
            data: {
              items: [],
              meta: { total: 0, page: 1, perPage: 10, totalPages: 1 },
            },
          },
          { headers: { "x-request-id": "req-notif-empty" } },
        ),
      ),
    );

    const user = userEvent.setup();
    withClient(<NotificationDropdown />);
    const trigger = await screen.findByRole("button", { name: /Уведомления/ });
    await user.click(trigger);

    expect(
      await screen.findByText("Уведомлений пока нет"),
    ).toBeInTheDocument();
  });

  it("renders the error state with correlation id when the fetch fails", async () => {
    mswServer.use(
      http.get(PROXY, () =>
        HttpResponse.json(
          { success: false, message: "notifications.list.failed" },
          { status: 500, headers: { "x-request-id": "req-notif-boom" } },
        ),
      ),
    );

    const user = userEvent.setup();
    withClient(<NotificationDropdown />);
    const trigger = await screen.findByRole("button", { name: /Уведомления/ });
    await user.click(trigger);

    expect(
      await screen.findByText("Не удалось загрузить уведомления"),
    ).toBeInTheDocument();
    expect(await screen.findByText(/req-notif-boom/)).toBeInTheDocument();
  });
});
