import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { userEvent } from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { Toaster } from "@/components/ui/sonner";
import { renderWithIntl, screen, waitFor } from "@/lib/test/render";
import { mswServer } from "@/lib/test/server";

import { StartChatButton } from "../components/StartChatButton";

const pushSpy = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushSpy, replace: vi.fn() }),
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

const PROXY = "http://localhost:3000/api/proxy/api/v1/chats/create";

describe("StartChatButton", () => {
  it("creates a thread and navigates to the new conversation", async () => {
    const captured: unknown[] = [];
    mswServer.use(
      http.post(PROXY, async ({ request }) => {
        captured.push(await request.json());
        return HttpResponse.json(
          { success: true, data: { thread_id: 55, is_new: true } },
          { headers: { "x-request-id": "req-create-ok" } },
        );
      }),
    );

    pushSpy.mockClear();
    const user = userEvent.setup();
    withClient(
      <StartChatButton sellerCompanyId={42} productId={9}>
        Написать
      </StartChatButton>,
    );

    await user.click(screen.getByRole("button", { name: /Написать/ }));

    await waitFor(() => {
      expect(captured[0]).toEqual({ seller_company_id: 42, product_id: 9 });
    });
    await waitFor(() => {
      expect(pushSpy).toHaveBeenCalledWith("/chats/55");
    });
  });

  it("does not create a thread when the user is a seller and shows the gating toast", async () => {
    const requestSpy = vi.fn();
    mswServer.use(
      http.post(PROXY, () => {
        requestSpy();
        return HttpResponse.json(
          { success: true, data: { thread_id: 999, is_new: true } },
          { headers: { "x-request-id": "should-not-fire" } },
        );
      }),
    );

    const user = userEvent.setup();
    withClient(
      <StartChatButton sellerCompanyId={42} isSeller>
        Написать
      </StartChatButton>,
    );

    await user.click(screen.getByRole("button", { name: /Написать/ }));

    expect(
      await screen.findByText("Только покупатели могут писать первыми."),
    ).toBeInTheDocument();
    expect(requestSpy).not.toHaveBeenCalled();
  });

  it("surfaces the correlation id in the error toast on failure", async () => {
    mswServer.use(
      http.post(PROXY, () =>
        HttpResponse.json(
          { success: false, message: "chat.create.failed" },
          { status: 500, headers: { "x-request-id": "req-create-boom" } },
        ),
      ),
    );

    const user = userEvent.setup();
    withClient(
      <StartChatButton sellerCompanyId={9993}>Написать</StartChatButton>,
    );

    await user.click(screen.getByRole("button", { name: /Написать/ }));

    expect(
      await screen.findByText("Не удалось открыть диалог."),
    ).toBeInTheDocument();
    expect(await screen.findByText(/req-create-boom/)).toBeInTheDocument();
  });
});
