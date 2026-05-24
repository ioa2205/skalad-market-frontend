import { NextResponse, type NextRequest } from "next/server";

import { gatewayFetch, GATEWAY_FETCH_TIMEOUT_MS } from "@/lib/api/gateway";
import { apiResponseSchema } from "@/lib/api/response";
import { TokenResponseDTO } from "@/lib/api/schemas/auth";
import {
  COOKIE_NAMES,
  clearAuthCookies,
  setAccessTokenCookie,
  setRefreshTokenCookie,
} from "@/lib/auth/cookies";
import { REQUEST_ID_HEADER, resolveRequestId } from "@/lib/http/requestId";
import { toAcceptLanguage } from "@/lib/i18n/config";
import { log } from "@/lib/log";

const PROXIED_REQUEST_HEADERS = [
  "accept",
  "accept-language",
  "content-type",
  "x-session-id",
] as const;

interface ProxyContext {
  params: Promise<{ path: string[] }>;
}

interface TokenRotation {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

async function refreshTokens(
  refreshToken: string,
  requestId: string,
): Promise<TokenRotation | null> {
  let upstream: Response;
  try {
    upstream = await gatewayFetch("/api/v1/auth/refresh", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
        [REQUEST_ID_HEADER]: requestId,
      },
      body: JSON.stringify({ refreshToken }),
    });
  } catch (error) {
    log.error("proxy.refresh.fetch.failed", {
      requestId,
      code: "network.error",
      message: error instanceof Error ? error.message : String(error),
    });
    return null;
  }

  let json: unknown;
  try {
    json = await upstream.json();
  } catch {
    return null;
  }

  const envelope = apiResponseSchema(TokenResponseDTO).safeParse(json);
  if (!envelope.success || !envelope.data.success || !envelope.data.data) return null;
  const tokens = envelope.data.data;
  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresIn: tokens.expires_in,
  };
}

async function forward(
  request: NextRequest,
  upstreamPath: string,
  accessToken: string | undefined,
  acceptLanguage: string,
  requestId: string,
  rawBody: ArrayBuffer | undefined,
): Promise<Response> {
  const headers = new Headers();
  for (const name of PROXIED_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  headers.set("accept-language", acceptLanguage);
  headers.set(REQUEST_ID_HEADER, requestId);
  if (accessToken) headers.set("authorization", `Bearer ${accessToken}`);

  const search = request.nextUrl.search ?? "";
  const init: RequestInit & { timeoutMs?: number } = {
    method: request.method,
    headers,
    timeoutMs: GATEWAY_FETCH_TIMEOUT_MS,
  };
  if (rawBody && rawBody.byteLength > 0) init.body = rawBody;

  return gatewayFetch(`${upstreamPath}${search}`, init);
}

async function handler(request: NextRequest, context: ProxyContext): Promise<NextResponse> {
  const requestId = resolveRequestId(request.headers);
  const { path } = await context.params;
  const upstreamPath = `/${path.join("/")}`;

  const accessToken = request.cookies.get(COOKIE_NAMES.accessToken)?.value;
  const refreshToken = request.cookies.get(COOKIE_NAMES.refreshToken)?.value;
  const localeCookie = request.cookies.get(COOKIE_NAMES.locale)?.value;
  const acceptLanguage = toAcceptLanguage(localeCookie);

  const rawBody =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.arrayBuffer();

  let upstream: Response;
  try {
    upstream = await forward(request, upstreamPath, accessToken, acceptLanguage, requestId, rawBody);
  } catch (error) {
    log.error("proxy.fetch.failed", {
      path: upstreamPath,
      method: request.method,
      requestId,
      code: "network.error",
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { success: false, message: "network.error" },
      { status: 502, headers: { [REQUEST_ID_HEADER]: requestId } },
    );
  }

  let rotated: TokenRotation | null = null;

  if (upstream.status === 401 && refreshToken) {
    rotated = await refreshTokens(refreshToken, requestId);
    if (!rotated) {
      log.warn("proxy.refresh.failed", {
        path: upstreamPath,
        method: request.method,
        status: upstream.status,
        requestId,
        code: "session.expired",
      });
      const response = NextResponse.json(
        { success: false, message: "session.expired" },
        { status: 401, headers: { [REQUEST_ID_HEADER]: requestId } },
      );
      clearAuthCookies(response.cookies);
      return response;
    }

    try {
      upstream = await forward(
        request,
        upstreamPath,
        rotated.accessToken,
        acceptLanguage,
        requestId,
        rawBody,
      );
    } catch (error) {
      log.error("proxy.retry.fetch.failed", {
        path: upstreamPath,
        method: request.method,
        requestId,
        code: "network.error",
        message: error instanceof Error ? error.message : String(error),
      });
      return NextResponse.json(
        { success: false, message: "network.error" },
        { status: 502, headers: { [REQUEST_ID_HEADER]: requestId } },
      );
    }
  }

  if (upstream.status === 401) {
    log.warn("proxy.upstream.4xx", {
      path: upstreamPath,
      method: request.method,
      status: upstream.status,
      requestId,
    });
    const response = NextResponse.json(
      { success: false, message: "session.expired" },
      { status: 401, headers: { [REQUEST_ID_HEADER]: requestId } },
    );
    clearAuthCookies(response.cookies);
    return response;
  }

  // When we need to mutate cookies on the response, NextResponse needs the body
  // up front. Otherwise we stream the body straight through for lower TTFB.
  const responseHeaders: HeadersInit = {
    "content-type": upstream.headers.get("content-type") ?? "application/json",
    [REQUEST_ID_HEADER]: requestId,
  };

  let response: NextResponse;
  if (rotated) {
    const body = await upstream.arrayBuffer();
    response = new NextResponse(body, { status: upstream.status, headers: responseHeaders });
    setAccessTokenCookie(response.cookies, rotated.accessToken, rotated.expiresIn);
    setRefreshTokenCookie(response.cookies, rotated.refreshToken);
  } else {
    response = new NextResponse(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  }

  if (upstream.status >= 500) {
    log.error("proxy.upstream.5xx", {
      path: upstreamPath,
      method: request.method,
      status: upstream.status,
      requestId,
    });
  } else if (upstream.status >= 400) {
    log.warn("proxy.upstream.4xx", {
      path: upstreamPath,
      method: request.method,
      status: upstream.status,
      requestId,
    });
  }

  return response;
}

export async function GET(request: NextRequest, context: ProxyContext): Promise<NextResponse> {
  return handler(request, context);
}
export async function POST(request: NextRequest, context: ProxyContext): Promise<NextResponse> {
  return handler(request, context);
}
export async function PUT(request: NextRequest, context: ProxyContext): Promise<NextResponse> {
  return handler(request, context);
}
export async function PATCH(request: NextRequest, context: ProxyContext): Promise<NextResponse> {
  return handler(request, context);
}
export async function DELETE(request: NextRequest, context: ProxyContext): Promise<NextResponse> {
  return handler(request, context);
}
