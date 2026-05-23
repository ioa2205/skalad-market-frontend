import { describe, expect, it } from "vitest";

import { ProfileFormSchema } from "../schemas/profileForm";

describe("ProfileFormSchema", () => {
  it("accepts a fully filled form and trims whitespace", () => {
    const result = ProfileFormSchema.safeParse({
      firstName: "  Иван  ",
      lastName: "Петров",
      position: "  Закупки  ",
      telegram: "@ivanp",
      extraPhone: "+998 99 123 45 67",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        firstName: "Иван",
        lastName: "Петров",
        position: "Закупки",
        telegram: "@ivanp",
        extraPhone: "+998 99 123 45 67",
      });
    }
  });

  it("rejects blank profile fields required by the backend", () => {
    const result = ProfileFormSchema.safeParse({
      firstName: "Иван",
      lastName: "Петров",
      position: "   ",
      telegram: "",
      extraPhone: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      expect(messages).toEqual(
        expect.arrayContaining([
          "positionRequired",
          "telegramRequired",
          "extraPhoneRequired",
        ]),
      );
    }
  });

  it("rejects empty firstName with the firstNameRequired key", () => {
    const result = ProfileFormSchema.safeParse({
      firstName: "   ",
      lastName: "Петров",
      position: "Закупки",
      telegram: "@ivanp",
      extraPhone: "+998 99 123 45 67",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const firstName = result.error.issues.find((i) =>
        i.path.includes("firstName"),
      );
      expect(firstName?.message).toBe("firstNameRequired");
    }
  });

  it("rejects empty lastName with the lastNameRequired key", () => {
    const result = ProfileFormSchema.safeParse({
      firstName: "Иван",
      lastName: "",
      position: "Закупки",
      telegram: "@ivanp",
      extraPhone: "+998 99 123 45 67",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const lastName = result.error.issues.find((i) =>
        i.path.includes("lastName"),
      );
      expect(lastName?.message).toBe("lastNameRequired");
    }
  });

  it("rejects values longer than the max length with the tooLong key", () => {
    const long = "x".repeat(201);
    const result = ProfileFormSchema.safeParse({
      firstName: "Иван",
      lastName: "Петров",
      position: long,
      telegram: "@ivanp",
      extraPhone: "+998 99 123 45 67",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const position = result.error.issues.find((i) =>
        i.path.includes("position"),
      );
      expect(position?.message).toBe("tooLong");
    }
  });
});
