import { describe, expect, it } from "vitest";

import type { LeadResponse } from "@/lib/api/schemas/lead";
import type { ProductResponse } from "@/lib/api/schemas/product";

import { aggregateKpis } from "../utils/aggregateKpis";

function product(
  overrides: Partial<ProductResponse> = {},
): ProductResponse {
  return {
    id: 1,
    companyId: 42,
    sellerId: 7,
    categoryId: 1,
    name: "Стальной лист",
    slug: "stalnoy-list",
    shortDescription: null,
    description: null,
    priceType: "FIXED",
    price: "100",
    currency: "USD",
    regionId: 1,
    districtId: null,
    attributes: null,
    status: "APPROVED",
    isActive: true,
    isPromoted: false,
    promotedUntil: null,
    rejectReason: null,
    viewsCountCache: 0,
    favoritesCountCache: 0,
    createdAt: "2026-01-01T00:00:00",
    images: [],
    ...overrides,
  };
}

function lead(overrides: Partial<LeadResponse> = {}): LeadResponse {
  return {
    id: 1,
    buyerId: 100,
    sellerId: 7,
    companyId: 42,
    source: "PRODUCT",
    status: "NEW",
    contactName: "Test",
    contactPhone: "+998",
    comment: null,
    closeReason: null,
    items: [],
    ...overrides,
  };
}

describe("aggregateKpis", () => {
  it("counts only APPROVED + isActive products as active", () => {
    const result = aggregateKpis({
      products: [
        product({ id: 1, status: "APPROVED", isActive: true }),
        product({ id: 2, status: "APPROVED", isActive: false }),
        product({ id: 3, status: "PENDING", isActive: true }),
        product({ id: 4, status: "ARCHIVED", isActive: true }),
      ],
      leads: [],
    });
    expect(result.activeProducts).toBe(1);
  });

  it("openLeads = NEW + VIEWED only", () => {
    const result = aggregateKpis({
      products: [],
      leads: [
        lead({ id: 1, status: "NEW" }),
        lead({ id: 2, status: "VIEWED" }),
        lead({ id: 3, status: "CONTACTED" }),
        lead({ id: 4, status: "CLOSED" }),
        lead({ id: 5, status: "CANCELED" }),
      ],
    });
    expect(result.openLeads).toBe(2);
  });

  it("distinctContacts deduplicates by buyerId across all leads", () => {
    const result = aggregateKpis({
      products: [],
      leads: [
        lead({ id: 1, buyerId: 1 }),
        lead({ id: 2, buyerId: 1 }),
        lead({ id: 3, buyerId: 2 }),
        lead({ id: 4, buyerId: 3 }),
      ],
    });
    expect(result.distinctContacts).toBe(3);
  });

  it("returns zeros on empty inputs", () => {
    expect(aggregateKpis({ products: [], leads: [] })).toEqual({
      activeProducts: 0,
      openLeads: 0,
      distinctContacts: 0,
    });
  });
});
