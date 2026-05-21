import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { POST } from "./route";

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/auth/reset/confirm", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/reset/confirm", () => {
  it("returns success for a valid code", async () => {
    const response = await POST(
      makeRequest({
        username: "alice@skladx.com",
        confirmCode: "123456",
        newPassword: "supersafe",
      }),
    );
    expect(response.status).toBe(200);
    const json = (await response.json()) as { data: { updated: boolean } };
    expect(json.data.updated).toBe(true);
  });

  it("bubbles verification.wrong for a bad code", async () => {
    const response = await POST(
      makeRequest({
        username: "alice@skladx.com",
        confirmCode: "000000",
        newPassword: "supersafe",
      }),
    );
    expect(response.status).toBe(400);
    const json = (await response.json()) as { message: string };
    expect(json.message).toBe("verification.wrong");
  });

  it("returns 400 on malformed body", async () => {
    const response = await POST(makeRequest({ username: "" }));
    expect(response.status).toBe(400);
  });
});
