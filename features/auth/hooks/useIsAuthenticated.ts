"use client";

import { useSession } from "./useSession";

/**
 * Boolean view over the session query. Returns `false` while the session is
 * loading or for guests, `true` only once a non-null session has been resolved.
 *
 * Used to gate authenticated-only client queries (favorites, unread count,
 * notifications) so guest pageloads don't fire wasted 401 requests.
 */
export function useIsAuthenticated(): boolean {
  const { data, isPending } = useSession();
  if (isPending) return false;
  return data !== null && data !== undefined;
}
