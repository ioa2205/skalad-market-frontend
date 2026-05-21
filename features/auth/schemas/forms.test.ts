import { describe, expect, it } from "vitest";

import {
  LoginFormSchema,
  RegisterFormSchema,
  ResetConfirmFormSchema,
  ResetRequestFormSchema,
  toRegistrationWire,
} from "./forms";

describe("LoginFormSchema", () => {
  it("accepts a valid email login", () => {
    const result = LoginFormSchema.safeParse({
      method: "EMAIL",
      username: "alice@skladx.com",
      password: "supersafe",
    });
    expect(result.success).toBe(true);
  });

  it("rejects malformed email when method=EMAIL", () => {
    const result = LoginFormSchema.safeParse({
      method: "EMAIL",
      username: "not-an-email",
      password: "supersafe",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((i) => i.message)).toContain(
        "auth.validation.emailInvalid",
      );
    }
  });

  it("rejects malformed phone when method=PHONE", () => {
    const result = LoginFormSchema.safeParse({
      method: "PHONE",
      username: "abc",
      password: "supersafe",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((i) => i.message)).toContain(
        "auth.validation.phoneInvalid",
      );
    }
  });

  it("accepts a valid phone with leading + and spaces", () => {
    const result = LoginFormSchema.safeParse({
      method: "PHONE",
      username: "+998 90 123 45 67",
      password: "supersafe",
    });
    expect(result.success).toBe(true);
  });

  it("requires password", () => {
    const result = LoginFormSchema.safeParse({
      method: "EMAIL",
      username: "alice@skladx.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("RegisterFormSchema", () => {
  const base = {
    role: "BUYER" as const,
    fullName: "Иван Петров",
    companyName: "",
    phone: "",
    email: "alice@skladx.com",
    password: "supersafe",
  };

  it("accepts a buyer with no company / no phone", () => {
    expect(RegisterFormSchema.safeParse(base).success).toBe(true);
  });

  it("requires full name (two words)", () => {
    const result = RegisterFormSchema.safeParse({ ...base, fullName: "Иван" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((i) => i.message)).toContain(
        "auth.validation.nameTwoWords",
      );
    }
  });

  it("requires company for SELLER", () => {
    const result = RegisterFormSchema.safeParse({
      ...base,
      role: "SELLER",
      companyName: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((i) => i.message)).toContain(
        "auth.validation.companyRequiredForSeller",
      );
    }
  });

  it("does not require company for BUYER", () => {
    const result = RegisterFormSchema.safeParse({ ...base, companyName: "" });
    expect(result.success).toBe(true);
  });

  it("rejects password shorter than 8", () => {
    const result = RegisterFormSchema.safeParse({ ...base, password: "abc" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((i) => i.message)).toContain(
        "auth.validation.passwordMin",
      );
    }
  });

  it("rejects malformed email", () => {
    const result = RegisterFormSchema.safeParse({ ...base, email: "nope" });
    expect(result.success).toBe(false);
  });

  it("treats blank phone as valid (optional)", () => {
    expect(RegisterFormSchema.safeParse({ ...base, phone: "" }).success).toBe(true);
  });

  it("rejects malformed non-blank phone", () => {
    const result = RegisterFormSchema.safeParse({ ...base, phone: "abc" });
    expect(result.success).toBe(false);
  });
});

describe("toRegistrationWire", () => {
  it("splits fullName and ships email as username", () => {
    const wire = toRegistrationWire({
      role: "BUYER",
      fullName: "Иван Петров",
      companyName: "",
      phone: "",
      email: "alice@skladx.com",
      password: "supersafe",
    });
    expect(wire.body).toEqual({
      firstName: "Иван",
      lastName: "Петров",
      username: "alice@skladx.com",
      password: "supersafe",
    });
    expect(wire.intent).toEqual({ role: "BUYER" });
  });

  it("persists company + phone in intent for SELLER", () => {
    const wire = toRegistrationWire({
      role: "SELLER",
      fullName: "Иван Петров",
      companyName: "  СкладX LLC  ",
      phone: "+998901234567",
      email: "seller@skladx.com",
      password: "supersafe",
    });
    expect(wire.intent).toEqual({
      role: "SELLER",
      companyName: "СкладX LLC",
      phone: "+998901234567",
    });
  });

  it("does not persist companyName for BUYER even if user typed one", () => {
    const wire = toRegistrationWire({
      role: "BUYER",
      fullName: "Иван Петров",
      companyName: "Buyer Co",
      phone: "+998901234567",
      email: "alice@skladx.com",
      password: "supersafe",
    });
    expect(wire.intent.companyName).toBeUndefined();
    expect(wire.intent.phone).toBe("+998901234567");
  });
});

describe("ResetRequestFormSchema", () => {
  it("accepts a valid email", () => {
    expect(
      ResetRequestFormSchema.safeParse({ email: "alice@skladx.com" }).success,
    ).toBe(true);
  });

  it("rejects empty / malformed email", () => {
    expect(ResetRequestFormSchema.safeParse({ email: "" }).success).toBe(false);
    expect(ResetRequestFormSchema.safeParse({ email: "nope" }).success).toBe(false);
  });
});

describe("ResetConfirmFormSchema", () => {
  const base = {
    username: "alice@skladx.com",
    code: "123456",
    newPassword: "supersafe",
    confirmPassword: "supersafe",
  };

  it("accepts a 6-digit code with matching passwords", () => {
    expect(ResetConfirmFormSchema.safeParse(base).success).toBe(true);
  });

  it("rejects a non-6-digit code", () => {
    const result = ResetConfirmFormSchema.safeParse({ ...base, code: "12" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((i) => i.message)).toContain(
        "auth.validation.codeFormat",
      );
    }
  });

  it("rejects mismatched passwords", () => {
    const result = ResetConfirmFormSchema.safeParse({
      ...base,
      confirmPassword: "different",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((i) => i.message)).toContain(
        "auth.validation.passwordMismatch",
      );
    }
  });
});
