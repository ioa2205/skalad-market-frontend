import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { renderWithIntl, screen } from "@/lib/test/render";

import { CompanyProfileTabs } from "../components/CompanyProfileTabs";

// nuqs's testing adapter mocks router transitions; we just assert that the
// tab switch flows through, since URL writes happen via the testing adapter.

describe("CompanyProfileTabs", () => {
  it("defaults to the products tab when no ?tab is set", () => {
    renderWithIntl(<CompanyProfileTabs />);
    expect(
      screen.getByRole("tab", { name: "Товары", selected: true }),
    ).toBeInTheDocument();
    expect(screen.getByText("Товары появятся скоро")).toBeInTheDocument();
  });

  it("honours ?tab=reviews from the URL", () => {
    renderWithIntl(<CompanyProfileTabs />, {
      searchParams: { tab: "reviews" },
    });
    expect(
      screen.getByRole("tab", { name: "Отзывы", selected: true }),
    ).toBeInTheDocument();
    expect(screen.getByText("Отзывов пока нет")).toBeInTheDocument();
  });

  it("clicking the Отзывы tab activates it", async () => {
    const user = userEvent.setup();
    renderWithIntl(<CompanyProfileTabs />);
    await user.click(screen.getByRole("tab", { name: "Отзывы" }));
    expect(
      screen.getByRole("tab", { name: "Отзывы", selected: true }),
    ).toBeInTheDocument();
  });

  it("ignores the ?tab value when it is not a known tab", () => {
    // nuqs parseAsStringLiteral falls back to the default ("products").
    renderWithIntl(<CompanyProfileTabs />, {
      searchParams: { tab: "nonsense" },
    });
    expect(
      screen.getByRole("tab", { name: "Товары", selected: true }),
    ).toBeInTheDocument();
  });
});

