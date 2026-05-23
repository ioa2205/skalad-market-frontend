import { describe, expect, it } from "vitest";

import type { CompanyMapResponse, CompanyShortDTO } from "@/lib/api/schemas";
import { renderWithIntl, screen } from "@/lib/test/render";

import { CompanyDirectoryView } from "../components/CompanyDirectoryView";

const COMPANIES: CompanyShortDTO[] = [
  {
    id: 10,
    name: "UzMetal Pro",
    slug: "uzmetal-pro",
    logoUrl: null,
    verificationStatus: "VERIFIED",
    isBlocked: false,
    createdAt: "2026-01-01T00:00:00",
  },
  {
    id: 11,
    name: "Fergana Textile",
    slug: "fergana-textile",
    logoUrl: null,
    verificationStatus: "PENDING_VERIFICATION",
    isBlocked: false,
    createdAt: "2026-01-02T00:00:00",
  },
];

const MAP_ENTRIES: CompanyMapResponse[] = [
  {
    companyId: 10,
    companyName: "UzMetal Pro",
    companyAddress: "Tashkent",
    slug: "uzmetal-pro",
    lng: "69.2401",
    lat: "41.2995",
    logoUrl: null,
    verificationStatus: "VERIFIED",
  },
];

describe("CompanyDirectoryView", () => {
  it("shows one card per backend entry in grid view", () => {
    renderWithIntl(<CompanyDirectoryView entries={COMPANIES} />);
    expect(screen.getByRole("link", { name: /UzMetal Pro/ })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Fergana Textile/ }),
    ).toBeInTheDocument();
  });

  it("renders the server-filtered entries it receives", () => {
    renderWithIntl(<CompanyDirectoryView entries={[COMPANIES[1]!]} />);
    expect(
      screen.getByRole("link", { name: /Fergana Textile/ }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /UzMetal Pro/ })).toBeNull();
  });

  it("renders an empty state when the backend returns no entries", () => {
    renderWithIntl(<CompanyDirectoryView entries={[]} />);
    expect(screen.getByRole("heading")).toBeInTheDocument();
  });

  it("switches to the map view when view=map", () => {
    renderWithIntl(
      <CompanyDirectoryView entries={COMPANIES} mapEntries={MAP_ENTRIES} />,
      { searchParams: { view: "map" } },
    );
    expect(screen.getByRole("region")).toBeInTheDocument();
  });
});
