import { userEvent } from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";

import { Toaster } from "@/components/ui/sonner";
import { renderWithIntl, screen, waitFor } from "@/lib/test/render";
import { mswServer } from "@/lib/test/server";

import { LanguageSwitcher } from "../components/LanguageSwitcher";

const refresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh, push: vi.fn(), replace: vi.fn() }),
}));

describe("LanguageSwitcher", () => {
  it("posts the chosen locale to /api/locale and calls router.refresh on success", async () => {
    refresh.mockClear();
    const captured: unknown[] = [];
    mswServer.use(
      http.post("http://localhost:3000/api/locale", async ({ request }) => {
        captured.push(await request.json());
        return HttpResponse.json(
          { success: true, data: { locale: "en" } },
          { headers: { "x-request-id": "req-locale-ok" } },
        );
      }),
    );

    const user = userEvent.setup();
    renderWithIntl(
      <>
        <LanguageSwitcher />
        <Toaster />
      </>,
    );

    await user.click(screen.getByRole("radio", { name: "English" }));

    await waitFor(() => expect(captured).toHaveLength(1));
    expect(captured[0]).toEqual({ locale: "en" });
    await waitFor(() => expect(refresh).toHaveBeenCalledTimes(1));
    expect(await screen.findByText("Язык интерфейса обновлён")).toBeInTheDocument();
  });

  it("does not call /api/locale when the active locale is clicked", async () => {
    let calls = 0;
    mswServer.use(
      http.post("http://localhost:3000/api/locale", () => {
        calls += 1;
        return HttpResponse.json({ success: true, data: { locale: "ru" } });
      }),
    );

    const user = userEvent.setup();
    renderWithIntl(<LanguageSwitcher />);
    await user.click(screen.getByRole("radio", { name: "Русский" }));
    expect(calls).toBe(0);
  });

  it("surfaces the correlation id in the error toast when /api/locale fails", async () => {
    mswServer.use(
      http.post("http://localhost:3000/api/locale", () =>
        HttpResponse.json(
          { success: false, message: "invalid.locale" },
          { status: 400, headers: { "x-request-id": "req-locale-boom" } },
        ),
      ),
    );

    const user = userEvent.setup();
    renderWithIntl(
      <>
        <LanguageSwitcher />
        <Toaster />
      </>,
    );

    await user.click(screen.getByRole("radio", { name: "O‘zbekcha" }));

    expect(
      await screen.findByText("Не удалось переключить язык"),
    ).toBeInTheDocument();
    expect(await screen.findAllByText(/req-locale-boom/)).not.toHaveLength(0);
  });
});
