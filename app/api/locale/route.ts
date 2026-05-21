import { NextResponse, type NextRequest } from "next/server";

import { setLocaleCookie } from "@/lib/auth/cookies";
import { REQUEST_ID_HEADER, resolveRequestId } from "@/lib/http/requestId";
import { isLocale } from "@/lib/i18n/config";
import { log } from "@/lib/log";

interface LocaleBody {
  locale?: unknown;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const requestId = resolveRequestId(request.headers);

  let body: LocaleBody;
  try {
    body = (await request.json()) as LocaleBody;
  } catch {
    log.warn("locale.update.invalid_body", { requestId, code: "invalid.body" });
    return NextResponse.json(
      { success: false, message: "invalid.body" },
      { status: 400, headers: { [REQUEST_ID_HEADER]: requestId } },
    );
  }

  const locale = typeof body.locale === "string" ? body.locale : undefined;
  if (!isLocale(locale)) {
    log.warn("locale.update.invalid_locale", {
      requestId,
      code: "invalid.locale",
      provided: typeof body.locale,
    });
    return NextResponse.json(
      { success: false, message: "invalid.locale" },
      { status: 400, headers: { [REQUEST_ID_HEADER]: requestId } },
    );
  }

  const response = NextResponse.json(
    { success: true, data: { locale } },
    { status: 200, headers: { [REQUEST_ID_HEADER]: requestId } },
  );
  setLocaleCookie(response.cookies, locale);
  return response;
}
