import { NextResponse, type NextRequest } from "next/server";

import { gatewayFetch } from "@/lib/api/gateway";
import { apiResponseSchema } from "@/lib/api/response";
import { TokenResponseDTO } from "@/lib/api/schemas/auth";
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

  let json: unknown;
  try {
    json = await upstream.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "invalid.response" },
      { status: 502, headers: { [REQUEST_ID_HEADER]: requestId } },
    );
  }

  const envelope = apiResponseSchema(TokenResponseDTO).safeParse(json);
  if (!envelope.success || !envelope.data.success || !envelope.data.data) {
    log.warn("refresh.rejected", {
      path,
      method: "POST",
      status: upstream.status,
      requestId,
      code: envelope.success ? envelope.data.message : "schema.mismatch",
    });
    const response = NextResponse.json(
      { success: false, message: "refresh.token.invalid.expired" },
      { status: 401, headers: { [REQUEST_ID_HEADER]: requestId } },
    );
    clearAuthCookies(response.cookies);
    return response;
  }

  const tokens = envelope.data.data;
  const response = NextResponse.json(
    { success: true, data: { expiresIn: tokens.expires_in } },
    { headers: { [REQUEST_ID_HEADER]: requestId } },
  );
  setAccessTokenCookie(response.cookies, tokens.access_token, tokens.expires_in);
  setRefreshTokenCookie(response.cookies, tokens.refresh_token);

  log.info("refresh.success", { path, method: "POST", status: upstream.status, requestId });
  return response;
}
