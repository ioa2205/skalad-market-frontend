import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import userEvent from "@testing-library/user-event";
import { type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { renderWithIntl, screen, waitFor } from "@/lib/test/render";

import { ResetConfirmForm } from "../components/ResetConfirmForm";

let pushSpy: ReturnType<typeof vi.fn>;

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: (...args: unknown[]) => pushSpy(...args) }),
  useSearchParams: () => ({
    get: (key: string) => (key === "email" ? "alice@skladx.com" : null),
  }),
}));

vi.mock("sonner", async () => {
  const actual = await vi.importActual<typeof import("sonner")>("sonner");
  return { ...actual, toast: { success: vi.fn(), error: vi.fn() } };
});

function Wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

function setup() {
  pushSpy = vi.fn();
  return renderWithIntl(
    <Wrapper>
      <ResetConfirmForm />
    </Wrapper>,
  );
}

describe("<ResetConfirmForm />", () => {
  it("rejects non-6-digit codes inline", async () => {
    setup();
    await userEvent.type(screen.getByLabelText(/код подтверждения/i), "12");
    await userEvent.type(
      screen.getByPlaceholderText("Новый пароль"),
      "supersafe",
    );
    await userEvent.type(
      screen.getByPlaceholderText("Повторите пароль"),
      "supersafe",
    );
    await userEvent.click(
      screen.getByRole("button", { name: /сохранить пароль/i }),
    );
    expect(
      await screen.findByText(/Введите 6-значный код/i),
    ).toBeInTheDocument();
  });

  it("rejects mismatched passwords inline", async () => {
    setup();
    await userEvent.type(screen.getByLabelText(/код подтверждения/i), "123456");
    await userEvent.type(
      screen.getByPlaceholderText("Новый пароль"),
      "supersafe",
    );
    await userEvent.type(
      screen.getByPlaceholderText("Повторите пароль"),
      "different",
    );
    await userEvent.click(
      screen.getByRole("button", { name: /сохранить пароль/i }),
    );
    expect(
      await screen.findByText(/Пароли не совпадают/i),
    ).toBeInTheDocument();
  });

  it("surfaces verification.wrong copy on bad code", async () => {
    setup();
    await userEvent.type(screen.getByLabelText(/код подтверждения/i), "000000");
    await userEvent.type(
      screen.getByPlaceholderText("Новый пароль"),
      "supersafe",
    );
    await userEvent.type(
      screen.getByPlaceholderText("Повторите пароль"),
      "supersafe",
    );
    await userEvent.click(
      screen.getByRole("button", { name: /сохранить пароль/i }),
    );
    expect(
      await screen.findByText(/Код подтверждения неверен или устарел/i),
    ).toBeInTheDocument();
  });

  it("submits and routes to /login on success", async () => {
    setup();
    await userEvent.type(screen.getByLabelText(/код подтверждения/i), "123456");
    await userEvent.type(
      screen.getByPlaceholderText("Новый пароль"),
      "supersafe",
    );
    await userEvent.type(
      screen.getByPlaceholderText("Повторите пароль"),
      "supersafe",
    );
    await userEvent.click(
      screen.getByRole("button", { name: /сохранить пароль/i }),
    );
    await waitFor(() => {
      expect(pushSpy).toHaveBeenCalledWith("/login");
    });
  });
});
