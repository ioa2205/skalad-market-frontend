import { describe, expect, it } from "vitest";

import { catalogParsers } from "./useCatalogParams";

describe("catalogParsers", () => {
  it("strings round-trip through parse/serialize", () => {
    expect(catalogParsers.q.parse("стал")).toBe("стал");
    expect(catalogParsers.q.serialize("стал")).toBe("стал");
  });

  it("page parses integers and rejects rubbish back to default", () => {
    expect(catalogParsers.page.parse("3")).toBe(3);
    expect(catalogParsers.page.parse("oops")).toBeNull();
  });

  it("perPage clamps to {10,20,50}", () => {
    expect(catalogParsers.perPage.parse("10")).toBe(10);
    expect(catalogParsers.perPage.parse("20")).toBe(20);
    expect(catalogParsers.perPage.parse("50")).toBe(50);
    expect(catalogParsers.perPage.parse("7")).toBeNull();
  });

  it("saleType only accepts WHOLESALE or RETAIL", () => {
    expect(catalogParsers.saleType.parse("WHOLESALE")).toBe("WHOLESALE");
    expect(catalogParsers.saleType.parse("RETAIL")).toBe("RETAIL");
    expect(catalogParsers.saleType.parse("BULK")).toBeNull();
  });

  it("mode only accepts grid or map", () => {
    expect(catalogParsers.mode.parse("grid")).toBe("grid");
    expect(catalogParsers.mode.parse("map")).toBe("map");
    expect(catalogParsers.mode.parse("satellite")).toBeNull();
  });

  it("boolean toggles parse the literal forms nuqs emits", () => {
    expect(catalogParsers.inStock.parse("true")).toBe(true);
    expect(catalogParsers.inStock.parse("false")).toBe(false);
  });
});
