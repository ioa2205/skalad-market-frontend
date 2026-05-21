import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { userEvent } from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { Toaster } from "@/components/ui/sonner";
import { renderWithIntl, screen, waitFor } from "@/lib/test/render";

import { ReportModal } from "../components/ReportModal";

function withClient(ui: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return renderWithIntl(
    <QueryClientProvider client={client}>
      {ui}
      <Toaster />
    </QueryClientProvider>,
  );
}

describe("ReportModal", () => {
  it("blocks submission until a reason is picked", async () => {
    const user = userEvent.setup();
    withClient(
      <ReportModal
        open
        onOpenChange={() => {}}
        targetType="PRODUCT"
        targetId={42}
        targetLabel="Цемент М500"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Отправить" }));

    expect(
      await screen.findByText("Выберите причину обращения."),
    ).toBeInTheDocument();
  });

  it("submits a successful report and shows the success toast", async () => {
    const user = userEvent.setup();
    let openValue = true;
    const handleOpenChange = (next: boolean) => {
      openValue = next;
    };

    withClient(
      <ReportModal
        open
        onOpenChange={handleOpenChange}
        targetType="COMPANY"
        targetId={101}
      />,
    );

    await user.click(screen.getByRole("radio", { name: /Мошенничество/ }));
    await user.type(
      screen.getByPlaceholderText(
        "Например: тот же товар уже есть в карточке № 4521.",
      ),
      "Подозрительный продавец",
    );
    await user.click(screen.getByRole("button", { name: "Отправить" }));

    expect(
      await screen.findByText("Спасибо! Жалоба отправлена."),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(openValue).toBe(false);
    });
  });

  it("surfaces the correlation id when the backend rejects the report", async () => {
    const user = userEvent.setup();
    withClient(
      <ReportModal
        open
        onOpenChange={() => {}}
        targetType="CHAT"
        // sentinel id wired in lib/test/handlers/report.ts → 500
        targetId={999}
      />,
    );

    await user.click(screen.getByRole("radio", { name: /Оскорбительный контент/ }));
    await user.click(screen.getByRole("button", { name: "Отправить" }));

    expect(
      await screen.findByText(/Не удалось отправить жалобу/),
    ).toBeInTheDocument();
    expect(await screen.findByText(/req-test-report-fail/)).toBeInTheDocument();
  });
});
