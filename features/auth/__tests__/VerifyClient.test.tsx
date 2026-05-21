import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithIntl, screen, waitFor } from "@/lib/test/render";

import { VerifyClient } from "../components/VerifyClient";

let pushSpy: ReturnType<typeof vi.fn>;

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: (...args: unknown[]) => pushSpy(...args) }),
}));

function Wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("<VerifyClient />", () => {
  beforeEach(() => {
    pushSpy = vi.fn();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the success state and auto-redirects to /login?verified=1", async () => {
    renderWithIntl(
      <Wrapper>
        <VerifyClient token="abc12345" />
      </Wrapper>,
    );

    expect(
      await screen.findByText(/Email подтверждён/i),
    ).toBeInTheDocument();

    await vi.advanceTimersByTimeAsync(3500);
    await waitFor(() => {
      expect(pushSpy).toHaveBeenCalledWith("/login?verified=1");
    });
  });

  it("renders the error state for a bad token", async () => {
    renderWithIntl(
      <Wrapper>
        <VerifyClient token="bad-token" />
      </Wrapper>,
    );

    expect(
      await screen.findByText(/Ссылка недействительна/i),
    ).toBeInTheDocument();
    expect(pushSpy).not.toHaveBeenCalled();
  });
});
