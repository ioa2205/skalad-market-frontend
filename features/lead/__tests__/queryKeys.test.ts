import { describe, expect, it } from "vitest";

import { leadsKeys } from "../api/queryKeys";

describe("leadsKeys", () => {
  it("namespaces every key under ['leads']", () => {
    expect(leadsKeys.all).toEqual(["leads"]);
    expect(leadsKeys.list({ page: 1, perPage: 20 })[0]).toBe("leads");
    expect(leadsKeys.detail(7)[0]).toBe("leads");
  });

  it("differentiates list params so React Query doesn't share caches", () => {
    const a = leadsKeys.list({ page: 1, perPage: 20 });
    const b = leadsKeys.list({ page: 2, perPage: 20 });
    const c = leadsKeys.list({ page: 1, perPage: 20, status: "NEW" });
    expect(a).not.toEqual(b);
    expect(a).not.toEqual(c);
  });

  it("differentiates detail keys per id", () => {
    expect(leadsKeys.detail(1)).not.toEqual(leadsKeys.detail(2));
  });
});
