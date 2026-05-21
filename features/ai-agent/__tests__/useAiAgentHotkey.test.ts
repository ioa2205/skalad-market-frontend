import { describe, expect, it } from "vitest";

import {
  isAiAgentHotkey,
  shouldIgnoreHotkeyTarget,
} from "../hooks/useAiAgentHotkey";

function ev(init: KeyboardEventInit): KeyboardEvent {
  return new KeyboardEvent("keydown", init);
}

describe("isAiAgentHotkey", () => {
  it("matches ⌘+K and Ctrl+K", () => {
    expect(isAiAgentHotkey(ev({ key: "k", metaKey: true }))).toBe(true);
    expect(isAiAgentHotkey(ev({ key: "K", ctrlKey: true }))).toBe(true);
  });

  it("ignores plain k or other modifiers", () => {
    expect(isAiAgentHotkey(ev({ key: "k" }))).toBe(false);
    expect(isAiAgentHotkey(ev({ key: "j", metaKey: true }))).toBe(false);
    expect(isAiAgentHotkey(ev({ key: "k", altKey: true }))).toBe(false);
    expect(isAiAgentHotkey(ev({ key: "k", shiftKey: true }))).toBe(false);
  });
});

describe("shouldIgnoreHotkeyTarget", () => {
  it("returns true for text inputs, search, email, password, tel, url, number", () => {
    for (const type of [
      "text",
      "search",
      "email",
      "password",
      "tel",
      "url",
      "number",
    ]) {
      const input = document.createElement("input");
      input.type = type;
      expect(shouldIgnoreHotkeyTarget(input)).toBe(true);
    }
  });

  it("returns true for textarea and contenteditable", () => {
    expect(shouldIgnoreHotkeyTarget(document.createElement("textarea"))).toBe(
      true,
    );
    const editable = document.createElement("div");
    editable.setAttribute("contenteditable", "true");
    expect(shouldIgnoreHotkeyTarget(editable)).toBe(true);
  });

  it("returns false for non-text inputs and other elements", () => {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    expect(shouldIgnoreHotkeyTarget(checkbox)).toBe(false);

    const button = document.createElement("button");
    expect(shouldIgnoreHotkeyTarget(button)).toBe(false);

    expect(shouldIgnoreHotkeyTarget(null)).toBe(false);
  });
});
