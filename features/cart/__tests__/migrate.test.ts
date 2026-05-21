import { beforeEach, describe, expect, it } from "vitest";

import { CART_STORE_VERSION, useCartStore } from "../store";

const STORAGE_KEY = "skladx.cart";

describe("cart persisted-storage migration", () => {
  beforeEach(() => {
    localStorage.clear();
    useCartStore.setState({ items: [], hasHydrated: false });
  });

  it("rehydrates a valid v1 payload into the store", async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        state: {
          items: [
            {
              productId: 7,
              slug: "p-7",
              name: "Item",
              companyId: 10,
              unitPrice: 50,
              currency: "USD",
              qty: 3,
            },
          ],
        },
        version: CART_STORE_VERSION,
      }),
    );

    await useCartStore.persist.rehydrate();

    expect(useCartStore.getState().items).toEqual([
      expect.objectContaining({ productId: 7, qty: 3 }),
    ]);
  });

  it("drops a corrupt payload instead of crashing", async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        state: { items: [{ wrong: "shape" }] },
        version: CART_STORE_VERSION,
      }),
    );

    await useCartStore.persist.rehydrate();

    // Invalid payload → store keeps its initial empty state.
    expect(useCartStore.getState().items).toEqual([]);
  });

  it("an older-version payload runs through migrate before merge", async () => {
    // We only have v1 today; bumping CART_STORE_VERSION later means adding a
    // case to `migrate`. This test pins the contract: the store accepts a
    // payload tagged with an older version without rejecting it outright.
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        state: {
          items: [
            {
              productId: 8,
              slug: "p-8",
              name: "Older",
              companyId: 11,
              unitPrice: 25,
              currency: "USD",
              qty: 2,
            },
          ],
        },
        version: 0,
      }),
    );

    await useCartStore.persist.rehydrate();

    expect(useCartStore.getState().items).toEqual([
      expect.objectContaining({ productId: 8, qty: 2 }),
    ]);
  });
});
