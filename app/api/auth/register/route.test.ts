import { http, HttpResponse } from "msw";
import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { TEST_GATEWAY } from "@/lib/test/handlers/auth";
import { mswServer } from "@/lib/test/server";

import { POST } from "./route";

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/auth/register", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validBody = {
  role: "BUYER" as const,
  firstName: "Иван",
  lastName: "Петров",
  username: "alice@skladx.com",
  password: "supersafe",
};

describe("POST /api/auth/register", () => {
  it("forwards ?roles= query param taken from the form body", async () => {
    let receivedRolesParam: string | null = null;
    mswServer.use(
      http.post(`${TEST_GATEWAY}/api/v1/auth/registration`, async ({ request }) => {
        const url = new URL(request.url);
        receivedRolesParam = url.searchParams.get("roles");
        return HttpResponse.json({ success: true, data: "ok" });
      }),
    );

    const response = await POST(makeRequest({ ...validBody, role: "SELLER" }));
    expect(response.status).toBe(200);
    expect(receivedRolesParam).toBe("SELLER");
  });

  it("does not forward the local-only fields (role, companyName, phone) to the gateway", async () => {
    let upstreamBody: Record<string, unknown> = {};
    mswServer.use(
      http.post(`${TEST_GATEWAY}/api/v1/auth/registration`, async ({ request }) => {
        upstreamBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ success: true, data: "ok" });
      }),
    );

    await POST(
      makeRequest({
        ...validBody,
        role: "SELLER",
        companyName: "СкладX",
        phone: "+998901234567",
      }),
    );

    expect(upstreamBody).toEqual({
      firstName: "Иван",
      lastName: "Петров",
      username: "alice@skladx.com",
      password: "supersafe",
    });
  });

  it("sets sx_register_intent cookie with companyName + phone for SELLER", async () => {
    const response = await POST(
      makeRequest({
        ...validBody,
        role: "SELLER",
        companyName: "СкладX",
        phone: "+998901234567",
      }),
    );
    expect(response.status).toBe(200);
    const setCookies = response.headers.getSetCookie().join("\n");
    expect(setCookies).toMatch(/sx_register_intent=/);
    const match = setCookies.match(/sx_register_intent=([^;]+)/);
    expect(match).not.toBeNull();
    if (match) {
      // Set-Cookie serialization percent-encodes our already-encoded payload.
      const intent = JSON.parse(decodeURIComponent(decodeURIComponent(match[1]!)));
      expect(intent).toEqual({
        role: "SELLER",
        companyName: "СкладX",
        phone: "+998901234567",
      });
    }
  });

  it("does not persist companyName for BUYER role", async () => {
    const response = await POST(
      makeRequest({ ...validBody, companyName: "Buyer Co", phone: "" }),
    );
    expect(response.status).toBe(200);
    const match = response.headers
      .getSetCookie()
      .join("\n")
      .match(/sx_register_intent=([^;]+)/);
    expect(match).not.toBeNull();
    if (match) {
      // Set-Cookie serialization percent-encodes our already-encoded payload.
      const intent = JSON.parse(decodeURIComponent(decodeURIComponent(match[1]!)));
      expect(intent).toEqual({ role: "BUYER" });
    }
  });

  it("bubbles username.already.taken from the gateway envelope", async () => {
    const response = await POST(makeRequest({ ...validBody, username: "taken@x.com" }));
    expect(response.status).toBe(409);
    const json = (await response.json()) as { message: string };
    expect(json.message).toBe("username.already.taken");
  });

  it("returns 400 on malformed body", async () => {
    const response = await POST(makeRequest({ role: "BUYER", username: "" }));
    expect(response.status).toBe(400);
  });

  it("propagates inbound x-request-id", async () => {
    const request = new NextRequest("http://localhost/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json", "x-request-id": "corr-reg" },
      body: JSON.stringify(validBody),
    });
    const response = await POST(request);
    expect(response.headers.get("x-request-id")).toBe("corr-reg");
  });
});
