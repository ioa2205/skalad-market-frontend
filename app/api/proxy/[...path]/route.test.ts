import { http, HttpResponse } from "msw";
import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { TEST_GATEWAY } from "@/lib/test/handlers/auth";
import { mswServer } from "@/lib/test/server";

import { GET } from "./route";

function makeRequest(
  path: string,
  options: { cookies?: Record<string, string>; requestId?: string } = {},
): { req: NextRequest; ctx: { params: Promise<{ path: string[] }> } } {
  const headers: Record<string, string> = {};
  if (options.requestId) headers["x-request-id"] = options.requestId;
  const req = new NextRequest(`http://localhost/api/proxy/${path}`, { headers });
  if (options.cookies) {
    for (const [name, value] of Object.entries(options.cookies)) {
      req.cookies.set(name, value);
    }
  }
  const segments = path.split("/");
  return { req, ctx: { params: Promise.resolve({ path: segments }) } };
}

describe("GET /api/proxy/[...path]", () => {
  it("forwards with bearer, mints x-request-id, returns payload", async () => {
    const { req, ctx } = makeRequest("api/v1/category", { cookies: { sx_at: "good" } });
    const response = await GET(req, ctx);
    expect(response.status).toBe(200);
    expect(response.headers.get("x-request-id")).toBeTruthy();
    const json = (await response.json()) as { success: boolean };
    expect(json.success).toBe(true);
  });

  it("propagates inbound x-request-id", async () => {
    const { req, ctx } = makeRequest("api/v1/category", {
      cookies: { sx_at: "good" },
      requestId: "corr-xyz",
    });
    const response = await GET(req, ctx);
    expect(response.headers.get("x-request-id")).toBe("corr-xyz");
  });

  it("on 401 → attempts single refresh, retries, rotates cookies", async () => {
    const { req, ctx } = makeRequest("api/v1/category", {
      cookies: { sx_at: "expired", sx_rt: "valid" },
    });
    const response = await GET(req, ctx);
    expect(response.status).toBe(200);
    const setCookie = response.headers.getSetCookie().join("\n");
    expect(setCookie).toMatch(/sx_at=access-2/);
    expect(setCookie).toMatch(/sx_rt=refresh-2/);
  });

  it("on 401 with bad refresh → clears cookies, returns 401 session.expired", async () => {
    const { req, ctx } = makeRequest("api/v1/category", {
      cookies: { sx_at: "expired", sx_rt: "invalid" },
    });
    const response = await GET(req, ctx);
    expect(response.status).toBe(401);
    const json = (await response.json()) as { message: string };
    expect(json.message).toBe("session.expired");
    const setCookie = response.headers.getSetCookie().join("\n");
    expect(setCookie).toMatch(/sx_at=;/);
    expect(setCookie).toMatch(/sx_rt=;/);
  });

  it("returns 502 on network failure to upstream", async () => {
    mswServer.use(http.get(`${TEST_GATEWAY}/api/v1/boom`, () => HttpResponse.error()));
    const { req, ctx } = makeRequest("api/v1/boom", { cookies: { sx_at: "good" } });
    const response = await GET(req, ctx);
    expect(response.status).toBe(502);
    const json = (await response.json()) as { message: string };
    expect(json.message).toBe("network.error");
  });
});
