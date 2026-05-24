import { NextResponse, type NextRequest } from "next/server";

import { gatewayFetch } from "@/lib/api/gateway";
import { TokenResponseDTO } from "@/lib/api/schemas/auth";
import { readUpstreamEnvelope } from "@/lib/api/upstream";
import {
  COOKIE_NAMES,
  clearAuthCookies,
  setAccessTokenCookie,
  setRefreshTokenCookie,
} from "@/lib/auth/cookies";
import { REQUEST_ID_HEADER, resolveRequestId } from "@/lib/http/requestId";
import { log } from "@/lib/log";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const requestId = resolveRequestId(request.headers);
  const path = "/api/v1/auth/refresh";
  const refreshToken = request.cookies.get(COOKIE_NAMES.refreshToken)?.value;

  if (!refreshToken) {
    const response = NextResponse.json(
      { success: false, message: "refresh.token.missing" },
      { status: 401, headers: { [REQUEST_ID_HEADER]: requestId } },
    );
    clearAuthCookies(response.cookies);
    return response;
  }

  let upstream: Response;
  try {
    upstream = await gatewayFetch(path, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
        [REQUEST_ID_HEADER]: requestId,
      },
      body: JSON.stringify({ refreshToken }),
    });
  } catch (error) {
    log.error("refresh.fetch.failed", {
      path,
      method: "POST",
      requestId,
      code: "network.error",
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { success: false, message: "network.error" },
      { status: 502, headers: { [REQUEST_ID_HEADER]: requestId } },
    );
  }

  const result = await readUpstreamEnvelope(upstream, TokenResponseDTO);
  if (!result.ok || !result.envelope.success || !result.envelope.data) {
    log.warn("refresh.rejected", {
      path,
      method: "POST",
      status: upstream.status,
      requestId,
      code: result.ok ? result.envelope.message : result.message,
    });
    const response = NextResponse.json(
      { success: false, message: result.ok ? "refresh.token.invalid.expired" : result.message },
      { status: 401, headers: { [REQUEST_ID_HEADER]: requestId } },
    );
    clearAuthCookies(response.cookies);
    return response;
  }

  const tokens = result.envelope.data;
  const response = NextResponse.json(
    { success: true, data: { expiresIn: tokens.expires_in } },
    { headers: { [REQUEST_ID_HEADER]: requestId } },
  );
  setAccessTokenCookie(response.cookies, tokens.access_token, tokens.expires_in);
  setRefreshTokenCookie(response.cookies, tokens.refresh_token);

  log.info("refresh.success", { path, method: "POST", status: upstream.status, requestId });
  return response;
}
