import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { userEvent } from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import type { ReactNode } from "react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { Toaster } from "@/components/ui/sonner";
import { resetUserHandlers } from "@/lib/test/handlers";
import { fireEvent, renderWithIntl, screen, waitFor } from "@/lib/test/render";
import { mswServer } from "@/lib/test/server";

import { AvatarUploader } from "../components/AvatarUploader";

beforeAll(() => {
  // happy-dom does not implement URL.createObjectURL by default.
  globalThis.URL.createObjectURL = vi.fn(() => "blob:test");
  globalThis.URL.revokeObjectURL = vi.fn();
});

beforeEach(() => {
  resetUserHandlers();
});

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

const PROXY = "http://localhost:3000/api/proxy/api/v1";

describe("AvatarUploader", () => {
  it("uploads, then sets the new photo on success", async () => {
    const setPhotoCalls: unknown[] = [];
    mswServer.use(
      http.post(`${PROXY}/attach/upload`, () =>
        HttpResponse.json(
          { success: true, data: { id: "att-success", url: "http://x" } },
          { headers: { "x-request-id": "req-upload-ok" } },
        ),
      ),
      http.put(`${PROXY}/users/update/photo`, async ({ request }) => {
        setPhotoCalls.push(await request.json());
        return HttpResponse.json(
          { success: true, data: "att-success" },
          { headers: { "x-request-id": "req-set-photo-ok" } },
        );
      }),
    );

    const user = userEvent.setup();
    withClient(<AvatarUploader currentUrl={null} name="Иван Петров" />);

    const file = new File(["image-bytes"], "avatar.png", { type: "image/png" });
    const input = screen.getByLabelText("Загрузить фото", { selector: "input" });
    await user.upload(input, file);

    await waitFor(() => expect(setPhotoCalls).toHaveLength(1));
    expect(setPhotoCalls[0]).toEqual({ photoId: "att-success" });
    expect(await screen.findByText("Фото обновлено")).toBeInTheDocument();
  });

  it("rolls back the preview and surfaces the correlation id when set-photo fails", async () => {
    mswServer.use(
      http.post(`${PROXY}/attach/upload`, () =>
        HttpResponse.json(
          { success: true, data: { id: "att-orphan", url: "http://x" } },
          { headers: { "x-request-id": "req-upload-ok" } },
        ),
      ),
      http.put(`${PROXY}/users/update/photo`, () =>
        HttpResponse.json(
          { success: false, message: "account.photo.update.failed" },
          { status: 500, headers: { "x-request-id": "req-set-photo-boom" } },
        ),
      ),
    );

    const user = userEvent.setup();
    withClient(<AvatarUploader currentUrl={null} name="Иван Петров" />);

    const file = new File(["image-bytes"], "avatar.png", { type: "image/png" });
    const input = screen.getByLabelText("Загрузить фото", { selector: "input" });
    await user.upload(input, file);

    expect(
      await screen.findByText("Не удалось загрузить фото"),
    ).toBeInTheDocument();
    expect(await screen.findAllByText(/req-set-photo-boom/)).not.toHaveLength(0);
  });

  it("rejects unsupported file types before any network call", async () => {
    let uploadCalls = 0;
    mswServer.use(
      http.post(`${PROXY}/attach/upload`, () => {
        uploadCalls += 1;
        return HttpResponse.json(
          { success: true, data: { id: "x", url: "http://x" } },
          { headers: { "x-request-id": "req-upload" } },
        );
      }),
    );

    withClient(<AvatarUploader currentUrl={null} name="Иван Петров" />);

    const file = new File(["pdf"], "doc.pdf", { type: "application/pdf" });
    const input = screen.getByLabelText("Загрузить фото", {
      selector: "input",
    }) as HTMLInputElement;

    // userEvent.upload honors the input's `accept` attribute in happy-dom and
    // would silently swallow the change event for unsupported types — fire the
    // change event directly to exercise our in-component MIME guard.
    fireEvent.change(input, { target: { files: [file] } });

    expect(
      await screen.findByText("Поддерживаются только PNG и JPEG."),
    ).toBeInTheDocument();
    expect(uploadCalls).toBe(0);
  });
});
