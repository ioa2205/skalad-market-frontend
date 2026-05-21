import { describe, expect, it } from "vitest";

import type { CartItem } from "../schemas";
import {
  clampQty,
  groupByCompany,
  itemCount,
  lineTotal,
  totalsByCurrency,
} from "../selectors";

const item = (overrides: Partial<CartItem>): CartItem => ({
  productId: 1,
  slug: "p-1",
  name: "Лист 3мм",
  companyId: 10,
  unitPrice: 100,
  currency: "USD",
  qty: 1,
  ...overrides,
});

describe("cart selectors", () => {
  describe("groupByCompany", () => {
    it("groups items by companyId, preserving order within group", () => {
      const items = [
        item({ productId: 1, companyId: 10 }),
        item({ productId: 2, companyId: 11 }),
        item({ productId: 3, companyId: 10 }),
      ];
      const groups = groupByCompany(items);
      expect(groups).toHaveLength(2);
      expect(groups[0]?.companyId).toBe(10);
      expect(groups[0]?.items.map((i) => i.productId)).toEqual([1, 3]);
      expect(groups[1]?.companyId).toBe(11);
      expect(groups[1]?.items.map((i) => i.productId)).toEqual([2]);
    });

    it("returns one group per company even when all items belong to one", () => {
      const items = [item({ productId: 1 }), item({ productId: 2 })];
      const groups = groupByCompany(items);
      expect(groups).toHaveLength(1);
      expect(groups[0]?.items).toHaveLength(2);
    });

    it("returns [] for an empty cart", () => {
      expect(groupByCompany([])).toEqual([]);
    });
  });

  describe("totalsByCurrency", () => {
    it("sums per currency, ignoring null-priced lines", () => {
      const items = [
        item({ productId: 1, unitPrice: 100, currency: "USD", qty: 2 }),
        item({ productId: 2, unitPrice: 50, currency: "USD", qty: 1 }),
        item({ productId: 3, unitPrice: 1000, currency: "UZS", qty: 3 }),
        item({ productId: 4, unitPrice: null, currency: "USD", qty: 1 }),
      ];
      expect(totalsByCurrency(items)).toEqual([
        { currency: "USD", amount: 250 },
        { currency: "UZS", amount: 3000 },
      ]);
    });

    it("returns [] when every item is NEGOTIABLE", () => {
      expect(totalsByCurrency([item({ unitPrice: null })])).toEqual([]);
    });
  });

  describe("lineTotal / itemCount / clampQty", () => {
    it("lineTotal returns null for negotiable lines", () => {
      expect(lineTotal(item({ unitPrice: null }))).toBeNull();
    });
    it("lineTotal multiplies unitPrice by qty", () => {
      expect(lineTotal(item({ unitPrice: 25, qty: 4 }))).toBe(100);
    });
    it("itemCount sums qty across lines", () => {
      expect(itemCount([item({ qty: 2 }), item({ productId: 2, qty: 3 })])).toBe(5);
    });
    it("clampQty floors below 1 to 1 and above 99_999 to 99_999", () => {
      expect(clampQty(0)).toBe(1);
      expect(clampQty(-5)).toBe(1);
      expect(clampQty(100_000)).toBe(99_999);
      expect(clampQty(2.7)).toBe(2);
      expect(clampQty(Number.NaN)).toBe(1);
    });
  });
});
