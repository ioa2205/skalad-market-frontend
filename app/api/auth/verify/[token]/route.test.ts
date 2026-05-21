import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { GET } from "./route";

function makeContext(token: string) {
  return { params: Promise.resolve({ token }) };
}

describe("GET /api/auth/verify/[token]", () => {
  it("returns success for a valid token", async () => {
    const request = new NextRequest("http://localhost/api/auth/verify/abc12345", {
      method: "GET",
    });
    const response = await GET(request, makeContext("abc12345"));
    expect(response.status).toBe(200);
    const json = (await response.json()) as {
      success: boolean;
      data: { verified: boolean };
    };
    expect(json.success).toBe(true);
    expect(json.data.verified).toBe(true);
    expect(response.headers.get("x-request-id")).toBeTruthy();
  });

  it("bubbles verification.wrong for a bad token", async () => {
    const request = new NextRequest("http://localhost/api/auth/verify/bad-token", {
      method: "GET",
    });
    const response = await GET(request, makeContext("bad-token"));
    expect(response.status).toBe(400);
    const json = (await response.json()) as { message: string };
    expect(json.message).toBe("verification.wrong");
  });

  it("rejects empty / too-short tokens without hitting the gateway", async () => {
    const request = new NextRequest("http://localhost/api/auth/verify/x", {
      method: "GET",
    });
    const response = await GET(request, makeContext("x"));
    expect(response.status).toBe(400);
    const json = (await response.json()) as { message: string };
    expect(json.message).toBe("verification.wrong");
  });
});
