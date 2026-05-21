import { describe, expect, it } from "vitest";

import { CatalogParams, ViewModeEnum, PerPageEnum } from "./urlParams";

describe("CatalogParams", () => {
  it("applies safe defaults when given an empty object", () => {
    const out = CatalogParams.parse({});
    expect(out.page).toBe(1);
    expect(out.perPage).toBe(20);
    expect(out.mode).toBe("grid");
    expect(out.inStock).toBe(false);
  });

  it("rejects page < 1", () => {
    expect(() => CatalogParams.parse({ page: 0 })).toThrow();
  });

  it("falls back to perPage default when value is not in {10,20,50}", () => {
    expect(CatalogParams.parse({ perPage: 7 }).perPage).toBe(20);
  });

  it("rejects unknown saleType", () => {
    expect(() => CatalogParams.parse({ saleType: "BULK" })).toThrow();
  });

  it("ignores unknown mode and falls back to grid", () => {
    expect(CatalogParams.parse({ mode: "satellite" }).mode).toBe("grid");
  });

  it("ViewModeEnum lists exactly two modes", () => {
    expect(ViewModeEnum.options).toEqual(["grid", "map"]);
  });

  it("PerPageEnum allows the expected literals", () => {
    expect(PerPageEnum.parse(10)).toBe(10);
    expect(PerPageEnum.parse(20)).toBe(20);
    expect(PerPageEnum.parse(50)).toBe(50);
  });
});
