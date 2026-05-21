import { NextResponse, type NextRequest } from "next/server";

import { clearAuthCookies } from "@/lib/auth/cookies";
import { REQUEST_ID_HEADER, resolveRequestId } from "@/lib/http/requestId";
import { log } from "@/lib/log";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const requestId = resolveRequestId(request.headers);
  const response = NextResponse.json(
    { success: true, data: { loggedOut: true } },
    { headers: { [REQUEST_ID_HEADER]: requestId } },
  );
  clearAuthCookies(response.cookies);
  log.info("logout", { path: "/api/auth/logout", method: "POST", requestId });
  return response;
}
