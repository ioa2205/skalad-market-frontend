import { NextResponse, type NextRequest } from "next/server";

import { COOKIE_NAMES, setSessionIdCookie } from "./lib/auth/cookies";
import { decodeAccessToken, extractRoles, hasRole } from "./lib/auth/jwt";
import type { Roles } from "./lib/api/schemas/enums";

const MODERATOR_ROLES: Roles[] = ["ADMIN", "SUPER_ADMIN", "MODERATOR"];

function hasAnyRole(payload: ReturnType<typeof decodeAccessToken>, roles: Roles[]): boolean {
  const current = new Set(extractRoles(payload));
  return roles.some((role) => current.has(role));
}

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/reset",
  "/reset/confirm",
  "/catalog",
  "/companies",
  "/favicon.ico",
];

const PUBLIC_PREFIXES = [
  "/product/",
  "/company/",
  "/companies/",
  "/verify/",
  "/catalog/",
  "/_next/",
];

const AUTH_ONLY_PATHS = ["/login", "/register", "/reset", "/reset/confirm"];

const SELLER_ONBOARDING_PATH = "/seller/onboarding";

function isPublic(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isAuthOnlyPath(pathname: string): boolean {
  return AUTH_ONLY_PATHS.includes(pathname);
}

function ensureSessionId(
  request: NextRequest,
  response: NextResponse,
): void {
  if (!request.nextUrl.pathname.startsWith("/product/")) return;
  if (request.cookies.get(COOKIE_NAMES.sessionId)?.value) return;
  setSessionIdCookie(response.cookies, crypto.randomUUID());
}

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get(COOKIE_NAMES.accessToken)?.value;

  // Logged-in users should not see the login/register/reset pages.
  if (accessToken && isAuthOnlyPath(pathname)) {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = "/";
    homeUrl.search = "";
    return NextResponse.redirect(homeUrl);
  }

  if (isPublic(pathname)) {
    const response = NextResponse.next();
    ensureSessionId(request, response);
    return response;
  }

  if (!accessToken) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(loginUrl);
  }

  const needsSellerCheck =
    pathname.startsWith("/seller") && pathname !== SELLER_ONBOARDING_PATH;
  const needsModeratorCheck = pathname.startsWith("/moderator");

  if (needsSellerCheck || needsModeratorCheck) {
    const payload = decodeAccessToken(accessToken);
    if (needsSellerCheck && !hasRole(payload, "SELLER")) {
      const homeUrl = request.nextUrl.clone();
      homeUrl.pathname = "/";
      homeUrl.search = "";
      return NextResponse.redirect(homeUrl);
    }
    if (needsModeratorCheck && !hasAnyRole(payload, MODERATOR_ROLES)) {
      const homeUrl = request.nextUrl.clone();
      homeUrl.pathname = "/";
      homeUrl.search = "";
      return NextResponse.redirect(homeUrl);
    }
  }

  const response = NextResponse.next();
  ensureSessionId(request, response);
  return response;
}

export const config = {
  matcher: [
    // Run middleware on everything except API routes, static assets, and Next internals.
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
