import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { mswServer } from "@/lib/test/server";

import { submitCart } from "../api/cart.client";
import type { CartItem } from "../schemas";

const item = (overrides: Partial<CartItem>): CartItem => ({
  productId: 1,
  slug: "p",
  name: "p",
  companyId: 10,
  unitPrice: 100,
  currency: "USD",
  qty: 1,
  ...overrides,
});

// MSW listen/reset/close already wired globally in vitest.setup.ts.

describe("submitCart fan-out", () => {
  it("sends one POST /leads per company with grouped productIds", async () => {
    const captured: Array<Record<string, unknown>> = [];
    mswServer.use(
      http.post("http://localhost:3000/api/proxy/api/v1/leads", async ({ request }) => {
        captured.push((await request.json()) as Record<string, unknown>);
        return HttpResponse.json(
          { success: true, data: { id: captured.length } },
          { headers: { "x-request-id": `req-${captured.length}` } },
        );
      }),
    );

    const items: CartItem[] = [
      item({ productId: 1, companyId: 10 }),
      item({ productId: 2, companyId: 11 }),
      item({ productId: 3, companyId: 10 }),
    ];

    const results = await submitCart({
      items,
      contact: { contactName: "Иван И", contactPhone: "+998900000000" },
    });

    expect(results).toHaveLength(2);
    expect(results.every((r) => r.ok)).toBe(true);
    expect(captured).toHaveLength(2);
    const sortedBodies = [...captured].sort(
      (a, b) =>
        ((a.productIds as number[])[0] ?? 0) - ((b.productIds as number[])[0] ?? 0),
    );
    expect(sortedBodies[0]).toMatchObject({
      source: "CART",
      productIds: [1, 3],
      contactName: "Иван И",
      contactPhone: "+998900000000",
    });
    expect(sortedBodies[1]).toMatchObject({
      source: "CART",
      productIds: [2],
    });
  });

  it("returns per-group failures with correlation ids — fan-out is independent", async () => {
    const items: CartItem[] = [
      item({ productId: 1, companyId: 10 }),
      // 9990 trips the test handler's failure escape hatch.
      item({ productId: 9990, companyId: 11 }),
    ];

    const results = await submitCart({
      items,
      contact: { contactName: "А", contactPhone: "+998000" },
    });

    expect(results).toHaveLength(2);
    const ok = results.find((r) => r.ok);
    const failed = results.find((r) => !r.ok);
    expect(ok?.companyId).toBe(10);
    expect(failed?.companyId).toBe(11);
    expect(failed?.error?.code).toBe("lead.create.failed");
    expect(failed?.error?.correlationId).toBe("req-test-lead-fail");
  });
});
