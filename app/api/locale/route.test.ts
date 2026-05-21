import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { POST } from "./route";

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/locale", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("POST /api/locale", () => {
  it("sets the sx_locale cookie with the right flags on a valid locale", async () => {
    const response = await POST(makeRequest({ locale: "en" }));
    expect(response.status).toBe(200);

    const json = (await response.json()) as {
      success: boolean;
      data: { locale: string };
    };
    expect(json.success).toBe(true);
    expect(json.data.locale).toBe("en");

    const setCookie = response.headers.getSetCookie().join("\n");
    expect(setCookie).toMatch(/sx_locale=en/);
    expect(setCookie).toMatch(/SameSite=lax/i);
    expect(setCookie).toMatch(/Path=\//);

    expect(response.headers.get("x-request-id")).toBeTruthy();
  });

  it("rejects an unknown locale with 400 and does not set the cookie", async () => {
    const response = await POST(makeRequest({ locale: "fr" }));
    expect(response.status).toBe(400);
    const json = (await response.json()) as { success: boolean; message: string };
    expect(json.success).toBe(false);
    expect(json.message).toBe("invalid.locale");
    const setCookie = response.headers.getSetCookie();
    expect(setCookie.some((c) => c.startsWith("sx_locale="))).toBe(false);
  });

  it("rejects a malformed body with 400", async () => {
    const response = await POST(makeRequest("not-json"));
    expect(response.status).toBe(400);
    const json = (await response.json()) as { message: string };
    expect(json.message).toBe("invalid.body");
  });

  it("propagates an inbound x-request-id", async () => {
    const request = new NextRequest("http://localhost/api/locale", {
      method: "POST",
      headers: { "content-type": "application/json", "x-request-id": "corr-loc" },
      body: JSON.stringify({ locale: "ru" }),
    });
    const response = await POST(request);
    expect(response.headers.get("x-request-id")).toBe("corr-loc");
  });
});
