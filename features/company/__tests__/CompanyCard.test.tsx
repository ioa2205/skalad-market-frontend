import { describe, expect, it } from "vitest";

import { renderWithIntl, screen } from "@/lib/test/render";

import { CompanyCard, type CompanyCardData } from "../components/CompanyCard";

const baseCompany: CompanyCardData = {
  id: 1,
  name: "UzMetal Pro",
  slug: "uzmetal-pro",
  logoInitials: "UM",
  logoUrl: null,
  shortDescription: "Металлургия Ташкент. Более 20 лет на рынке.",
  industry: "Металлургия",
  region: "Ташкент",
  verified: true,
  ratingStub: 4.8,
  reviewsCountStub: 127,
  productsCountStub: 1500,
  isStub: true,
};

describe("CompanyCard", () => {
  it("renders the verified badge when verified=true", () => {
    renderWithIntl(<CompanyCard company={baseCompany} />);
    expect(
      screen.getByLabelText("Компания верифицирована"),
    ).toBeInTheDocument();
  });

  it("hides the verified badge when verified=false", () => {
    renderWithIntl(
      <CompanyCard company={{ ...baseCompany, verified: false }} />,
    );
    expect(
      screen.queryByLabelText("Компания верифицирована"),
    ).toBeNull();
  });

  it("provides a keyboard-focusable open link with the right href and aria-label", () => {
    renderWithIntl(<CompanyCard company={baseCompany} />);
    const link = screen.getByRole("link", {
      name: /Открыть страницу компании «UzMetal Pro»/,
    });
    expect(link).toHaveAttribute("href", "/companies/uzmetal-pro");
  });

  it("renders metric values formatted as integer or 1-decimal rating", () => {
    renderWithIntl(<CompanyCard company={baseCompany} />);
    expect(screen.getByText("4.8")).toBeInTheDocument();
    expect(screen.getByText("127")).toBeInTheDocument();
  });

  it("renders an em-dash when a metric is null instead of a fake zero", () => {
    renderWithIntl(
      <CompanyCard
        company={{
          ...baseCompany,
          ratingStub: null,
          reviewsCountStub: null,
          productsCountStub: null,
        }}
      />,
    );
    expect(screen.getAllByText("—").length).toBeGreaterThanOrEqual(3);
  });

  it("the favorite stub button is aria-disabled and does not navigate", () => {
    renderWithIntl(<CompanyCard company={baseCompany} />);
    const fav = screen.getByRole("button", {
      name: "Сохранить компанию (скоро)",
    });
    expect(fav).toHaveAttribute("aria-disabled", "true");
  });
});
