import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { mswServer } from "@/lib/test/server";

import { createLead } from "../api/leads.client";

describe("createLead body shape", () => {
  it("sends source=PRODUCT with productId", async () => {
    const captured: unknown[] = [];
    mswServer.use(
      http.post("http://localhost:3000/api/proxy/api/v1/leads", async ({ request }) => {
        captured.push(await request.json());
        return HttpResponse.json(
          { success: true, data: { id: 42 } },
          { headers: { "x-request-id": "req-prod" } },
        );
      }),
    );

    const result = await createLead({
      source: "PRODUCT",
      productId: 7,
      contactName: "А Б",
      contactPhone: "+998",
    });

    expect(result.leadId).toBe(42);
    expect(result.correlationId).toBe("req-prod");
    expect(captured[0]).toEqual({
      source: "PRODUCT",
      productId: 7,
      contactName: "А Б",
      contactPhone: "+998",
    });
  });

  it("sends source=CART with productIds and includes comment when present", async () => {
    const captured: unknown[] = [];
    mswServer.use(
      http.post("http://localhost:3000/api/proxy/api/v1/leads", async ({ request }) => {
        captured.push(await request.json());
        return HttpResponse.json(
          { success: true, data: { id: 1 } },
          { headers: { "x-request-id": "req-cart" } },
        );
      }),
    );

    await createLead({
      source: "CART",
      productIds: [1, 2, 3],
      contactName: "Buyer",
      contactPhone: "+998",
      comment: "До 1 мая",
    });

    expect(captured[0]).toEqual({
      source: "CART",
      productIds: [1, 2, 3],
      contactName: "Buyer",
      contactPhone: "+998",
      comment: "До 1 мая",
    });
  });

  it("throws ApiError with the correlation id when the proxy returns a failure envelope", async () => {
    mswServer.use(
      http.post("http://localhost:3000/api/proxy/api/v1/leads", () =>
        HttpResponse.json(
          { success: false, message: "lead.create.failed" },
          { status: 500, headers: { "x-request-id": "req-boom" } },
        ),
      ),
    );

    await expect(
      createLead({
        source: "PRODUCT",
        productId: 7,
        contactName: "А Б",
        contactPhone: "+998",
      }),
    ).rejects.toMatchObject({
      code: "lead.create.failed",
      correlationId: "req-boom",
    });
  });
});
