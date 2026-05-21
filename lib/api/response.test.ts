import { describe, expect, it } from "vitest";
import { z } from "zod";

import { apiResponseSchema } from "./response";

describe("apiResponseSchema", () => {
  const schema = apiResponseSchema(z.object({ id: z.number() }));

  it("accepts success payloads", () => {
    const parsed = schema.parse({ success: true, data: { id: 1 } });
    expect(parsed.success).toBe(true);
    expect(parsed.data).toEqual({ id: 1 });
  });

  it("accepts success:false with a message", () => {
    const parsed = schema.parse({ success: false, message: "wrong.password" });
    expect(parsed.success).toBe(false);
    expect(parsed.message).toBe("wrong.password");
  });

  it("rejects malformed data", () => {
    expect(() => schema.parse({ success: true, data: { id: "nope" } })).toThrow();
  });

  it("rejects missing success", () => {
    expect(() => schema.parse({ data: { id: 1 } })).toThrow();
  });
});
