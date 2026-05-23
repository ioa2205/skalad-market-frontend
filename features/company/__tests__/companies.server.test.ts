import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";

import { TEST_GATEWAY } from "@/lib/test/handlers/auth";
import { mswServer } from "@/lib/test/server";

import { fetchCompanyDetail } from "../api/companies.server";

// `serverFetch` calls `cookies()` from next/headers. The MSW global handlers
// already cover `${TEST_GATEWAY}/api/v1/companies/:slug` with a 404 case
// (`missing-company`) and a 500 case (`server-error`); we just need to stub
// `next/headers` so the cookie reads don't blow up under Vitest.
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: () => undefined,
    set: () => {},
    delete: () => {},
  }),
}));

describe("fetchCompanyDetail", () => {
  it("returns ok + parsed company on a successful response", async () => {
    const result = await fetchCompanyDetail("uzmetal-pro");
    expect(result.status).toBe("ok");
    expect(result.data).toMatchObject({
      slug: "uzmetal-pro",
      name: "UzMetal Pro",
      status: "VERIFIED",
    });
  });

  it("distinguishes a 404 with not-found status", async () => {
    const result = await fetchCompanyDetail("missing-company");
    expect(result.status).toBe("not-found");
    expect(result.data).toBeNull();
    expect(result.error?.code).toBe("company.not.found");
    expect(result.error?.correlationId).toBe("req-test-company-missing-company");
  });

  it("treats a 400 with code 'company.not.found' as not-found", async () => {
    mswServer.use(
      http.get(`${TEST_GATEWAY}/api/v1/companies/:slug`, () =>
        HttpResponse.json(
          { success: false, message: "company.not.found" },
          {
            status: 400,
            headers: { "x-request-id": "req-test-company-bad-request" },
          },
        ),
      ),
    );

    const result = await fetchCompanyDetail("missing-via-400");
    expect(result.status).toBe("not-found");
    expect(result.data).toBeNull();
    expect(result.error?.code).toBe("company.not.found");
    expect(result.error?.correlationId).toBe("req-test-company-bad-request");
  });

  it("maps a 500 to status=error with a correlation id", async () => {
    const result = await fetchCompanyDetail("server-error");
    expect(result.status).toBe("error");
    expect(result.data).toBeNull();
    expect(result.error?.correlationId).toBe("req-test-company-server-error");
  });
});
