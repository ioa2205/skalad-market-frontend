import { TooltipProvider } from "@radix-ui/react-tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { renderWithIntl, screen, waitFor } from "@/lib/test/render";
import { mswServer } from "@/lib/test/server";

import { TopBar } from "../topbar";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/",
}));

function Wrap({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return (
    <QueryClientProvider client={client}>
      <TooltipProvider>{children}</TooltipProvider>
    </QueryClientProvider>
  );
}

describe("TopBar", () => {
  it("renders signed-out CTA when /api/auth/session returns null", async () => {
    renderWithIntl(
      <Wrap>
        <TopBar />
      </Wrap>,
    );
    // Per Figma home_1, the only signed-out CTA in the topbar is the
    // text-link "Зарегистрироваться". The login form is reached via the
    // tab switcher on /register, not a separate topbar button.
    await waitFor(() => {
      expect(
        screen.getByRole("link", { name: "Зарегистрироваться" }),
      ).toBeInTheDocument();
    });
    expect(screen.queryByRole("link", { name: "Войти" })).not.toBeInTheDocument();
  });

  it("shows the signed-in user menu when session is present", async () => {
    mswServer.use(
      http.get("http://localhost:3000/api/auth/session", () =>
        HttpResponse.json(
          {
            success: true,
            data: {
              userId: "u1",
              username: "John Doe",
              roles: ["BUYER"],
              locale: "ru",
            },
          },
          { headers: { "x-request-id": "req-test-session" } },
        ),
      ),
    );

    renderWithIntl(
      <Wrap>
        <TopBar />
      </Wrap>,
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Открыть меню профиля John Doe/ }),
      ).toBeInTheDocument();
    });
    // Role label is rendered next to the name on md+ screens.
    expect(screen.getByText("Покупатель")).toBeInTheDocument();
  });
});
