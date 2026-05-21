import { ApiError } from "@/lib/api/errors";
import { REQUEST_ID_HEADER } from "@/lib/http/requestId";

import type { RegisterRole } from "../schemas/forms";

/**
 * Browser-side fetchers for the local /api/auth/* proxies. Tokens never touch
 * client memory — these only deal with the public envelope our route handlers
 * return after stripping cookies.
 */

interface ProxyEnvelope<T> {
  success: boolean;
  data?: T;
  message?: string;
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(body),
  });
  return parseEnvelope<T>(path, response);
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(path, {
    method: "GET",
    headers: { accept: "application/json" },
  });
  return parseEnvelope<T>(path, response);
}

async function parseEnvelope<T>(path: string, response: Response): Promise<T> {
  const correlationId = response.headers.get(REQUEST_ID_HEADER) ?? undefined;
  let json: ProxyEnvelope<T>;
  try {
    json = (await response.json()) as ProxyEnvelope<T>;
  } catch {
    throw new ApiError({
      code: "invalid.response",
      message: "invalid.response",
      status: response.status,
      correlationId,
    });
  }
  if (!response.ok || !json.success || json.data === undefined) {
    throw new ApiError({
      code: json.message ?? "unknown.error",
      message: json.message ?? "unknown.error",
      status: response.status,
      correlationId,
    });
  }
  return json.data;
}

// ---- Login ----------------------------------------------------------------

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResult {
  firstName: string;
  lastName: string;
  username: string;
  role: "BUYER" | "SELLER" | "ADMIN" | "SUPER_ADMIN";
  expiresIn: number;
  redirectTo: string;
}

export function login(payload: LoginPayload): Promise<LoginResult> {
  return postJson<LoginResult>("/api/auth/login", payload);
}

// ---- Register -------------------------------------------------------------

export interface RegisterPayload {
  role: RegisterRole;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  companyName?: string;
  phone?: string;
}

export interface RegisterResult {
  username: string;
  role: RegisterRole;
}

export function register(payload: RegisterPayload): Promise<RegisterResult> {
  return postJson<RegisterResult>("/api/auth/register", payload);
}

// ---- Verify ---------------------------------------------------------------

export interface VerifyResult {
  verified: true;
}

export function verify(token: string): Promise<VerifyResult> {
  return getJson<VerifyResult>(`/api/auth/verify/${encodeURIComponent(token)}`);
}

// ---- Reset ----------------------------------------------------------------

export function resetRequest(username: string): Promise<{ sent: true }> {
  return postJson<{ sent: true }>("/api/auth/reset", { username });
}

export interface ResetConfirmPayload {
  username: string;
  confirmCode: string;
  newPassword: string;
}

export function resetConfirm(payload: ResetConfirmPayload): Promise<{ updated: true }> {
  return postJson<{ updated: true }>("/api/auth/reset/confirm", payload);
}

// ---- Logout ---------------------------------------------------------------

export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" });
}

// ---- Session --------------------------------------------------------------

export interface SessionSummary {
  userId: string;
  username: string | undefined;
  roles: string[];
  locale: string | undefined;
}

export function fetchSession(): Promise<SessionSummary | null> {
  return getJson<SessionSummary | null>("/api/auth/session");
}
