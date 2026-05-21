export const SERVER_ERROR_KEYS = [
  "account.locked",
  "wrong.password",
  "verification.wrong",
  "refresh.token.invalid.expired",
  "username.not.found",
  "username.already.taken",
  "session.expired",
  "network.error",
  "invalid.response",
  "invalid.request.body",
] as const;

export type ServerErrorKey = (typeof SERVER_ERROR_KEYS)[number];

export function isKnownServerErrorKey(code: string | undefined): code is ServerErrorKey {
  return !!code && (SERVER_ERROR_KEYS as readonly string[]).includes(code);
}

const COPY_KEYS: Record<ServerErrorKey, string> = {
  "account.locked": "auth.errors.accountLocked",
  "wrong.password": "auth.errors.wrongPassword",
  "verification.wrong": "auth.errors.verificationWrong",
  "refresh.token.invalid.expired": "auth.errors.refreshExpired",
  "username.not.found": "auth.errors.usernameNotFound",
  "username.already.taken": "auth.errors.usernameTaken",
  "session.expired": "auth.errors.sessionExpired",
  "network.error": "auth.errors.network",
  "invalid.response": "auth.errors.generic",
  "invalid.request.body": "auth.errors.generic",
};

export function toCopyKey(code: string | undefined): string {
  if (isKnownServerErrorKey(code)) return COPY_KEYS[code];
  return "auth.errors.generic";
}
