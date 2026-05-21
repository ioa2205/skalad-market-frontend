import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { z } from "zod";

import { mswServer } from "../test/server";

import { apiFetch } from "./client";
import { ApiError } from "./errors";

const categorySchema = z.object({ id: z.number(), name: z.string() });

describe("apiFetch", () => {
  it("unwraps ApiResponse and returns parsed data", async () => {
    mswServer.use(
      http.get("http://localhost/api/proxy/api/v1/category/1", () =>
        HttpResponse.json({ success: true, data: { id: 1, name: "Tools" } }),
      ),
    );

    const result = await apiFetch("/api/v1/category/1", {
      schema: categorySchema,
      baseUrl: "http://localhost/api/proxy",
    });
    expect(result).toEqual({ id: 1, name: "Tools" });
  });

  it("throws ApiError carrying code, status, and correlation id on success:false", async () => {
    mswServer.use(
      http.post("http://localhost/api/proxy/api/v1/auth/registration/login", () =>
        HttpResponse.json(
          { success: false, message: "wrong.password" },
          { status: 401, headers: { "x-request-id": "corr-123" } },
        ),
      ),
    );

    await expect(
      apiFetch("/api/v1/auth/registration/login", {
        method: "POST",
        body: { username: "a", password: "b" },
        schema: z.object({ accessToken: z.string() }),
        baseUrl: "http://localhost/api/proxy",
      }),
    ).rejects.toMatchObject({
      name: "ApiError",
      code: "wrong.password",
      status: 401,
      correlationId: "corr-123",
    });
  });

  it("throws ApiError when zod rejects the data payload (drift)", async () => {
    mswServer.use(
      http.get("http://localhost/api/proxy/api/v1/category/1", () =>
        HttpResponse.json({ success: true, data: { id: "oops", name: 1 } }),
      ),
    );

    await expect(
      apiFetch("/api/v1/category/1", {
        schema: categorySchema,
        baseUrl: "http://localhost/api/proxy",
      }),
    ).rejects.toThrow();
  });

  it("sends JSON content-type only when a body is provided", async () => {
    let capturedContentType: string | null = null;
    mswServer.use(
      http.get("http://localhost/api/proxy/ping", ({ request }) => {
        capturedContentType = request.headers.get("content-type");
        return HttpResponse.json({ success: true, data: { id: 1, name: "x" } });
      }),
    );

    await apiFetch("/ping", { schema: categorySchema, baseUrl: "http://localhost/api/proxy" });
    expect(capturedContentType).toBeNull();
  });

  it("ApiError.from passes through existing ApiError instances", () => {
    const e = new ApiError({ code: "x", message: "y", status: 500 });
    expect(ApiError.from(e)).toBe(e);
  });
});
