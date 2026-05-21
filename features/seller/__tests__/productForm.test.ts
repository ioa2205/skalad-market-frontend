import { describe, expect, it } from "vitest";

import {
  ProductCreateFormSchema,
  ProductEditFormSchema,
  toCreateProductWire,
  toUpdateProductWire,
} from "../schemas/productForm";

describe("ProductCreateFormSchema", () => {
  it("rejects missing required fields (saleType, minProduct, price, description)", () => {
    const result = ProductCreateFormSchema.safeParse({
      name: "Лист",
      categoryId: 1,
      priceType: "FIXED",
      currency: "UZS",
      regionId: 1,
      // missing: description, saleType, price, minProduct
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join("."));
      expect(paths).toContain("description");
      expect(paths).toContain("saleType");
      expect(paths).toContain("price");
      expect(paths).toContain("minProduct");
    }
  });

  it("emits the i18n-key for an empty description (custom message fires when present-but-blank)", () => {
    const result = ProductCreateFormSchema.safeParse({
      name: "Лист",
      description: "",
      categoryId: 1,
      priceType: "FIXED",
      saleType: "WHOLESALE",
      price: 100,
      currency: "UZS",
      regionId: 1,
      minProduct: 1,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const codes = result.error.issues.map((i) => i.message);
      expect(codes).toContain(
        "seller.dashboard.products.validation.descriptionRequired",
      );
    }
  });

  it("accepts a full create payload", () => {
    const result = ProductCreateFormSchema.safeParse({
      name: "Стальной лист",
      description: "ГОСТ",
      categoryId: 5,
      priceType: "FIXED",
      saleType: "WHOLESALE",
      price: 850,
      currency: "USD",
      regionId: 1,
      minProduct: 5,
    });
    expect(result.success).toBe(true);
  });
});

describe("ProductEditFormSchema", () => {
  it("does NOT include saleType / minProduct (edit endpoint rejects them)", () => {
    const result = ProductEditFormSchema.safeParse({
      name: "Лист",
      categoryId: 1,
      priceType: "FIXED",
      currency: "UZS",
      regionId: 1,
    });
    expect(result.success).toBe(true);
  });
});

describe("toCreateProductWire", () => {
  it("emits camelCase keys with required fields and merges companyId", () => {
    const wire = toCreateProductWire(
      {
        name: "Лист",
        description: "ГОСТ",
        categoryId: 5,
        priceType: "FIXED",
        saleType: "WHOLESALE",
        price: 850,
        currency: "USD",
        regionId: 1,
        minProduct: 5,
      },
      42,
    );
    expect(wire).toEqual({
      companyId: 42,
      categoryId: 5,
      name: "Лист",
      description: "ГОСТ",
      priceType: "FIXED",
      saleType: "WHOLESALE",
      price: 850,
      currency: "USD",
      regionId: 1,
      minProduct: 5,
    });
  });
});

describe("toUpdateProductWire", () => {
  it("emits snake_case keys (per backend @JsonProperty) with no saleType / minProduct", () => {
    const wire = toUpdateProductWire(
      {
        name: "Лист",
        categoryId: 5,
        priceType: "FIXED",
        price: 900,
        currency: "USD",
        regionId: 1,
      },
      42,
    );
    expect(wire).toMatchObject({
      company_id: 42,
      category_id: 5,
      name: "Лист",
      price_type: "FIXED",
      price: 900,
      currency: "USD",
      region_id: 1,
    });
    expect(wire).not.toHaveProperty("saleType");
    expect(wire).not.toHaveProperty("minProduct");
  });
});
