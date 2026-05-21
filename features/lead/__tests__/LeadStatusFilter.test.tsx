import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { renderWithIntl, screen } from "@/lib/test/render";

import { LeadStatusFilter, isLeadStatus } from "../components/LeadStatusFilter";

const replaceMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: replaceMock }),
  usePathname: () => "/account/leads",
  useSearchParams: () => new URLSearchParams(),
}));

describe("isLeadStatus", () => {
  it("accepts valid statuses", () => {
    expect(isLeadStatus("NEW")).toBe(true);
    expect(isLeadStatus("CANCELED")).toBe(true);
  });

  it("rejects unknown values, empty string, null and undefined", () => {
    expect(isLeadStatus("BOGUS")).toBe(false);
    expect(isLeadStatus("")).toBe(false);
    expect(isLeadStatus(null)).toBe(false);
    expect(isLeadStatus(undefined)).toBe(false);
  });
});

describe("LeadStatusFilter", () => {
  it("writes ?status= when a chip is picked and resets paging", async () => {
    replaceMock.mockClear();
    const user = userEvent.setup();
    renderWithIntl(<LeadStatusFilter />);

    await user.click(screen.getByRole("button", { name: /Новый/i }));

    expect(replaceMock).toHaveBeenCalledWith(
      "/account/leads?status=NEW",
      expect.objectContaining({ scroll: false }),
    );
  });

  it("clears ?status= when the All chip is picked", async () => {
    replaceMock.mockClear();
    const user = userEvent.setup();
    renderWithIntl(<LeadStatusFilter active="VIEWED" />);

    await user.click(screen.getByRole("button", { name: /^Все$/ }));

    expect(replaceMock).toHaveBeenCalledWith(
      "/account/leads",
      expect.objectContaining({ scroll: false }),
    );
  });
});
