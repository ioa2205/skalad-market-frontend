import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { gatewayFetch } from "@/lib/api/gateway";
import { UpdatePasswordDTO } from "@/lib/api/schemas/auth";
import { readUpstreamEnvelope } from "@/lib/api/upstream";
import { COOKIE_NAMES } from "@/lib/auth/cookies";
import { REQUEST_ID_HEADER, resolveRequestId } from "@/lib/http/requestId";
import { toAcceptLanguage } from "@/lib/i18n/config";
import { log } from "@/lib/log";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const requestId = resolveRequestId(request.headers);
  const path = "/api/v1/auth/registration/reset-password/confirm";

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "invalid.request.body" },
      { status: 400, headers: { [REQUEST_ID_HEADER]: requestId } },
    );
  }

  const parsed = UpdatePasswordDTO.safeParse(body);
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
    log.error("reset.confirm.fetch.failed", {
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

  const result = await readUpstreamEnvelope(upstream, z.string());
  if (!result.ok) {
    return NextResponse.json(
      { success: false, message: result.message },
      {
        status: result.schemaMismatch ? 502 : upstream.status,
        headers: { [REQUEST_ID_HEADER]: requestId },
      },
    );
  }

  if (!result.envelope.success) {
    log.warn("reset.confirm.rejected", {
      path,
      method: "POST",
      status: upstream.status,
      requestId,
      code: result.envelope.message,
    });
    return NextResponse.json(
      { success: false, message: result.envelope.message ?? "reset.confirm.failed" },
      {
        status: upstream.status >= 400 ? upstream.status : 400,
        headers: { [REQUEST_ID_HEADER]: requestId },
      },
    );
  }

  log.info("reset.confirm.success", { path, method: "POST", requestId });
  return NextResponse.json(
    { success: true, data: { updated: true } },
    { headers: { [REQUEST_ID_HEADER]: requestId } },
  );
}
