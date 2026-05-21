import { describe, expect, it } from "vitest";

import { sellerKeys } from "../api/queryKeys";

describe("sellerKeys", () => {
  it("nests every namespace under the same root", () => {
    expect(sellerKeys.companies()[0]).toBe("seller");
    expect(sellerKeys.products.all()[0]).toBe("seller");
    expect(sellerKeys.leads.all()[0]).toBe("seller");
  });

  it("differentiates list and detail keys for products", () => {
    const list = sellerKeys.products.list({ page: 1, perPage: 10 });
    const detail = sellerKeys.products.detail(7);
    expect(list).not.toEqual(detail);
    expect(list).toContain("list");
    expect(detail).toContain("detail");
  });

  it("includes the params object in list keys for cache differentiation", () => {
    const a = sellerKeys.leads.list({ page: 1, perPage: 20, status: "NEW" });
    const b = sellerKeys.leads.list({ page: 1, perPage: 20, status: "VIEWED" });
    expect(a).not.toEqual(b);
  });
});
