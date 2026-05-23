import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { gatewayFetch } from "@/lib/api/gateway";
import { apiResponseSchema } from "@/lib/api/response";
import { RegistrationDTO } from "@/lib/api/schemas/auth";
import {
  COOKIE_NAMES,
  setRegisterIntentCookie,
  type RegisterIntent,
} from "@/lib/auth/cookies";
import { REQUEST_ID_HEADER, resolveRequestId } from "@/lib/http/requestId";
import { toAcceptLanguage } from "@/lib/i18n/config";
import { log } from "@/lib/log";

/**
 * Browser-facing register proxy. The form posts a body that combines the
 * wire `RegistrationDTO` fields with a `role` discriminator and an optional
 * `companyName` / `phone` we want to persist locally for the seller-onboarding
 * wizard (Phase 8a). The role is forwarded as `?roles=` per the backend's
 * `mapToRole` switch, which NPEs on null despite the controller marking the
 * param optional (see build-plan §1, decision #1).
 */
const RegisterRequestSchema = RegistrationDTO.extend({
  role: z.enum(["BUYER", "SELLER"]),
  companyName: z.string().optional(),
  phone: z.string().optional(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  const requestId = resolveRequestId(request.headers);
  const path = "/api/v1/auth/registration";

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "invalid.request.body" },
      { status: 400, headers: { [REQUEST_ID_HEADER]: requestId } },
    );
  }

  const parsed = RegisterRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: "invalid.request.body" },
      { status: 400, headers: { [REQUEST_ID_HEADER]: requestId } },
    );
  }
  const { role, companyName, phone, ...wire } = parsed.data;

  const localeCookie = request.cookies.get(COOKIE_NAMES.locale)?.value;
  const acceptLanguage = toAcceptLanguage(localeCookie);

  let upstream: Response;
  try {
    upstream = await gatewayFetch(`${path}?roles=${role}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
        "accept-language": acceptLanguage,
        [REQUEST_ID_HEADER]: requestId,
      },
      body: JSON.stringify(wire),
    });
  } catch (error) {
    log.error("register.fetch.failed", {
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
    log.error("register.upstream.invalid", {
      path,
      method: "POST",
      status: upstream.status,
      requestId,
    });
    return NextResponse.json(
      { success: false, message: "invalid.response" },
      { status: 502, headers: { [REQUEST_ID_HEADER]: requestId } },
    );
  }

  const envelope = apiResponseSchema(z.string()).safeParse(json);
  if (!envelope.success) {
    log.error("register.schema.invalid", {
      path,
      method: "POST",
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
    log.warn("register.rejected", {
      path,
      method: "POST",
      status: upstream.status,
      requestId,
      code: envelope.data.message,
    });
    return NextResponse.json(
      { success: false, message: envelope.data.message ?? "registration.failed" },
      {
        status: upstream.status >= 400 ? upstream.status : 400,
        headers: { [REQUEST_ID_HEADER]: requestId },
      },
    );
  }

  const intent: RegisterIntent = { role };
  if (role === "SELLER" && companyName?.trim()) intent.companyName = companyName.trim();
  if (phone?.trim()) intent.phone = phone.trim();

  const response = NextResponse.json(
    { success: true, data: { username: wire.username, role } },
    { headers: { [REQUEST_ID_HEADER]: requestId } },
  );
  setRegisterIntentCookie(response.cookies, intent);

  log.info("register.success", {
    path,
    method: "POST",
    status: upstream.status,
    requestId,
    role,
  });

  return response;
}
