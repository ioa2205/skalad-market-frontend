import { cookies } from "next/headers";

import type { Roles } from "../api/schemas/enums";

import { readAccessToken, readLocaleCookie } from "./cookies";
import { decodeAccessToken, extractRoles } from "./jwt";

export interface Session {
  userId: string;
  username: string | undefined;
  roles: Roles[];
  locale: string | undefined;
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const token = readAccessToken(store);
  const payload = decodeAccessToken(token);
  if (!payload) return null;
  return {
    userId: payload.sub,
    username: payload.preferred_username ?? payload.email,
    roles: extractRoles(payload),
    locale: readLocaleCookie(store),
  };
}
