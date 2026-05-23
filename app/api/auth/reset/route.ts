import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { gatewayFetch } from "@/lib/api/gateway";
import { apiResponseSchema } from "@/lib/api/response";
import { ResetPasswordDTO } from "@/lib/api/schemas/auth";
import { COOKIE_NAMES } from "@/lib/auth/cookies";
import { REQUEST_ID_HEADER, resolveRequestId } from "@/lib/http/requestId";
import { toAcceptLanguage } from "@/lib/i18n/config";
import { log } from "@/lib/log";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const requestId = resolveRequestId(request.headers);
  const path = "/api/v1/auth/registration/reset";

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "invalid.request.body" },
      { status: 400, headers: { [REQUEST_ID_HEADER]: requestId } },
    );
  }

  const parsed = ResetPasswordDTO.safeParse(body);
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
    log.error("reset.fetch.failed", {
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

  const envelope = apiResponseSchema(z.string()).safeParse(json);
  if (!envelope.success) {
    return NextResponse.json(
      { success: false, message: "invalid.response" },
      { status: 502, headers: { [REQUEST_ID_HEADER]: requestId } },
    );
  }

  if (!envelope.data.success) {
    log.warn("reset.rejected", {
      path,
      method: "POST",
      status: upstream.status,
      requestId,
      code: envelope.data.message,
    });
    return NextResponse.json(
      { success: false, message: envelope.data.message ?? "reset.failed" },
      {
        status: upstream.status >= 400 ? upstream.status : 400,
        headers: { [REQUEST_ID_HEADER]: requestId },
      },
    );
  }

  log.info("reset.success", { path, method: "POST", requestId });
  return NextResponse.json(
    { success: true, data: { sent: true } },
    { headers: { [REQUEST_ID_HEADER]: requestId } },
  );
}
