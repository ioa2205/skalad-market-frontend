"use client";

import { useEffect } from "react";

import { useAiAgentStore } from "@/stores/ai-agent";

/**
 * Returns true if the keystroke should be ignored because the user is typing
 * into a real text input (text field, textarea, or a contenteditable region).
 * The only exceptions we still want to swallow are *real* edit surfaces — a
 * checkbox or a select shouldn't block ⌘K.
 */
export function shouldIgnoreHotkeyTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  // happy-dom does not implement `isContentEditable`; fall back to the attr.
  const editable = target.getAttribute("contenteditable");
  if (editable === "" || editable === "true" || editable === "plaintext-only") {
    return true;
  }

  const tag = target.tagName;
  if (tag === "TEXTAREA") return true;
  if (tag === "INPUT") {
    const type = (target as HTMLInputElement).type;
    const blocked = new Set([
      "text",
      "search",
      "email",
      "password",
      "tel",
      "url",
      "number",
    ]);
    return blocked.has(type);
  }
  return false;
}

export function isAiAgentHotkey(event: KeyboardEvent): boolean {
  if (event.key !== "k" && event.key !== "K") return false;
  return event.metaKey || event.ctrlKey;
}

/**
 * Mounts the global ⌘+K / Ctrl+K binding for the AI-agent drawer. Toggles the
 * store value so a second press closes the drawer.
 */
export function useAiAgentHotkey(): void {
  const toggle = useAiAgentStore((s) => s.toggle);

  useEffect(() => {
    function handler(event: KeyboardEvent) {
      if (!isAiAgentHotkey(event)) return;
      if (shouldIgnoreHotkeyTarget(event.target)) return;
      event.preventDefault();
      toggle();
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggle]);
}
