import { describe, expect, it } from "vitest";

import { cn } from "./cn";

describe("cn", () => {
  it("joins truthy class names", () => {
    expect(cn("a", "b", false && "c", undefined, "d")).toBe("a b d");
  });

  it("merges conflicting Tailwind classes — later wins", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-fg", "text-fg-muted")).toBe("text-fg-muted");
  });

  it("handles arrays and objects", () => {
    expect(cn(["a", "b"], { c: true, d: false })).toBe("a b c");
  });
});
