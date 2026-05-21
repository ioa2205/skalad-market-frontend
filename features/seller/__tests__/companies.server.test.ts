import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";

import { mswServer } from "@/lib/test/server";
import { TEST_GATEWAY } from "@/lib/test/handlers/auth";

import { fetchSellerCompanies } from "../api/company-onboarding.server";

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: () => undefined,
    set: () => {},
    delete: () => {},
  }),
}));

describe("fetchSellerCompanies", () => {
  it("returns the seller's companies on success", async () => {
    const result = await fetchSellerCompanies();
    expect(result.error).toBeUndefined();
    expect(result.companies.length).toBeGreaterThanOrEqual(1);
    expect(result.companies[0]).toMatchObject({
      verificationStatus: "VERIFIED",
    });
  });

  it("treats a 401 as 'no company' (so the layout falls through to onboarding)", async () => {
    mswServer.use(
      http.get(`${TEST_GATEWAY}/api/v1/companies`, () =>
        HttpResponse.json(
          { success: false, message: "session.expired" },
          { status: 401, headers: { "x-request-id": "req-test-401" } },
        ),
      ),
    );

    const result = await fetchSellerCompanies();
    expect(result.companies).toEqual([]);
    expect(result.error).toBeUndefined();
  });

  it("on a 500 returns empty list with an error payload carrying correlation id", async () => {
    mswServer.use(
      http.get(`${TEST_GATEWAY}/api/v1/companies`, () =>
        HttpResponse.json(
          { success: false, message: "internal.error" },
          { status: 500, headers: { "x-request-id": "req-test-seller-500" } },
        ),
      ),
    );

    const result = await fetchSellerCompanies();
    expect(result.companies).toEqual([]);
    expect(result.error).toBeDefined();
    expect(result.error?.correlationId).toBe("req-test-seller-500");
  });
});
