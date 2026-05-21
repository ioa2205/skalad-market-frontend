import { TooltipProvider } from "@radix-ui/react-tooltip";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithIntl, screen } from "@/lib/test/render";

import { Sidebar } from "../sidebar";

vi.mock("next/navigation", () => ({
  usePathname: () => "/catalog",
}));

function Wrap({ children }: { children: ReactNode }) {
  return <TooltipProvider>{children}</TooltipProvider>;
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

describe("Sidebar", () => {
  it("renders nav landmark with the active route marked aria-current", () => {
    renderWithIntl(
      <Wrap>
        <Sidebar />
      </Wrap>,
    );
    const nav = screen.getByRole("navigation", { name: /Основная навигация/ });
    expect(nav).toBeInTheDocument();
    const catalogLink = screen.getByRole("link", { name: "Каталог" });
    expect(catalogLink).toHaveAttribute("aria-current", "page");
  });

  it("toggle button updates aria-pressed and persists collapsed state", async () => {
    const user = userEvent.setup();
    renderWithIntl(
      <Wrap>
        <Sidebar />
      </Wrap>,
    );
    const toggle = screen.getByRole("button", { name: "Свернуть" });
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    await user.click(toggle);

    const expandToggle = screen.getByRole("button", { name: "Развернуть" });
    expect(expandToggle).toHaveAttribute("aria-pressed", "true");
    expect(localStorage.getItem("skladx.sidebar")).toContain("\"collapsed\":true");
  });

  it("renders coming-soon items as disabled buttons, not links", () => {
    renderWithIntl(
      <Wrap>
        <Sidebar />
      </Wrap>,
    );
    const tariffsTrigger = screen.getByRole("button", { name: "Тарифы" });
    expect(tariffsTrigger).toHaveAttribute("aria-disabled", "true");
  });
});
