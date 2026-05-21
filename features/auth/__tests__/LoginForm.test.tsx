import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { mswServer } from "@/lib/test/server";
import { renderWithIntl, screen, waitFor } from "@/lib/test/render";
import userEvent from "@testing-library/user-event";

import { LoginForm } from "../components/LoginForm";

let pushSpy: ReturnType<typeof vi.fn>;
let nextSearchParam: string | null = null;

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: (...args: unknown[]) => pushSpy(...args), refresh: () => {} }),
  useSearchParams: () => ({
    get: (key: string) => (key === "next" ? nextSearchParam : null),
  }),
  useSelectedLayoutSegment: () => "login",
}));

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
  nextSearchParam = null;
  return renderWithIntl(
    <Wrapper>
      <LoginForm />
    </Wrapper>,
  );
}

describe("<LoginForm />", () => {
  it("submits and routes to redirectTo on success", async () => {
    setup();
    // Default tab is PHONE — switch to EMAIL to use email validator.
    await userEvent.click(screen.getByRole("tab", { name: /email/i }));
    await userEvent.type(
      screen.getByPlaceholderText(/email адрес/i),
      "alice@skladx.com",
    );
    await userEvent.type(
      screen.getByPlaceholderText("Введите пароль"),
      "correct",
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Войти" }),
    );

    await waitFor(() => {
      expect(pushSpy).toHaveBeenCalledWith("/");
    });
  });

  it("honors ?next= over the redirectTo from the proxy", async () => {
    setup();
    nextSearchParam = "/account/leads";
    await userEvent.click(screen.getByRole("tab", { name: /email/i }));
    await userEvent.type(
      screen.getByPlaceholderText(/email адрес/i),
      "alice@skladx.com",
    );
    await userEvent.type(
      screen.getByPlaceholderText("Введите пароль"),
      "correct",
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Войти" }),
    );

    await waitFor(() => {
      expect(pushSpy).toHaveBeenCalledWith("/account/leads");
    });
  });

  it("surfaces wrong.password copy without redirecting", async () => {
    setup();
    await userEvent.click(screen.getByRole("tab", { name: /email/i }));
    await userEvent.type(
      screen.getByPlaceholderText(/email адрес/i),
      "alice@skladx.com",
    );
    await userEvent.type(
      screen.getByPlaceholderText("Введите пароль"),
      "nope",
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Войти" }),
    );

    expect(
      await screen.findByText(/Неверный email или пароль/i),
    ).toBeInTheDocument();
    expect(pushSpy).not.toHaveBeenCalled();
  });

  it("surfaces account.locked copy", async () => {
    setup();
    await userEvent.click(screen.getByRole("tab", { name: /email/i }));
    await userEvent.type(
      screen.getByPlaceholderText(/email адрес/i),
      "alice@skladx.com",
    );
    await userEvent.type(
      screen.getByPlaceholderText("Введите пароль"),
      "locked",
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Войти" }),
    );

    expect(
      await screen.findByText(/заблокирован на 15 минут/i),
    ).toBeInTheDocument();
  });

  it("surfaces correlation id alongside generic copy on unknown errors", async () => {
    mswServer.use(
      http.post("http://localhost:3000/api/auth/login", () =>
        HttpResponse.json(
          { success: false, message: "weird.unknown" },
          { status: 500, headers: { "x-request-id": "corr-XYZ" } },
        ),
      ),
    );
    setup();
    await userEvent.click(screen.getByRole("tab", { name: /email/i }));
    await userEvent.type(
      screen.getByPlaceholderText(/email адрес/i),
      "alice@skladx.com",
    );
    await userEvent.type(
      screen.getByPlaceholderText("Введите пароль"),
      "anything",
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Войти" }),
    );

    expect(
      await screen.findByText(/Код обращения: corr-XYZ/i),
    ).toBeInTheDocument();
  });

  it("does not submit when the email is malformed", async () => {
    setup();
    await userEvent.click(screen.getByRole("tab", { name: /email/i }));
    await userEvent.type(
      screen.getByPlaceholderText(/email адрес/i),
      "not-an-email",
    );
    await userEvent.type(
      screen.getByPlaceholderText("Введите пароль"),
      "correct",
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Войти" }),
    );

    expect(
      await screen.findByText(/Введите корректный email/i),
    ).toBeInTheDocument();
    expect(pushSpy).not.toHaveBeenCalled();
  });

  it("renders a disabled SSO button with a 'скоро' affordance", () => {
    setup();
    const sso = screen.getByRole("button", { name: /Войти через SKLAD ERP/i });
    expect(sso).toBeDisabled();
  });
});
