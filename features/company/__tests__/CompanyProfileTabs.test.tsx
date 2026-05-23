import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { renderWithIntl, screen } from "@/lib/test/render";

import { CompanyProfileTabs } from "../components/CompanyProfileTabs";

const defaultProps = {
  products: [],
  companyName: "UzMetal Pro",
  verified: true,
};

describe("CompanyProfileTabs", () => {
  it("defaults to the products tab when no ?tab is set", () => {
    renderWithIntl(<CompanyProfileTabs {...defaultProps} />);
    expect(
      screen.getByRole("tab", { name: "Товары", selected: true }),
    ).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("honours ?tab=reviews from the URL", () => {
    renderWithIntl(<CompanyProfileTabs {...defaultProps} />, {
      searchParams: { tab: "reviews" },
    });
    expect(
      screen.getByRole("tab", { name: "Отзывы", selected: true }),
    ).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("clicking the reviews tab activates it", async () => {
    const user = userEvent.setup();
    renderWithIntl(<CompanyProfileTabs {...defaultProps} />);
    await user.click(screen.getByRole("tab", { name: "Отзывы" }));
    expect(
      screen.getByRole("tab", { name: "Отзывы", selected: true }),
    ).toBeInTheDocument();
  });

  it("ignores the ?tab value when it is not a known tab", () => {
    renderWithIntl(<CompanyProfileTabs {...defaultProps} />, {
      searchParams: { tab: "nonsense" },
    });
    expect(
      screen.getByRole("tab", { name: "Товары", selected: true }),
    ).toBeInTheDocument();
  });
});
