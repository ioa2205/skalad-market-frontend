import { describe, expect, it } from "vitest";

import { isFullNameComplete, splitFullName } from "./splitName";

describe("splitFullName", () => {
  it("splits on first whitespace", () => {
    expect(splitFullName("Иван Петров")).toEqual({
      firstName: "Иван",
      lastName: "Петров",
    });
  });

  it("collapses multi-word surnames into lastName", () => {
    expect(splitFullName("Анна Мария Соколова")).toEqual({
      firstName: "Анна",
      lastName: "Мария Соколова",
    });
  });

  it("trims leading/trailing whitespace and collapses internal runs", () => {
    expect(splitFullName("   Иван   Петров   ")).toEqual({
      firstName: "Иван",
      lastName: "Петров",
    });
  });

  it("single-token input has empty lastName", () => {
    expect(splitFullName("Иван")).toEqual({
      firstName: "Иван",
      lastName: "",
    });
  });

  it("empty input has both empty", () => {
    expect(splitFullName("")).toEqual({ firstName: "", lastName: "" });
    expect(splitFullName("   ")).toEqual({ firstName: "", lastName: "" });
  });
});

describe("isFullNameComplete", () => {
  it("requires both firstName and lastName", () => {
    expect(isFullNameComplete("Иван Петров")).toBe(true);
    expect(isFullNameComplete("Иван")).toBe(false);
    expect(isFullNameComplete("")).toBe(false);
    expect(isFullNameComplete("   ")).toBe(false);
  });
});
