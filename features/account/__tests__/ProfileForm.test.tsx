import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { userEvent } from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it } from "vitest";

import { Toaster } from "@/components/ui/sonner";
import { resetUserHandlers } from "@/lib/test/handlers";
import { renderWithIntl, screen, waitFor } from "@/lib/test/render";
import { mswServer } from "@/lib/test/server";

import { ProfileForm } from "../components/ProfileForm";

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

const initial = {
  firstName: "Иван",
  lastName: "Петров",
  position: "Закупки",
  telegram: "@ivanp",
  extraPhone: "+998 99 123 45 67",
};

beforeEach(() => {
  resetUserHandlers();
});

describe("ProfileForm", () => {
  it("renders the username as a read-only field when provided", () => {
    withClient(<ProfileForm initial={initial} username="ivan@example.com" />);
    const username = screen.getByLabelText("Логин");
    expect(username).toHaveValue("ivan@example.com");
    expect(username).toHaveAttribute("readonly");
  });

  it("blocks save until the form is dirty, then PUTs the trimmed payload", async () => {
    const captured: unknown[] = [];
    mswServer.use(
      http.put(
        "http://localhost:3000/api/proxy/api/v1/users",
        async ({ request }) => {
          captured.push(await request.json());
          return HttpResponse.json(
            { success: true, data: { ...initial, position: "Главный закупщик" } },
            { headers: { "x-request-id": "req-profile-saved" } },
          );
        },
      ),
    );

    const user = userEvent.setup();
    withClient(<ProfileForm initial={initial} />);

    const save = screen.getByRole("button", { name: "Сохранить" });
    expect(save).toBeDisabled();

    const positionInput = screen.getByLabelText(/^Должность/);
    await user.clear(positionInput);
    await user.type(positionInput, "  Главный закупщик  ");

    expect(save).toBeEnabled();
    await user.click(save);

    await waitFor(() => expect(captured).toHaveLength(1));
    expect(captured[0]).toEqual({
      firstName: "Иван",
      lastName: "Петров",
      position: "Главный закупщик",
      telegram: "@ivanp",
      extraPhone: "+998 99 123 45 67",
    });

    expect(await screen.findByText("Профиль обновлён")).toBeInTheDocument();
  });

  it("blocks save when firstName is empty and shows the required error", async () => {
    const user = userEvent.setup();
    withClient(<ProfileForm initial={initial} />);

    const firstName = screen.getByLabelText(/^Имя/);
    await user.clear(firstName);

    await user.click(screen.getByRole("button", { name: "Сохранить" }));

    expect(await screen.findByText("Введите имя.")).toBeInTheDocument();
  });

  it("surfaces the correlation id when the save mutation fails", async () => {
    mswServer.use(
      http.put("http://localhost:3000/api/proxy/api/v1/users", () =>
        HttpResponse.json(
          { success: false, message: "account.profile.save.failed" },
          { status: 500, headers: { "x-request-id": "req-profile-boom" } },
        ),
      ),
    );

    const user = userEvent.setup();
    withClient(<ProfileForm initial={initial} />);

    await user.clear(screen.getByLabelText(/^Должность/));
    await user.type(screen.getByLabelText(/^Должность/), "ABC");
    await user.click(screen.getByRole("button", { name: "Сохранить" }));

    const matches = await screen.findAllByText(
      "Не удалось сохранить профиль",
    );
    expect(matches.length).toBeGreaterThan(0);
    expect(await screen.findAllByText(/req-profile-boom/)).not.toHaveLength(0);
  });
});
