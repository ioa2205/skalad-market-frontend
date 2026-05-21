import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import userEvent from "@testing-library/user-event";
import { type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { renderWithIntl, screen, waitFor } from "@/lib/test/render";
import { mswServer } from "@/lib/test/server";
import type { LeadResponse } from "@/lib/api/schemas/lead";

import { SellerLeadRow } from "../components/leads/SellerLeadRow";

vi.mock("sonner", async () => {
  const actual = await vi.importActual<typeof import("sonner")>("sonner");
  return { ...actual, toast: { success: vi.fn(), error: vi.fn() } };
});

const baseLead: LeadResponse = {
  id: 5001,
  buyerId: 901,
  sellerId: 7,
  companyId: 42,
  source: "PRODUCT",
  status: "NEW",
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
};

function Wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("<SellerLeadRow />", () => {
  it("Принять fires PUT /leads/{id}/status with status=CONTACTED and no closeReason", async () => {
    let captured: Record<string, unknown> | null = null;
    mswServer.use(
      http.put(
        "http://localhost:3000/api/proxy/api/v1/leads/5001/status",
        async ({ request }) => {
          captured = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json(
            { success: true, data: { ...baseLead, status: "CONTACTED" } },
            { headers: { "x-request-id": "req-test-accept" } },
          );
        },
      ),
    );

    renderWithIntl(
      <Wrapper>
        <SellerLeadRow lead={baseLead} />
      </Wrapper>,
    );

    await userEvent.click(screen.getByRole("button", { name: /принять/i }));

    await waitFor(() => expect(captured).not.toBeNull());
    expect(captured).toEqual({ status: "CONTACTED" });
  });

  it("Отклонить requires a reason then PUTs status=CLOSED with closeReason", async () => {
    let captured: Record<string, unknown> | null = null;
    mswServer.use(
      http.put(
        "http://localhost:3000/api/proxy/api/v1/leads/5001/status",
        async ({ request }) => {
          captured = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json(
            { success: true, data: { ...baseLead, status: "CLOSED" } },
            { headers: { "x-request-id": "req-test-reject" } },
          );
        },
      ),
    );
    const user = userEvent.setup();

    renderWithIntl(
      <Wrapper>
        <SellerLeadRow lead={baseLead} />
      </Wrapper>,
    );

    await user.click(screen.getByRole("button", { name: /^отклонить$/i }));
    // Dialog opens — try to submit without a reason → validation message.
    const confirmBtn = await screen.findByRole("button", {
      name: /^отклонить$/i,
      hidden: false,
    });
    // The dialog also has an "Отклонить" button — clicking it without a reason should surface an inline error.
    await user.click(confirmBtn);
    expect(captured).toBeNull();

    // Now type a reason and submit.
    const textarea = await screen.findByRole("textbox");
    await user.type(textarea, "Товара нет");
    await user.click(confirmBtn);

    await waitFor(() => expect(captured).not.toBeNull());
    expect(captured).toMatchObject({
      status: "CLOSED",
      closeReason: "Товара нет",
    });
  });

  it("does not show accept/reject buttons for closed leads", () => {
    renderWithIntl(
      <Wrapper>
        <SellerLeadRow lead={{ ...baseLead, status: "CLOSED" }} />
      </Wrapper>,
    );
    expect(
      screen.queryByRole("button", { name: /принять/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /^отклонить$/i }),
    ).not.toBeInTheDocument();
    // "Написать" remains.
    expect(
      screen.getByRole("link", { name: /написать/i }),
    ).toBeInTheDocument();
  });
});
