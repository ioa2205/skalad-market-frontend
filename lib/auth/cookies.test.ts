import { describe, expect, it, vi } from "vitest";

import {
  ACCESS_TOKEN_MAX_AGE,
  COOKIE_NAMES,
  REFRESH_TOKEN_MAX_AGE,
  clearAuthCookies,
  readAccessToken,
  readRefreshToken,
  setAccessTokenCookie,
  setLocaleCookie,
  setRefreshTokenCookie,
} from "./cookies";

function makeStore() {
  return {
    set: vi.fn(),
    delete: vi.fn(),
    get: vi.fn(),
  };
}

describe("cookies", () => {
  it("setAccessTokenCookie sets httpOnly + SameSite=Lax + path=/", () => {
    const store = makeStore();
    setAccessTokenCookie(store, "jwt-access");
    expect(store.set).toHaveBeenCalledWith({
      name: COOKIE_NAMES.accessToken,
      value: "jwt-access",
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: ACCESS_TOKEN_MAX_AGE,
    });
  });

  it("setRefreshTokenCookie scopes path to / with 7-day TTL", () => {
    const store = makeStore();
    setRefreshTokenCookie(store, "jwt-refresh");
    expect(store.set).toHaveBeenCalledWith({
      name: COOKIE_NAMES.refreshToken,
      value: "jwt-refresh",
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: REFRESH_TOKEN_MAX_AGE,
    });
    expect(REFRESH_TOKEN_MAX_AGE).toBe(60 * 60 * 24 * 7);
  });

  it("setLocaleCookie is not httpOnly so next-intl can read it client-side if needed", () => {
    const store = makeStore();
    setLocaleCookie(store, "ru");
    const call = store.set.mock.calls[0]?.[0] as { httpOnly: boolean; name: string };
    expect(call?.httpOnly).toBe(false);
    expect(call?.name).toBe(COOKIE_NAMES.locale);
  });

  it("clearAuthCookies deletes both auth cookies with correct paths", () => {
    const store = makeStore();
    clearAuthCookies(store);
    expect(store.delete).toHaveBeenCalledWith({ name: COOKIE_NAMES.accessToken, path: "/" });
    expect(store.delete).toHaveBeenCalledWith({
      name: COOKIE_NAMES.refreshToken,
      path: "/",
    });
  });

  it("readAccessToken returns undefined when missing", () => {
    const store = makeStore();
    store.get.mockReturnValue(undefined);
    expect(readAccessToken(store)).toBeUndefined();
  });

  it("readAccessToken returns value when present", () => {
    const store = makeStore();
    store.get.mockImplementation((name: string) =>
      name === COOKIE_NAMES.accessToken ? { value: "tok" } : undefined,
    );
    expect(readAccessToken(store)).toBe("tok");
  });

  it("readRefreshToken returns value when present", () => {
    const store = makeStore();
    store.get.mockImplementation((name: string) =>
      name === COOKIE_NAMES.refreshToken ? { value: "rtok" } : undefined,
    );
    expect(readRefreshToken(store)).toBe("rtok");
  });
});
