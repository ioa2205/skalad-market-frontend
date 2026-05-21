"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchSession, type SessionSummary } from "../api/auth.client";
import { authKeys } from "../api/queryKeys";

/**
 * Reads the server-derived session. Tokens stay in the httpOnly cookie; this
 * hook only sees the decoded profile.
 */
export function useSession() {
  return useQuery<SessionSummary | null>({
    queryKey: authKeys.session,
    queryFn: fetchSession,
    staleTime: 60_000,
  });
}
