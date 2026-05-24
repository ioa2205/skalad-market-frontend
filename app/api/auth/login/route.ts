import { NextResponse, type NextRequest } from "next/server";

import { gatewayFetch } from "@/lib/api/gateway";
import { LoginDTO, ProfileDTO } from "@/lib/api/schemas/auth";
import { readUpstreamEnvelope } from "@/lib/api/upstream";
import {
  clearRegisterIntentCookie,
  COOKIE_NAMES,
  readRegisterIntent,
  setAccessTokenCookie,
  setLocaleCookie,
  setRefreshTokenCookie,
} from "@/lib/auth/cookies";
import { REQUEST_ID_HEADER, resolveRequestId } from "@/lib/http/requestId";
import { isLocale, toAcceptLanguage } from "@/lib/i18n/config";
import { log } from "@/lib/log";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const requestId = resolveRequestId(request.headers);
  const path = "/api/v1/auth/registration/login";

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "invalid.request.body" },
      { status: 400, headers: { [REQUEST_ID_HEADER]: requestId } },
    );
  }

  const parsed = LoginDTO.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: "invalid.request.body" },
      { status: 400, headers: { [REQUEST_ID_HEADER]: requestId } },
    );
  }

  const localeCookie = request.cookies.get(COOKIE_NAMES.locale)?.value;
  const acceptLanguage = toAcceptLanguage(localeCookie);

  let upstream: Response;
  try {
    upstream = await gatewayFetch(path, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
        "accept-language": acceptLanguage,
        [REQUEST_ID_HEADER]: requestId,
      },
      body: JSON.stringify(parsed.data),
    });
  } catch (error) {
    log.error("login.fetch.failed", {
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

  const result = await readUpstreamEnvelope(upstream, ProfileDTO);
  if (!result.ok) {
    log.error("login.upstream.invalid", {
      path,
      method: "POST",
      status: upstream.status,
      requestId,
      code: result.message,
    });
    return NextResponse.json(
      { success: false, message: result.message },
      {
        status: result.schemaMismatch ? 502 : upstream.status,
        headers: { [REQUEST_ID_HEADER]: requestId },
      },
    );
  }

  if (!result.envelope.success || !result.envelope.data) {
    log.warn("login.rejected", {
      path,
      method: "POST",
      status: upstream.status,
      requestId,
      code: result.envelope.message,
    });
    return NextResponse.json(
      { success: false, message: result.envelope.message ?? "login.failed" },
      { status: upstream.status === 200 ? 401 : upstream.status, headers: { [REQUEST_ID_HEADER]: requestId } },
    );
  }

  const profile = result.envelope.data;
  const intent = readRegisterIntent(request.cookies);
  const redirectTo = intent?.role === "SELLER" ? "/seller/onboarding" : "/";

  const response = NextResponse.json(
    {
      success: true,
      data: {
        firstName: profile.firstName,
        lastName: profile.lastName,
        username: profile.username,
        role: profile.role,
        expiresIn: profile.expiresIn,
        redirectTo,
      },
    },
    { headers: { [REQUEST_ID_HEADER]: requestId } },
  );

  setAccessTokenCookie(response.cookies, profile.accessToken, profile.expiresIn);
  setRefreshTokenCookie(response.cookies, profile.refreshToken);
  if (isLocale(localeCookie)) {
    setLocaleCookie(response.cookies, localeCookie);
  }
  if (intent) clearRegisterIntentCookie(response.cookies);

  log.info("login.success", {
    path,
    method: "POST",
    status: upstream.status,
    requestId,
    username: profile.username,
  });

  return response;
}
