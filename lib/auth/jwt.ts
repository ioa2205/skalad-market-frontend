import { decodeJwt } from "jose";

import type { Roles } from "../api/schemas/enums";

export interface DecodedJwt {
  sub: string;
  preferred_username?: string;
  email?: string;
  realm_access?: { roles: string[] };
  exp?: number;
  iat?: number;
}

const KNOWN_ROLES: Roles[] = ["ADMIN", "SUPER_ADMIN", "BUYER", "SELLER", "MODERATOR"];

export function decodeAccessToken(token: string | undefined): DecodedJwt | null {
  if (!token) return null;
  try {
    return decodeJwt(token) as DecodedJwt;
  } catch {
    return null;
  }
}

export function extractRoles(payload: DecodedJwt | null): Roles[] {
  const raw = payload?.realm_access?.roles ?? [];
  return raw.filter((role): role is Roles => KNOWN_ROLES.includes(role as Roles));
}

export function hasRole(payload: DecodedJwt | null, role: Roles): boolean {
  return extractRoles(payload).includes(role);
}

export function isExpired(payload: DecodedJwt | null, nowSeconds: number = Date.now() / 1000): boolean {
  if (!payload?.exp) return false;
  return payload.exp <= nowSeconds;
}
