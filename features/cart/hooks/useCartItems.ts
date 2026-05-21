"use client";

import { useEffect, useState } from "react";

import { useCartStore } from "../store";

/**
 * SSR-safe hook for cart items: returns `[]` until the persist middleware has
 * rehydrated, so server output and client first paint don't disagree.
 */
export function useCartItems() {
  const items = useCartStore((s) => s.items);
  const hydrated = useCartStore((s) => s.hasHydrated);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted && hydrated ? items : [];
}

export function useCartItemCount(): number {
  const items = useCartItems();
  return items.reduce((acc, item) => acc + item.qty, 0);
}
