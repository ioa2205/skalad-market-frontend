import { beforeEach, describe, expect, it } from "vitest";

import { useCartStore } from "../store";
import type { CartItemSeed } from "../store";

const seed = (overrides: Partial<CartItemSeed> = {}): CartItemSeed => ({
  productId: 1,
  slug: "p-1",
  name: "Лист 3мм",
  companyId: 10,
  unitPrice: 100,
  currency: "USD",
  ...overrides,
});

describe("cart store reducer", () => {
  beforeEach(() => {
    useCartStore.setState({ items: [], hasHydrated: true });
  });

  it("adds a new item with default qty=1", () => {
    useCartStore.getState().add(seed({ productId: 1 }));
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0]?.qty).toBe(1);
  });

  it("merges by productId — adding the same product accumulates qty", () => {
    useCartStore.getState().add(seed({ productId: 1, qty: 2 }));
    useCartStore.getState().add(seed({ productId: 1, qty: 3 }));
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0]?.qty).toBe(5);
  });

  it("clamps merged qty at MAX_CART_QTY", () => {
    useCartStore.getState().add(seed({ productId: 1, qty: 99_000 }));
    useCartStore.getState().add(seed({ productId: 1, qty: 99_000 }));
    expect(useCartStore.getState().items[0]?.qty).toBe(99_999);
  });

  it("setQty replaces qty and clamps at the upper bound", () => {
    useCartStore.getState().add(seed({ productId: 1, qty: 5 }));
    useCartStore.getState().setQty(1, 200_000);
    expect(useCartStore.getState().items[0]?.qty).toBe(99_999);
  });

  it("setQty(<= 0) removes the line", () => {
    useCartStore.getState().add(seed({ productId: 1, qty: 5 }));
    useCartStore.getState().setQty(1, 0);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it("remove drops the matching productId", () => {
    useCartStore.getState().add(seed({ productId: 1 }));
    useCartStore.getState().add(seed({ productId: 2, slug: "p-2" }));
    useCartStore.getState().remove(1);
    expect(useCartStore.getState().items.map((i) => i.productId)).toEqual([2]);
  });

  it("clear empties the cart", () => {
    useCartStore.getState().add(seed({ productId: 1 }));
    useCartStore.getState().add(seed({ productId: 2, slug: "p-2" }));
    useCartStore.getState().clear();
    expect(useCartStore.getState().items).toHaveLength(0);
  });
});
