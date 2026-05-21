import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { POST } from "./route";

function makeRequest(cookies?: Record<string, string>): NextRequest {
  const req = new NextRequest("http://localhost/api/auth/refresh", { method: "POST" });
  if (cookies) {
    for (const [name, value] of Object.entries(cookies)) {
      req.cookies.set(name, value);
    }
  }
  return req;
}

describe("POST /api/auth/refresh", () => {
  it("rotates cookies on success", async () => {
    const response = await POST(makeRequest({ sx_rt: "valid" }));
    expect(response.status).toBe(200);

    const setCookie = response.headers.getSetCookie().join("\n");
    expect(setCookie).toMatch(/sx_at=access-2/);
    expect(setCookie).toMatch(/sx_rt=refresh-2/);
  });

  it("clears cookies and returns 401 on invalid refresh token", async () => {
    const response = await POST(makeRequest({ sx_rt: "invalid" }));
    expect(response.status).toBe(401);

    const json = (await response.json()) as { message: string };
    expect(json.message).toBe("refresh.token.invalid.expired");

    const setCookie = response.headers.getSetCookie().join("\n");
    expect(setCookie).toMatch(/sx_at=;/);
    expect(setCookie).toMatch(/sx_rt=;/);
  });

  it("returns 401 + clears cookies when sx_rt is missing", async () => {
    const response = await POST(makeRequest());
    expect(response.status).toBe(401);
    const json = (await response.json()) as { message: string };
    expect(json.message).toBe("refresh.token.missing");
  });
});
