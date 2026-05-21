import { fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { renderWithIntl, screen } from "@/lib/test/render";

import { SearchInput } from "./search-input";

describe("SearchInput", () => {
  it("debounces onSearchChange — single emission for a typing burst", async () => {
    const handler = vi.fn();
    renderWithIntl(<SearchInput onSearchChange={handler} debounceMs={120} />);

    const input = screen.getByRole("searchbox");
    fireEvent.change(input, { target: { value: "с" } });
    fireEvent.change(input, { target: { value: "ст" } });
    fireEvent.change(input, { target: { value: "стал" } });

    // No emission yet — still inside the debounce window.
    expect(handler).not.toHaveBeenCalledWith("с");
    expect(handler).not.toHaveBeenCalledWith("ст");

    await waitFor(() => expect(handler).toHaveBeenLastCalledWith("стал"), { timeout: 1000 });
  });

  it("renders a clear button that wipes value and emits empty string", async () => {
    const user = userEvent.setup();
    const handler = vi.fn();

    renderWithIntl(<SearchInput defaultValue="foo" onSearchChange={handler} debounceMs={0} />);

    const clear = await screen.findByRole("button", { name: "Очистить поиск" });
    await user.click(clear);

    expect((screen.getByRole("searchbox") as HTMLInputElement).value).toBe("");
    await waitFor(() => expect(handler).toHaveBeenLastCalledWith(""), { timeout: 1000 });
  });
});
