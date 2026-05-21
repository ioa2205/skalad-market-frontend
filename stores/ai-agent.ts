"use client";

import { create } from "zustand";

interface AiAgentState {
  open: boolean;
  setOpen: (next: boolean) => void;
  toggle: () => void;
}

/**
 * Drives the "AI agent (coming soon)" drawer. The top-bar button and the
 * global ⌘+K / Ctrl+K hotkey both write here; the drawer reads the open flag.
 * Ephemeral — not persisted across reloads.
 */
export const useAiAgentStore = create<AiAgentState>((set, get) => ({
  open: false,
  setOpen: (next) => set({ open: next }),
  toggle: () => set({ open: !get().open }),
}));
