import { http, HttpResponse } from "msw";

const PROXY = "http://localhost:3000/api/proxy/api/v1";

interface UserState {
  firstName: string;
  lastName: string;
  position: string;
  telegram: string;
  extraPhone: string;
}

interface UserHandlerState {
  user: UserState;
  photoId: string | null;
  /** When set, the next user-mutating endpoint returns 500 and clears itself. */
  failNext: false | "profile" | "photo";
}

const initial: UserHandlerState = {
  user: {
    firstName: "Иван",
    lastName: "Петров",
    position: "Закупки",
    telegram: "@ivanp",
    extraPhone: "+998 99 123 45 67",
  },
  photoId: null,
  failNext: false,
};

let state: UserHandlerState = structuredClone(initial);

export function resetUserHandlers(): void {
  state = structuredClone(initial);
}

export function setUserHandlerState(patch: Partial<UserHandlerState>): void {
  state = { ...state, ...patch };
}

/**
 * Sentinel route used by tests:
 *   GET /__test__/users/fail-next?target=profile|photo  → arms a single 500
 */
export const userHandlers = [
  http.get(`${PROXY}/users`, () => {
    return HttpResponse.json(
      { success: true, data: state.user },
      { headers: { "x-request-id": "req-test-users-get" } },
    );
  }),

  http.put(`${PROXY}/users`, async ({ request }) => {
    const body = (await request.json()) as Partial<UserState>;
    if (state.failNext === "profile") {
      state.failNext = false;
      return HttpResponse.json(
        { success: false, message: "account.profile.save.failed" },
        { status: 500, headers: { "x-request-id": "req-test-users-put-fail" } },
      );
    }
    state.user = {
      firstName: body.firstName ?? state.user.firstName,
      lastName: body.lastName ?? state.user.lastName,
      position: body.position ?? state.user.position,
      telegram: body.telegram ?? state.user.telegram,
      extraPhone: body.extraPhone ?? state.user.extraPhone,
    };
    return HttpResponse.json(
      { success: true, data: state.user },
      { headers: { "x-request-id": "req-test-users-put" } },
    );
  }),

  http.get(`${PROXY}/users/photo`, () => {
    if (!state.photoId) {
      return HttpResponse.json(
        { success: false, message: "photo.not.found" },
        { status: 404, headers: { "x-request-id": "req-test-users-photo-404" } },
      );
    }
    return HttpResponse.json(
      { success: true, data: { photoId: state.photoId } },
      { headers: { "x-request-id": "req-test-users-photo" } },
    );
  }),

  http.put(`${PROXY}/users/update/photo`, async ({ request }) => {
    const body = (await request.json()) as { photoId?: string };
    if (state.failNext === "photo") {
      state.failNext = false;
      return HttpResponse.json(
        { success: false, message: "account.photo.update.failed" },
        { status: 500, headers: { "x-request-id": "req-test-users-photo-put-fail" } },
      );
    }
    state.photoId = body.photoId ?? null;
    return HttpResponse.json(
      { success: true, data: state.photoId },
      { headers: { "x-request-id": "req-test-users-photo-put" } },
    );
  }),

  http.post(`${PROXY}/attach/upload`, async ({ request }) => {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return HttpResponse.json(
        { success: false, message: "attach.upload.missing_file" },
        { status: 400, headers: { "x-request-id": "req-test-attach-bad" } },
      );
    }
    const id = `att_${Date.now().toString(36)}`;
    return HttpResponse.json(
      { success: true, data: { id, url: `http://minio.test/${id}` } },
      { headers: { "x-request-id": "req-test-attach-upload" } },
    );
  }),
];
