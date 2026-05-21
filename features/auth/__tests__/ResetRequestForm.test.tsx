import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import userEvent from "@testing-library/user-event";
import { type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { renderWithIntl, screen, waitFor } from "@/lib/test/render";

import { ResetRequestForm } from "../components/ResetRequestForm";

let pushSpy: ReturnType<typeof vi.fn>;

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: (...args: unknown[]) => pushSpy(...args) }),
  useSearchParams: () => ({ get: () => null }),
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
      <ResetRequestForm />
    </Wrapper>,
  );
}

describe("<ResetRequestForm />", () => {
  it("submits and routes to /reset/confirm with the email", async () => {
    setup();
    await userEvent.type(
      screen.getByPlaceholderText(/email адрес/i),
      "alice@skladx.com",
    );
    await userEvent.click(
      screen.getByRole("button", { name: /отправить письмо/i }),
    );
    await waitFor(() => {
      expect(pushSpy).toHaveBeenCalledWith(
        "/reset/confirm?email=alice%40skladx.com",
      );
    });
  });

  it("surfaces username.not.found", async () => {
    setup();
    await userEvent.type(
      screen.getByPlaceholderText(/email адрес/i),
      "unknown@skladx.com",
    );
    await userEvent.click(
      screen.getByRole("button", { name: /отправить письмо/i }),
    );
    expect(
      await screen.findByText(/Пользователь с такими данными не найден/i),
    ).toBeInTheDocument();
    expect(pushSpy).not.toHaveBeenCalled();
  });

  it("rejects invalid email format inline", async () => {
    setup();
    await userEvent.type(
      screen.getByPlaceholderText(/email адрес/i),
      "nope",
    );
    await userEvent.click(
      screen.getByRole("button", { name: /отправить письмо/i }),
    );
    expect(
      await screen.findByText(/Введите корректный email/i),
    ).toBeInTheDocument();
  });
});
