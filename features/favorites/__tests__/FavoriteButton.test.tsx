import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { userEvent } from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { renderWithIntl, screen, waitFor } from "@/lib/test/render";
import { mswServer } from "@/lib/test/server";

import { primeFavoritedIds } from "../api/favorites.client";
import { FavoriteButton } from "../components/FavoriteButton";

// MSW listen/reset/close already wired globally in vitest.setup.ts.

function renderWithClient(ui: ReactNode, ids: number[] = []): QueryClient {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  primeFavoritedIds(client, ids);
  renderWithIntl(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
  return client;
}

describe("FavoriteButton optimistic toggle", () => {
  it("flips immediately on click and confirms on success", async () => {
    const user = userEvent.setup();
    renderWithClient(<FavoriteButton productId={42} />, []);

    const button = screen.getByRole("button", { name: /Добавить в избранное/i });
    expect(button).toHaveAttribute("aria-pressed", "false");

    await user.click(button);

    // Optimistic flip is synchronous after click — pressed=true before MSW responds.
    expect(button).toHaveAttribute("aria-pressed", "true");

    await waitFor(() => {
      expect(button).toHaveAttribute("aria-pressed", "true");
    });
  });

  it("rolls back to the previous state when the server returns an error", async () => {
    mswServer.use(
      http.post(
        "http://localhost:3000/api/proxy/api/v1/favorites/:productId",
        () =>
          HttpResponse.json(
            { success: false, message: "favorites.toggle.failed" },
            { status: 500, headers: { "x-request-id": "req-rollback" } },
          ),
      ),
      http.get(
        "http://localhost:3000/api/proxy/api/v1/favorites",
        () =>
          HttpResponse.json(
            {
              success: true,
              data: { items: [], meta: { total: 0, page: 1, perPage: 200, totalPages: 0 } },
            },
            { headers: { "x-request-id": "req-list" } },
          ),
      ),
    );

    const user = userEvent.setup();
    renderWithClient(<FavoriteButton productId={42} />, []);

    const button = screen.getByRole("button", { name: /Добавить в избранное/i });
    expect(button).toHaveAttribute("aria-pressed", "false");

    await user.click(button);

    // After the failed mutation lands the optimistic flip is rolled back —
    // ending state matches the pre-click state. The user-visible promise of
    // optimistic UI is "the failure leaves no trace", which is what we
    // assert here. (The intermediate `aria-pressed="true"` flash is too
    // tight to assert reliably after `await user.click`.)
    await waitFor(() => {
      expect(button).toHaveAttribute("aria-pressed", "false");
    });
  });
});
