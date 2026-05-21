import { NextResponse, type NextRequest } from "next/server";

import { getSession } from "@/lib/auth/session";
import { REQUEST_ID_HEADER, resolveRequestId } from "@/lib/http/requestId";

/**
 * Returns the server-derived `Session` (decoded from the httpOnly access-token
 * cookie). Used by the client `useSession()` hook so client components never
 * touch the raw token. Returns `null` if no session is established.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const requestId = resolveRequestId(request.headers);
  const session = await getSession();
  return NextResponse.json(
    { success: true, data: session },
    { headers: { [REQUEST_ID_HEADER]: requestId } },
  );
}
