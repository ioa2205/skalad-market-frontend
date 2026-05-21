import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { POST } from "./route";

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/login", () => {
  it("sets sx_at, sx_rt cookies on success with correct flags", async () => {
    const response = await POST(makeRequest({ username: "alice", password: "correct" }));
    expect(response.status).toBe(200);

    const json = (await response.json()) as {
      success: boolean;
      data: { username: string; role: string; redirectTo: string };
    };
    expect(json.success).toBe(true);
    expect(json.data.username).toBe("alice");
    expect(json.data.redirectTo).toBe("/");

    const setCookie = response.headers.getSetCookie();
    const joined = setCookie.join("\n");
    expect(joined).toMatch(/sx_at=access-1/);
    expect(joined).toMatch(/sx_rt=refresh-1/);
    expect(joined).toMatch(/HttpOnly/i);
    expect(joined).toMatch(/SameSite=lax/i);
    expect(joined).toMatch(/sx_rt=[^\n]*Path=\//); // refresh on root path
    // request id must be present on response
    expect(response.headers.get("x-request-id")).toBeTruthy();
  });

  it("redirects SELLER intent to /seller/onboarding and clears the intent cookie", async () => {
    const request = new NextRequest("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username: "alice", password: "correct" }),
    });
    request.cookies.set(
      "sx_register_intent",
      encodeURIComponent(JSON.stringify({ role: "SELLER" })),
    );

    const response = await POST(request);
    expect(response.status).toBe(200);
    const json = (await response.json()) as { data: { redirectTo: string } };
    expect(json.data.redirectTo).toBe("/seller/onboarding");

    const setCookies = response.headers.getSetCookie().join("\n");
    expect(setCookies).toMatch(/sx_register_intent=;.*Path=\//i);
  });

  it("surfaces wrong.password without setting cookies", async () => {
    const response = await POST(makeRequest({ username: "alice", password: "nope" }));
    expect(response.status).toBe(401);
    const json = (await response.json()) as { success: boolean; message: string };
    expect(json.success).toBe(false);
    expect(json.message).toBe("wrong.password");
    const setCookie = response.headers.getSetCookie();
    expect(setCookie.some((c) => c.startsWith("sx_at="))).toBe(false);
  });

  it("surfaces account.locked", async () => {
    const response = await POST(makeRequest({ username: "alice", password: "locked" }));
    expect(response.status).toBe(423);
    const json = (await response.json()) as { message: string };
    expect(json.message).toBe("account.locked");
  });

  it("returns 400 on malformed body", async () => {
    const response = await POST(makeRequest({ username: "" }));
    expect(response.status).toBe(400);
  });

  it("propagates inbound x-request-id", async () => {
    const request = new NextRequest("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json", "x-request-id": "corr-abc" },
      body: JSON.stringify({ username: "a", password: "correct" }),
    });
    const response = await POST(request);
    expect(response.headers.get("x-request-id")).toBe("corr-abc");
  });
});
