import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import userEvent from "@testing-library/user-event";
import { type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { renderWithIntl, screen, waitFor } from "@/lib/test/render";

import { OnboardingWizard } from "../components/onboarding/OnboardingWizard";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
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
  return renderWithIntl(
    <Wrapper>
      <OnboardingWizard />
    </Wrapper>,
  );
}

describe("<OnboardingWizard />", () => {
  it("starts on the profile step with the right heading", () => {
    setup();
    expect(
      screen.getByRole("heading", { name: /профиль/i, level: 2 }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/название компании/i)).toBeInTheDocument();
  });

  it("blocks advancing while required step-1 fields are empty", async () => {
    setup();
    await userEvent.click(screen.getByRole("button", { name: /дальше/i }));
    // Still on step 1 — validation should have surfaced.
    expect(
      screen.getByRole("heading", { name: /профиль/i, level: 2 }),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(
        screen.getByText(/Введите название компании/i),
      ).toBeInTheDocument();
    });
  });

  it("advances to the contact step when profile fields are valid", async () => {
    const user = userEvent.setup();
    setup();
    await user.type(screen.getByLabelText(/название компании/i), "Алтын Цемент");
    await user.type(screen.getByLabelText(/инн \(стир\)/i), "123456789");
    await user.click(screen.getByRole("button", { name: /дальше/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /контакты/i, level: 2 }),
      ).toBeInTheDocument();
    });
    expect(screen.getByLabelText(/основной телефон/i)).toBeInTheDocument();
  });

  it("Back button returns the user to the previous step without losing data", async () => {
    const user = userEvent.setup();
    setup();
    await user.type(screen.getByLabelText(/название компании/i), "Алтын Цемент");
    await user.type(screen.getByLabelText(/инн \(стир\)/i), "123456789");
    await user.click(screen.getByRole("button", { name: /дальше/i }));
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: /контакты/i, level: 2 }),
      ).toBeInTheDocument(),
    );
    await user.click(screen.getByRole("button", { name: /назад/i }));
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: /профиль/i, level: 2 }),
      ).toBeInTheDocument(),
    );
    expect(screen.getByLabelText(/название компании/i)).toHaveValue(
      "Алтын Цемент",
    );
  });
});
