"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface SidebarState {
  collapsed: boolean;
  hasHydrated: boolean;
  toggle: () => void;
  setCollapsed: (next: boolean) => void;
  setHasHydrated: (value: boolean) => void;
}

/**
 * Sidebar expand/collapse persists across reloads. Hydration is gated by
 * `hasHydrated` so SSR doesn't render the wrong state and snap on mount.
 */
export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      collapsed: true,
      hasHydrated: false,
      toggle: () => set((state) => ({ collapsed: !state.collapsed })),
      setCollapsed: (next) => set({ collapsed: next }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "skladx.sidebar",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ collapsed: state.collapsed }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    },
  ),
);
