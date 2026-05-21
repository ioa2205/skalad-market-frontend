import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { POST } from "./route";

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/auth/reset", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/reset", () => {
  it("returns success for a known username", async () => {
    const response = await POST(makeRequest({ username: "alice@skladx.com" }));
    expect(response.status).toBe(200);
    const json = (await response.json()) as { success: boolean; data: { sent: boolean } };
    expect(json.success).toBe(true);
    expect(json.data.sent).toBe(true);
  });

  it("bubbles username.not.found", async () => {
    const response = await POST(makeRequest({ username: "unknown@skladx.com" }));
    expect(response.status).toBe(404);
    const json = (await response.json()) as { message: string };
    expect(json.message).toBe("username.not.found");
  });

  it("returns 400 on malformed body", async () => {
    const response = await POST(makeRequest({}));
    expect(response.status).toBe(400);
  });
});
