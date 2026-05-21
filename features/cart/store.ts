"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { log } from "@/lib/log";

import { CartStateV1, MAX_CART_QTY, type CartItem } from "./schemas";
import { clampQty } from "./selectors";

const STORAGE_KEY = "skladx.cart";
export const CART_STORE_VERSION = 1;

export type CartItemSeed = Omit<CartItem, "qty"> & { qty?: number };

interface CartState {
  items: CartItem[];
  hasHydrated: boolean;
  add: (seed: CartItemSeed) => void;
  setQty: (productId: number, qty: number) => void;
  remove: (productId: number) => void;
  clear: () => void;
  setHasHydrated: (value: boolean) => void;
}

function mergeAdd(items: CartItem[], seed: CartItemSeed): CartItem[] {
  const seedQty = clampQty(seed.qty ?? 1);
  const existing = items.find((item) => item.productId === seed.productId);
  if (!existing) {
    return [...items, { ...seed, qty: seedQty }];
  }
  const next = clampQty(existing.qty + seedQty);
  return items.map((item) =>
    item.productId === seed.productId ? { ...item, qty: next } : item,
  );
}

/**
 * Cart lives entirely in the client (backend has no cart endpoint —
 * `LeadSource.CART` is only a checkout hint). Persisted to localStorage with
 * a versioned schema; corrupt payloads are rejected via zod, not crashed on.
 */
export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      hasHydrated: false,
      add: (seed) => set((state) => ({ items: mergeAdd(state.items, seed) })),
      setQty: (productId, qty) =>
        set((state) => {
          const clamped = clampQty(qty);
          if (qty <= 0) {
            return { items: state.items.filter((i) => i.productId !== productId) };
          }
          return {
            items: state.items.map((item) =>
              item.productId === productId ? { ...item, qty: clamped } : item,
            ),
          };
        }),
      remove: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        })),
      clear: () => set({ items: [] }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: STORAGE_KEY,
      version: CART_STORE_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      // Validate on rehydrate — if storage is corrupt, drop it, don't crash.
      merge: (persistedState, currentState) => {
        const parsed = CartStateV1.safeParse(persistedState);
        if (!parsed.success) {
          log.warn("cart.persisted.invalid", { issues: parsed.error.issues });
          return currentState;
        }
        return { ...currentState, items: parsed.data.items };
      },
      // Migrations: ship as identity for v1; bumping the version later means
      // adding a case that maps the old shape forward.
      migrate: (persistedState, version) => {
        if (version === CART_STORE_VERSION) return persistedState;
        return persistedState;
      },
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    },
  ),
);

export { MAX_CART_QTY };
