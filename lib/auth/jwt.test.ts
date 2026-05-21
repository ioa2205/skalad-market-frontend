import { describe, expect, it } from "vitest";

import { decodeAccessToken, extractRoles, hasRole, isExpired } from "./jwt";

function encode(payload: Record<string, unknown>): string {
  const base64url = (obj: unknown) =>
    Buffer.from(JSON.stringify(obj))
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");
  const header = base64url({ alg: "RS256", typ: "JWT" });
  const body = base64url(payload);
  return `${header}.${body}.signature`;
}

describe("jwt", () => {
  it("decodes a JWT payload", () => {
    const token = encode({
      sub: "u1",
      preferred_username: "alice@example.com",
      realm_access: { roles: ["SELLER", "offline_access"] },
      exp: 9999999999,
    });
    const payload = decodeAccessToken(token);
    expect(payload?.sub).toBe("u1");
    expect(payload?.preferred_username).toBe("alice@example.com");
  });

  it("returns null for malformed tokens", () => {
    expect(decodeAccessToken("not-a-jwt")).toBeNull();
    expect(decodeAccessToken(undefined)).toBeNull();
    expect(decodeAccessToken("")).toBeNull();
  });

  it("extractRoles filters to known Roles enum values", () => {
    const token = encode({
      sub: "u1",
      realm_access: { roles: ["SELLER", "offline_access", "BUYER", "some_other"] },
    });
    const payload = decodeAccessToken(token);
    expect(extractRoles(payload).sort()).toEqual(["BUYER", "SELLER"]);
  });

  it("hasRole returns true only when role is present", () => {
    const token = encode({ sub: "u1", realm_access: { roles: ["BUYER"] } });
    const payload = decodeAccessToken(token);
    expect(hasRole(payload, "BUYER")).toBe(true);
    expect(hasRole(payload, "SELLER")).toBe(false);
  });

  it("isExpired honours exp claim", () => {
    const expired = decodeAccessToken(encode({ sub: "u1", exp: 1 }));
    const fresh = decodeAccessToken(encode({ sub: "u1", exp: 9999999999 }));
    expect(isExpired(expired)).toBe(true);
    expect(isExpired(fresh)).toBe(false);
  });
});
