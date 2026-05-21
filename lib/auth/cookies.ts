import type { ResponseCookies } from "next/dist/compiled/@edge-runtime/cookies";
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

import type { AppLanguage } from "../api/schemas/enums";

export const COOKIE_NAMES = {
  accessToken: "sx_at",
  refreshToken: "sx_rt",
  locale: "sx_locale",
  registerIntent: "sx_register_intent",
  sessionId: "sx_session",
} as const;

export const ACCESS_TOKEN_MAX_AGE = 300;
export const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7;
export const LOCALE_MAX_AGE = 60 * 60 * 24 * 365;
export const REGISTER_INTENT_MAX_AGE = 60 * 60 * 24 * 30;
export const SESSION_ID_MAX_AGE = 60 * 60 * 24 * 180;

export type RegisterIntentRole = "BUYER" | "SELLER";

export interface RegisterIntent {
  role: RegisterIntentRole;
  companyName?: string;
  phone?: string;
}

const isProd = (): boolean => process.env.NODE_ENV === "production";

interface CookieStore {
  set(input: {
    name: string;
    value: string;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: "lax" | "strict" | "none";
    path?: string;
    maxAge?: number;
  }): void;
  delete(input: { name: string; path?: string }): void;
  get(name: string): { value: string } | undefined;
}

export function setAccessTokenCookie(
  store: CookieStore | ResponseCookies,
  token: string,
  maxAge: number = ACCESS_TOKEN_MAX_AGE,
): void {
  store.set({
    name: COOKIE_NAMES.accessToken,
    value: token,
    httpOnly: true,
    secure: isProd(),
    sameSite: "lax",
    path: "/",
    maxAge,
  });
}

export function setRefreshTokenCookie(
  store: CookieStore | ResponseCookies,
  token: string,
  maxAge: number = REFRESH_TOKEN_MAX_AGE,
): void {
  store.set({
    name: COOKIE_NAMES.refreshToken,
    value: token,
    httpOnly: true,
    secure: isProd(),
    sameSite: "lax",
    path: "/",
    maxAge,
  });
}

export function setLocaleCookie(
  store: CookieStore | ResponseCookies,
  locale: AppLanguage | string,
): void {
  store.set({
    name: COOKIE_NAMES.locale,
    value: locale,
    httpOnly: false,
    secure: isProd(),
    sameSite: "lax",
    path: "/",
    maxAge: LOCALE_MAX_AGE,
  });
}

export function clearAuthCookies(store: CookieStore | ResponseCookies): void {
  store.delete({ name: COOKIE_NAMES.accessToken, path: "/" });
  store.delete({ name: COOKIE_NAMES.refreshToken, path: "/" });
}

export function setRegisterIntentCookie(
  store: CookieStore | ResponseCookies,
  intent: RegisterIntent,
): void {
  store.set({
    name: COOKIE_NAMES.registerIntent,
    value: encodeURIComponent(JSON.stringify(intent)),
    httpOnly: false,
    secure: isProd(),
    sameSite: "lax",
    path: "/",
    maxAge: REGISTER_INTENT_MAX_AGE,
  });
}

export function clearRegisterIntentCookie(store: CookieStore | ResponseCookies): void {
  store.delete({ name: COOKIE_NAMES.registerIntent, path: "/" });
}

interface CookieReader {
  get(name: string): { value: string } | undefined;
}

export function readRegisterIntent(
  store: CookieReader | undefined,
): RegisterIntent | undefined {
  const raw = store?.get?.(COOKIE_NAMES.registerIntent)?.value;
  if (!raw) return undefined;
  let decoded: string;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    decoded = raw;
  }
  try {
    const parsed = JSON.parse(decoded) as Partial<RegisterIntent> | null;
    if (!parsed || (parsed.role !== "BUYER" && parsed.role !== "SELLER")) return undefined;
    return {
      role: parsed.role,
      companyName: typeof parsed.companyName === "string" ? parsed.companyName : undefined,
      phone: typeof parsed.phone === "string" ? parsed.phone : undefined,
    };
  } catch {
    return undefined;
  }
}

export function readAccessToken(
  store: ReadonlyRequestCookies | CookieStore | undefined,
): string | undefined {
  return store?.get?.(COOKIE_NAMES.accessToken)?.value;
}

export function readRefreshToken(
  store: ReadonlyRequestCookies | CookieStore | undefined,
): string | undefined {
  return store?.get?.(COOKIE_NAMES.refreshToken)?.value;
}

export function readLocaleCookie(
  store: ReadonlyRequestCookies | CookieStore | undefined,
): string | undefined {
  return store?.get?.(COOKIE_NAMES.locale)?.value;
}

export function setSessionIdCookie(
  store: CookieStore | ResponseCookies,
  sessionId: string,
  maxAge: number = SESSION_ID_MAX_AGE,
): void {
  store.set({
    name: COOKIE_NAMES.sessionId,
    value: sessionId,
    httpOnly: true,
    secure: isProd(),
    sameSite: "lax",
    path: "/",
    maxAge,
  });
}

export function readSessionIdCookie(
  store: ReadonlyRequestCookies | CookieStore | undefined,
): string | undefined {
  return store?.get?.(COOKIE_NAMES.sessionId)?.value;
}
