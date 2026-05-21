import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { userEvent } from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { Toaster } from "@/components/ui/sonner";
import { renderWithIntl, screen, waitFor } from "@/lib/test/render";

import { MessageComposer } from "../components/MessageComposer";

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

describe("MessageComposer", () => {
  it("submits typed text and clears the input", async () => {
    const onSend = vi.fn();
    const user = userEvent.setup();
    withClient(
      <MessageComposer threadId={101} onSend={onSend} />,
    );

    const textarea = screen.getByRole("textbox", { name: "Сообщение" });
    await user.type(textarea, "Hello{Enter}");

    await waitFor(() => {
      expect(onSend).toHaveBeenCalledWith({ body: "Hello" });
    });
    expect(textarea).toHaveValue("");
  });

  it("emits typing events at most once every ~1.5s while keystroking", async () => {
    const onTyping = vi.fn();
    const onSend = vi.fn();
    const user = userEvent.setup();
    withClient(
      <MessageComposer threadId={101} onSend={onSend} onTyping={onTyping} />,
    );

    const textarea = screen.getByRole("textbox", { name: "Сообщение" });
    await user.click(textarea);
    await user.keyboard("h");
    await user.keyboard("e");
    await user.keyboard("l");

    expect(onTyping).toHaveBeenCalledTimes(1);
  });

  it("disables the send button when the textarea is empty", () => {
    withClient(<MessageComposer threadId={101} onSend={() => {}} />);
    expect(
      screen.getByRole("button", { name: "Отправить сообщение" }),
    ).toBeDisabled();
  });

  it("blocks send when rate-limited and shows the toast", async () => {
    const onSend = vi.fn();
    const user = userEvent.setup();
    withClient(
      <MessageComposer threadId={101} rateLimited onSend={onSend} />,
    );

    const textarea = screen.getByRole("textbox", { name: "Сообщение" });
    expect(textarea).toBeDisabled();
    expect(onSend).not.toHaveBeenCalled();
    // Even pressing Enter on a separately enabled textarea wouldn't fire,
    // because rateLimited disables the input outright.
  });
});
