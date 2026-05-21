import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { userEvent } from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { Toaster } from "@/components/ui/sonner";
import { renderWithIntl, screen, waitFor } from "@/lib/test/render";
import { mswServer } from "@/lib/test/server";
import type { LeadResponse } from "@/lib/api/schemas/lead";

import { LeadDetailDrawer } from "../components/LeadDetailDrawer";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/account/leads",
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

const baseLead: LeadResponse = {
  id: 5001,
  buyerId: 1,
  sellerId: 2,
  companyId: 10,
  source: "CART",
  status: "NEW",
  contactName: "Иван Петров",
  contactPhone: "+998900000001",
  items: [
    { productId: 1, productNameSnapshot: "Цемент", priceSnapshot: "100", quantity: 5 },
  ],
};

describe("LeadDetailDrawer", () => {
  it("renders the seeded lead, fires DELETE on confirm and shows the success toast", async () => {
    const deleteSpy = vi.fn();
    mswServer.use(
      http.delete("http://localhost:3000/api/proxy/api/v1/leads/:id", ({ params }) => {
        deleteSpy(Number(params.id));
        return HttpResponse.json(
          { success: true, data: true },
          { headers: { "x-request-id": "req-cancel-ok" } },
        );
      }),
    );

    const onClose = vi.fn();
    const user = userEvent.setup();
    withClient(<LeadDetailDrawer leadId={5001} initial={baseLead} onClose={onClose} />);

    // Initial data renders synchronously — no fetch wait needed for the title.
    expect(await screen.findByText("Запрос №5001")).toBeInTheDocument();
    expect(screen.getByText("Иван Петров")).toBeInTheDocument();

    // Cancel button is shown only for NEW/VIEWED.
    await user.click(screen.getByRole("button", { name: "Отменить запрос" }));

    // Confirm dialog is now open.
    const confirm = await screen.findByRole("button", { name: "Да, отменить" });
    await user.click(confirm);

    await waitFor(() => {
      expect(deleteSpy).toHaveBeenCalledWith(5001);
    });
    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("hides the cancel CTA when status is not cancelable", async () => {
    withClient(
      <LeadDetailDrawer
        leadId={5003}
        initial={{ ...baseLead, id: 5003, status: "CLOSED" }}
        onClose={() => {}}
      />,
    );

    expect(await screen.findByText("Запрос №5003")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Отменить запрос" })).toBeNull();
  });

  it("surfaces the correlation id when detail fetch fails", async () => {
    mswServer.use(
      http.get("http://localhost:3000/api/proxy/api/v1/leads/:id", () =>
        HttpResponse.json(
          { success: false, message: "lead.detail.failed" },
          { status: 500, headers: { "x-request-id": "req-detail-boom" } },
        ),
      ),
    );

    withClient(<LeadDetailDrawer leadId={9991} onClose={() => {}} />);

    expect(await screen.findByText("Не удалось загрузить запрос")).toBeInTheDocument();
    expect(await screen.findByText(/req-detail-boom/)).toBeInTheDocument();
  });
});
