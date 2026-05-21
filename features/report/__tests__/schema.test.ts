import { describe, expect, it } from "vitest";

import { ReportCreateRequest } from "@/lib/api/schemas/report";

import { ReportFormSchema } from "../schemas/form";

describe("ReportCreateRequest (wire)", () => {
  it("accepts a minimal valid payload", () => {
    const parsed = ReportCreateRequest.parse({
      targetType: "PRODUCT",
      targetId: 1,
      reasonCode: "SCAM",
    });
    expect(parsed.comment).toBeUndefined();
  });

  it("rejects an unknown reason code", () => {
    const result = ReportCreateRequest.safeParse({
      targetType: "PRODUCT",
      targetId: 1,
      reasonCode: "OTHER",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a non-positive targetId", () => {
    const result = ReportCreateRequest.safeParse({
      targetType: "PRODUCT",
      targetId: 0,
      reasonCode: "SCAM",
    });
    expect(result.success).toBe(false);
  });
});

describe("ReportFormSchema (RHF)", () => {
  it("requires reasonCode", () => {
    const result = ReportFormSchema.safeParse({ reasonCode: "", comment: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const codes = result.error.issues.map((i) => i.message);
      expect(codes).toContain("reasonRequired");
    }
  });

  it("trims comment to undefined when only whitespace", () => {
    const parsed = ReportFormSchema.parse({
      reasonCode: "FAKE",
      comment: "   ",
    });
    expect(parsed.comment).toBeUndefined();
  });

  it("rejects a comment over 500 characters", () => {
    const result = ReportFormSchema.safeParse({
      reasonCode: "FAKE",
      comment: "a".repeat(501),
    });
    expect(result.success).toBe(false);
  });
});
