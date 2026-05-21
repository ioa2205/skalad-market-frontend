import { describe, expect, it } from "vitest";

import {
  CompanyStepContactSchema,
  CompanyStepProfileSchema,
  CompanyWizardSchema,
  toCompanyRequestDTO,
  type CompanyWizardValues,
} from "../schemas/companyForm";

const baseValid: CompanyWizardValues = {
  name: "Алтын Цемент",
  shortDescription: "Цемент М400",
  description: "Подробно",
  stir: "123456789",
  phonePrimary: "+998 90 123 45 67",
  phoneSecondary: "",
  website: "",
  regionId: 1,
  districtId: 101,
  address: "Ташкент, Чиланзар",
  logoUrl: "",
  coverFileName: "",
};

describe("CompanyStepProfileSchema", () => {
  it("rejects too-short name with the named validation key", () => {
    const result = CompanyStepProfileSchema.safeParse({
      name: "",
      stir: "123456789",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === "name");
      expect(issue?.message).toBe("seller.onboarding.validation.nameRequired");
    }
  });

  it("rejects STIR that is not 9–14 digits", () => {
    const result = CompanyStepProfileSchema.safeParse({
      name: "Тест",
      stir: "abc",
    });
    expect(result.success).toBe(false);
  });
});

describe("CompanyStepContactSchema", () => {
  it("requires region and district to be non-zero positive integers", () => {
    const result = CompanyStepContactSchema.safeParse({
      phonePrimary: "+998 90 123 45 67",
      regionId: 0,
      districtId: 0,
      address: "Какая-то улица 1",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const codes = result.error.issues.map((i) => i.message);
      expect(codes).toContain("seller.onboarding.validation.regionRequired");
      expect(codes).toContain("seller.onboarding.validation.districtRequired");
    }
  });

  it("rejects malformed phone numbers", () => {
    const result = CompanyStepContactSchema.safeParse({
      phonePrimary: "abc",
      regionId: 1,
      districtId: 101,
      address: "Some address",
    });
    expect(result.success).toBe(false);
  });

  it("accepts an empty optional secondary phone", () => {
    const result = CompanyStepContactSchema.safeParse({
      phonePrimary: "+998 90 123 45 67",
      phoneSecondary: "",
      regionId: 1,
      districtId: 101,
      address: "Ташкент",
    });
    expect(result.success).toBe(true);
  });
});

describe("toCompanyRequestDTO", () => {
  it("strips wizard-only fields and maps to the camelCase wire shape", () => {
    const dto = toCompanyRequestDTO(baseValid);
    expect(dto).toMatchObject({
      name: "Алтын Цемент",
      stir: "123456789",
      phonePrimary: "+998 90 123 45 67",
      regionId: 1,
      districtId: 101,
      address: "Ташкент, Чиланзар",
    });
    expect(dto).not.toHaveProperty("logoUrl");
    expect(dto).not.toHaveProperty("coverFileName");
  });

  it("omits empty optional fields entirely (not as empty strings)", () => {
    const dto = toCompanyRequestDTO({
      ...baseValid,
      shortDescription: "",
      description: "",
      phoneSecondary: "",
      website: "",
    });
    expect(dto).not.toHaveProperty("shortDescription");
    expect(dto).not.toHaveProperty("description");
    expect(dto).not.toHaveProperty("phoneSecondary");
    expect(dto).not.toHaveProperty("website");
  });

  it("retains optional fields when populated", () => {
    const dto = toCompanyRequestDTO({
      ...baseValid,
      website: "https://altyn-cement.uz",
      phoneSecondary: "+998 71 200 00 00",
    });
    expect(dto.website).toBe("https://altyn-cement.uz");
    expect(dto.phoneSecondary).toBe("+998 71 200 00 00");
  });
});

describe("CompanyWizardSchema (composed)", () => {
  it("accepts a fully-valid wizard payload across all three steps", () => {
    const result = CompanyWizardSchema.safeParse(baseValid);
    expect(result.success).toBe(true);
  });
});
