import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { apiResponseSchema } from "@/lib/api/response";
import { COOKIE_NAMES } from "@/lib/auth/cookies";
import { REQUEST_ID_HEADER, resolveRequestId } from "@/lib/http/requestId";
import { toAcceptLanguage } from "@/lib/i18n/config";
import { log } from "@/lib/log";

function gatewayUrl(): string {
  const raw = process.env.GATEWAY_URL;
  if (!raw) throw new Error("GATEWAY_URL env var is not set.");
  return raw.replace(/\/$/, "");
}

interface VerifyContext {
  params: Promise<{ token: string }>;
}

export async function GET(
  request: NextRequest,
  context: VerifyContext,
): Promise<NextResponse> {
  const requestId = resolveRequestId(request.headers);
  const { token } = await context.params;
  const path = `/api/v1/auth/verification/${encodeURIComponent(token)}`;

  if (!token || token.length < 8) {
    return NextResponse.json(
      { success: false, message: "verification.wrong" },
      { status: 400, headers: { [REQUEST_ID_HEADER]: requestId } },
    );
  }

  const localeCookie = request.cookies.get(COOKIE_NAMES.locale)?.value;
  const acceptLanguage = toAcceptLanguage(localeCookie);

  let upstream: Response;
  try {
    upstream = await fetch(`${gatewayUrl()}${path}`, {
      method: "GET",
      headers: {
        accept: "application/json",
        "accept-language": acceptLanguage,
        [REQUEST_ID_HEADER]: requestId,
      },
    });
  } catch (error) {
    log.error("verify.fetch.failed", {
      path,
      method: "GET",
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
    log.error("verify.schema.invalid", {
      path,
      method: "GET",
      status: upstream.status,
      requestId,
      code: "schema.mismatch",
    });
    return NextResponse.json(
      { success: false, message: "invalid.response" },
      { status: 502, headers: { [REQUEST_ID_HEADER]: requestId } },
    );
  }

  if (!envelope.data.success) {
    log.warn("verify.rejected", {
      path,
      method: "GET",
      status: upstream.status,
      requestId,
      code: envelope.data.message,
    });
    return NextResponse.json(
      { success: false, message: envelope.data.message ?? "verification.wrong" },
      {
        status: upstream.status >= 400 ? upstream.status : 400,
        headers: { [REQUEST_ID_HEADER]: requestId },
      },
    );
  }

  log.info("verify.success", {
    path,
    method: "GET",
    status: upstream.status,
    requestId,
  });

  return NextResponse.json(
    { success: true, data: { verified: true } },
    { headers: { [REQUEST_ID_HEADER]: requestId } },
  );
}
