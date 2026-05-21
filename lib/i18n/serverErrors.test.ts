import { describe, expect, it } from "vitest";

import { isKnownServerErrorKey, SERVER_ERROR_KEYS, toCopyKey } from "./serverErrors";

describe("isKnownServerErrorKey", () => {
  it("recognizes every registered key", () => {
    for (const key of SERVER_ERROR_KEYS) {
      expect(isKnownServerErrorKey(key)).toBe(true);
    }
  });

  it("rejects unknown codes and undefined", () => {
    expect(isKnownServerErrorKey("nope")).toBe(false);
    expect(isKnownServerErrorKey(undefined)).toBe(false);
  });
});

describe("toCopyKey", () => {
  it("maps known codes to auth.errors.* keys", () => {
    expect(toCopyKey("account.locked")).toBe("auth.errors.accountLocked");
    expect(toCopyKey("wrong.password")).toBe("auth.errors.wrongPassword");
    expect(toCopyKey("verification.wrong")).toBe("auth.errors.verificationWrong");
    expect(toCopyKey("username.not.found")).toBe("auth.errors.usernameNotFound");
  });

  it("falls back to auth.errors.generic for unknown codes", () => {
    expect(toCopyKey("something.else")).toBe("auth.errors.generic");
    expect(toCopyKey(undefined)).toBe("auth.errors.generic");
  });
});
