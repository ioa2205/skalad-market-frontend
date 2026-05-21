import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { userEvent } from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { Toaster } from "@/components/ui/sonner";
import { renderWithIntl, screen, waitFor } from "@/lib/test/render";
import { mswServer } from "@/lib/test/server";

import { NotificationPreferencesForm } from "../components/NotificationPreferencesForm";

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

describe("NotificationPreferencesForm", () => {
  it("save is disabled until a switch is flipped, then PUTs the full preferences body", async () => {
    const captured: unknown[] = [];
    mswServer.use(
      http.put(
        "http://localhost:3000/api/proxy/api/v1/notifications/preferences",
        async ({ request }) => {
          captured.push(await request.json());
          return HttpResponse.json(
            { success: true, data: { in_app: true, push: true, email: true } },
            { headers: { "x-request-id": "req-prefs-saved" } },
          );
        },
      ),
    );

    const user = userEvent.setup();
    withClient(
      <NotificationPreferencesForm
        initial={{ in_app: true, push: false, email: true }}
      />,
    );

    const save = screen.getByRole("button", { name: "Сохранить" });
    expect(save).toBeDisabled();

    // Flip Push to true.
    await user.click(screen.getByRole("switch", { name: "Push-уведомления" }));
    expect(save).toBeEnabled();

    await user.click(save);

    await waitFor(() => {
      expect(captured).toHaveLength(1);
    });
    // All three flags must be present (backend requires all three).
    expect(captured[0]).toEqual({ in_app: true, push: true, email: true });
    expect(await screen.findByText("Настройки сохранены")).toBeInTheDocument();
  });

  it("surfaces the correlation id in the error toast on failure", async () => {
    mswServer.use(
      http.put(
        "http://localhost:3000/api/proxy/api/v1/notifications/preferences",
        () =>
          HttpResponse.json(
            { success: false, message: "notifications.preferences.failed" },
            {
              status: 500,
              headers: { "x-request-id": "req-prefs-boom" },
            },
          ),
      ),
    );

    const user = userEvent.setup();
    withClient(
      <NotificationPreferencesForm
        initial={{ in_app: true, push: true, email: true }}
      />,
    );

    await user.click(screen.getByRole("switch", { name: "Email" }));
    await user.click(screen.getByRole("button", { name: "Сохранить" }));

    expect(
      await screen.findByText("Не удалось сохранить настройки"),
    ).toBeInTheDocument();
    expect(await screen.findByText(/req-prefs-boom/)).toBeInTheDocument();
  });
});
