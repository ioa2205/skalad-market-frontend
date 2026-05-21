import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";

import { mswServer } from "@/lib/test/server";
import { TEST_GATEWAY } from "@/lib/test/handlers/auth";

import { fetchSellerLeads } from "../api/seller-leads.server";

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: () => undefined,
    set: () => {},
    delete: () => {},
  }),
}));

describe("fetchSellerLeads", () => {
  it("returns the paged seller inbox on success", async () => {
    const result = await fetchSellerLeads({ page: 1, perPage: 20 });
    expect(result.error).toBeUndefined();
    expect(result.items.length).toBeGreaterThanOrEqual(1);
    expect(result.items[0]?.status).toBe("NEW");
  });

  it("on a 500 returns empty meta with correlation id", async () => {
    mswServer.use(
      http.get(`${TEST_GATEWAY}/api/v1/leads/seller`, () =>
        HttpResponse.json(
          { success: false, message: "internal.error" },
          { status: 500, headers: { "x-request-id": "req-test-leads-500" } },
        ),
      ),
    );

    const result = await fetchSellerLeads({ page: 1, perPage: 20 });
    expect(result.items).toEqual([]);
    expect(result.error?.correlationId).toBe("req-test-leads-500");
  });
});
