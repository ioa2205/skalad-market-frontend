import { describe, expect, it } from "vitest";

import { renderWithIntl, screen } from "@/lib/test/render";

import { STUB_COMPANIES } from "../api/fixtures";
import { CompanyDirectoryView } from "../components/CompanyDirectoryView";

describe("CompanyDirectoryView", () => {
  it("shows one card per fixture entry in grid view", () => {
    renderWithIntl(<CompanyDirectoryView entries={STUB_COMPANIES} />);
    // Each card exposes the open-link with the company name in its aria label.
    const links = screen.getAllByRole("link", {
      name: /Открыть страницу компании/,
    });
    expect(links.length).toBeGreaterThanOrEqual(STUB_COMPANIES.length);
  });

  it("filters by search query", () => {
    renderWithIntl(<CompanyDirectoryView entries={STUB_COMPANIES} />, {
      searchParams: { q: "Текстиль" },
    });
    expect(
      screen.getByRole("link", { name: /Fergana Textile/ }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /UzMetal Pro/ }),
    ).toBeNull();
  });

  it("renders an empty state when no entry matches the query", () => {
    renderWithIntl(<CompanyDirectoryView entries={STUB_COMPANIES} />, {
      searchParams: { q: "QWERTY-NO-MATCH" },
    });
    expect(
      screen.getByText("По вашему запросу ничего не найдено"),
    ).toBeInTheDocument();
  });

  it("switches to the map stub when view=map", () => {
    renderWithIntl(<CompanyDirectoryView entries={STUB_COMPANIES} />, {
      searchParams: { view: "map" },
    });
    expect(
      screen.getByRole("region", { name: /Карта компаний/ }),
    ).toBeInTheDocument();
  });
});
