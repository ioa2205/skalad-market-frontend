import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { mswServer } from "@/lib/test/server";
import { renderWithIntl, screen, waitFor } from "@/lib/test/render";
import userEvent from "@testing-library/user-event";

import { RegisterForm } from "../components/RegisterForm";

let pushSpy: ReturnType<typeof vi.fn>;

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: (...args: unknown[]) => pushSpy(...args), refresh: () => {} }),
  useSearchParams: () => ({ get: () => null }),
  useSelectedLayoutSegment: () => "register",
}));

vi.mock("sonner", async () => {
  const actual = await vi.importActual<typeof import("sonner")>("sonner");
  return {
    ...actual,
    toast: { success: vi.fn(), error: vi.fn() },
  };
});

function Wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return (
    <QueryClientProvider client={client}>
      <TooltipProvider>{children}</TooltipProvider>
    </QueryClientProvider>
  );
}

function setup() {
  pushSpy = vi.fn();
  return renderWithIntl(
    <Wrapper>
      <RegisterForm />
    </Wrapper>,
  );
}

async function fillBaseFields() {
  await userEvent.type(screen.getByLabelText(/^имя$/i), "Иван Петров");
  await userEvent.type(screen.getByLabelText(/email/i), "alice@skladx.com");
  await userEvent.type(
    screen.getByLabelText(/^пароль$/i),
    "supersafe123",
  );
}

describe("<RegisterForm />", () => {
  it("forwards the active role tab as `role` in the body", async () => {
    let captured: Record<string, unknown> = {};
    mswServer.use(
      http.post("http://localhost:3000/api/auth/register", async ({ request }) => {
        captured = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json(
          {
            success: true,
            data: { username: captured.username, role: captured.role },
          },
          { headers: { "x-request-id": "req-test-ok" } },
        );
      }),
    );

    setup();
    await userEvent.click(screen.getByRole("tab", { name: /продавец/i }));
    await userEvent.type(screen.getByLabelText(/компания/i), "СкладX");
    await fillBaseFields();
    await userEvent.click(screen.getByRole("button", { name: /регистрация/i }));

    await waitFor(() => {
      expect(captured.role).toBe("SELLER");
      expect(captured.firstName).toBe("Иван");
      expect(captured.lastName).toBe("Петров");
      expect(captured.username).toBe("alice@skladx.com");
      expect(captured.companyName).toBe("СкладX");
    });
  });

  it("redirects to /login?registered=1 with email after success", async () => {
    setup();
    await fillBaseFields();
    await userEvent.click(screen.getByRole("button", { name: /регистрация/i }));

    await waitFor(() => {
      expect(pushSpy).toHaveBeenCalledWith(
        "/login?registered=1&email=alice%40skladx.com",
      );
    });
  });

  it("surfaces username.already.taken copy", async () => {
    setup();
    await userEvent.type(
      screen.getByLabelText(/^имя$/i),
      "Иван Петров",
    );
    await userEvent.type(screen.getByLabelText(/email/i), "taken@skladx.com");
    await userEvent.type(
      screen.getByLabelText(/^пароль$/i),
      "supersafe123",
    );
    await userEvent.click(screen.getByRole("button", { name: /регистрация/i }));

    expect(
      await screen.findByText(/уже зарегистрирован/i),
    ).toBeInTheDocument();
  });

  it("requires two-word fullName", async () => {
    setup();
    await userEvent.type(screen.getByLabelText(/^имя$/i), "Иван");
    await userEvent.type(screen.getByLabelText(/email/i), "alice@skladx.com");
    await userEvent.type(
      screen.getByLabelText(/^пароль$/i),
      "supersafe123",
    );
    await userEvent.click(screen.getByRole("button", { name: /регистрация/i }));

    expect(
      await screen.findByText(/Введите имя и фамилию/i),
    ).toBeInTheDocument();
  });

  it("requires company for SELLER role", async () => {
    setup();
    await userEvent.click(screen.getByRole("tab", { name: /продавец/i }));
    await fillBaseFields();
    await userEvent.click(screen.getByRole("button", { name: /регистрация/i }));

    expect(
      await screen.findByText(/Укажите компанию/i),
    ).toBeInTheDocument();
  });

  it("rejects passwords shorter than 8", async () => {
    setup();
    await userEvent.type(screen.getByLabelText(/^имя$/i), "Иван Петров");
    await userEvent.type(screen.getByLabelText(/email/i), "alice@skladx.com");
    await userEvent.type(screen.getByLabelText(/^пароль$/i), "abc");
    await userEvent.click(screen.getByRole("button", { name: /регистрация/i }));

    expect(
      await screen.findByText(/не короче 8 символов/i),
    ).toBeInTheDocument();
  });
});
