import { http, HttpResponse } from "msw";

export const TEST_GATEWAY = "http://gateway.test";

export const authHandlers = [
  http.post(`${TEST_GATEWAY}/api/v1/auth/registration/login`, async ({ request }) => {
    const body = (await request.json()) as { username: string; password: string };
    if (body.password === "locked") {
      return HttpResponse.json(
        { success: false, message: "account.locked" },
        { status: 423 },
      );
    }
    if (body.password === "unknown") {
      return HttpResponse.json(
        { success: false, message: "username.not.found" },
        { status: 404 },
      );
    }
    if (body.password !== "correct") {
      return HttpResponse.json(
        { success: false, message: "wrong.password" },
        { status: 401 },
      );
    }
    return HttpResponse.json({
      success: true,
      data: {
        firstName: "A",
        lastName: "B",
        username: body.username,
        role: "BUYER",
        accessToken: "access-1",
        refreshToken: "refresh-1",
        expiresIn: 300,
      },
    });
  }),

  http.post(`${TEST_GATEWAY}/api/v1/auth/refresh`, async ({ request }) => {
    const body = (await request.json()) as { refreshToken: string };
    if (body.refreshToken === "invalid") {
      return HttpResponse.json(
        { success: false, message: "refresh.token.invalid.expired" },
        { status: 401 },
      );
    }
    return HttpResponse.json({
      success: true,
      data: {
        access_token: "access-2",
        refresh_token: "refresh-2",
        expires_in: 300,
      },
    });
  }),

  http.post(`${TEST_GATEWAY}/api/v1/auth/registration`, async ({ request }) => {
    const url = new URL(request.url);
    const roles = url.searchParams.get("roles");
    const body = (await request.json()) as { username: string };
    if (!roles) {
      // Mirror the backend's mapToRole NPE on null `roles` (build-plan §1).
      return HttpResponse.json(
        { success: false, message: "roles.required" },
        { status: 500 },
      );
    }
    if (body.username.includes("taken")) {
      return HttpResponse.json(
        { success: false, message: "username.already.taken" },
        { status: 409 },
      );
    }
    return HttpResponse.json({ success: true, data: "registration.email.sent" });
  }),

  http.post(`${TEST_GATEWAY}/api/v1/auth/registration/reset`, async ({ request }) => {
    const body = (await request.json()) as { username: string };
    if (body.username === "unknown@skladx.com") {
      return HttpResponse.json(
        { success: false, message: "username.not.found" },
        { status: 404 },
      );
    }
    return HttpResponse.json({ success: true, data: "reset.email.sent" });
  }),

  http.post(
    `${TEST_GATEWAY}/api/v1/auth/registration/reset-password/confirm`,
    async ({ request }) => {
      const body = (await request.json()) as { confirmCode: string };
      if (body.confirmCode !== "123456") {
        return HttpResponse.json(
          { success: false, message: "verification.wrong" },
          { status: 400 },
        );
      }
      return HttpResponse.json({ success: true, data: "password.updated" });
    },
  ),

  http.get(`${TEST_GATEWAY}/api/v1/auth/verification/:token`, ({ params }) => {
    if (params.token === "bad-token") {
      return HttpResponse.json(
        { success: false, message: "verification.wrong" },
        { status: 400 },
      );
    }
    return HttpResponse.json({ success: true, data: "verified" });
  }),

  // ---- Browser-facing /api/auth/* proxies (used by component tests) ---------
  // These mirror the route-handler responses *as they appear to the form*;
  // route-handler unit tests bypass MSW and exercise the handler directly.

  http.post("http://localhost:3000/api/auth/login", async ({ request }) => {
    const body = (await request.json()) as { username: string; password: string };
    if (body.password === "locked") {
      return HttpResponse.json(
        { success: false, message: "account.locked" },
        { status: 423, headers: { "x-request-id": "req-test-locked" } },
      );
    }
    if (body.password !== "correct") {
      return HttpResponse.json(
        { success: false, message: "wrong.password" },
        { status: 401, headers: { "x-request-id": "req-test-wrong" } },
      );
    }
    return HttpResponse.json(
      {
        success: true,
        data: {
          firstName: "A",
          lastName: "B",
          username: body.username,
          role: "BUYER",
          expiresIn: 300,
          redirectTo: "/",
        },
      },
      { headers: { "x-request-id": "req-test-ok" } },
    );
  }),

  http.post("http://localhost:3000/api/auth/register", async ({ request }) => {
    const body = (await request.json()) as {
      username: string;
      role: "BUYER" | "SELLER";
    };
    if (body.username.includes("taken")) {
      return HttpResponse.json(
        { success: false, message: "username.already.taken" },
        { status: 409, headers: { "x-request-id": "req-test-taken" } },
      );
    }
    return HttpResponse.json(
      { success: true, data: { username: body.username, role: body.role } },
      { headers: { "x-request-id": "req-test-ok" } },
    );
  }),

  http.get("http://localhost:3000/api/auth/verify/:token", ({ params }) => {
    if (params.token === "bad-token") {
      return HttpResponse.json(
        { success: false, message: "verification.wrong" },
        { status: 400, headers: { "x-request-id": "req-test-bad" } },
      );
    }
    return HttpResponse.json(
      { success: true, data: { verified: true } },
      { headers: { "x-request-id": "req-test-ok" } },
    );
  }),

  http.post("http://localhost:3000/api/auth/reset", async ({ request }) => {
    const body = (await request.json()) as { username: string };
    if (body.username === "unknown@skladx.com") {
      return HttpResponse.json(
        { success: false, message: "username.not.found" },
        { status: 404, headers: { "x-request-id": "req-test-unknown" } },
      );
    }
    return HttpResponse.json(
      { success: true, data: { sent: true } },
      { headers: { "x-request-id": "req-test-ok" } },
    );
  }),

  http.post("http://localhost:3000/api/auth/reset/confirm", async ({ request }) => {
    const body = (await request.json()) as { confirmCode: string };
    if (body.confirmCode !== "123456") {
      return HttpResponse.json(
        { success: false, message: "verification.wrong" },
        { status: 400, headers: { "x-request-id": "req-test-bad-code" } },
      );
    }
    return HttpResponse.json(
      { success: true, data: { updated: true } },
      { headers: { "x-request-id": "req-test-ok" } },
    );
  }),

  http.get("http://localhost:3000/api/auth/session", () => {
    return HttpResponse.json(
      { success: true, data: null },
      { headers: { "x-request-id": "req-test-session" } },
    );
  }),
];
