import { cookies } from "next/headers";

import { readAccessToken, readLocaleCookie } from "../auth/cookies";
import { REQUEST_ID_HEADER, mintRequestId } from "../http/requestId";
import { toAcceptLanguage } from "../i18n/config";

import { ApiError } from "./errors";
import { gatewayPath } from "./gateway";
import { apiResponseSchema, type ApiDataSchema } from "./response";

export interface ServerFetchOptions<T> {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  schema: ApiDataSchema<T>;
  signal?: AbortSignal;
  timeoutMs?: number;
  headers?: Record<string, string>;
  cache?: RequestCache;
  next?: NextFetchRequestConfig;
}

// SSR pages block on this fetch — shorter timeout = faster failure when
// backend is down, so users don't sit on a blank page for 8s.
const DEFAULT_SERVER_FETCH_TIMEOUT_MS = 4_000;

export async function serverFetch<T>(
  path: string,
  options: ServerFetchOptions<T>,
): Promise<T> {
  const {
    method = "GET",
    body,
    schema,
    signal,
    timeoutMs = DEFAULT_SERVER_FETCH_TIMEOUT_MS,
    headers,
    cache,
    next,
  } = options;
  const store = await cookies();
  const accessToken = readAccessToken(store);
  const locale = readLocaleCookie(store);
  const requestId = mintRequestId();

  const outgoingHeaders: Record<string, string> = {
    accept: "application/json",
    "accept-language": toAcceptLanguage(locale),
    [REQUEST_ID_HEADER]: requestId,
    ...(body !== undefined ? { "content-type": "application/json" } : {}),
    ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
    ...headers,
  };

  const init: RequestInit & { next?: NextFetchRequestConfig } = {
    method,
    headers: outgoingHeaders,
    signal: (signal ?? AbortSignal.timeout(timeoutMs)) as RequestInit["signal"],
  };
  if (body !== undefined) init.body = JSON.stringify(body);
  if (cache) init.cache = cache;
  if (next) init.next = next;

  const response = await fetch(gatewayPath(path), init);
  const correlationId = response.headers.get(REQUEST_ID_HEADER) ?? requestId;

  let json: unknown;
  try {
    json = await response.json();
  } catch {
    throw new ApiError({
      code: "invalid.response",
      message: "Upstream returned a non-JSON response.",
      status: response.status,
      correlationId,
    });
  }

  const envelope = apiResponseSchema(schema).parse(json);
  if (!envelope.success) {
    throw new ApiError({
      code: envelope.message ?? "unknown.error",
      message: envelope.message ?? "Unknown error",
      status: response.status,
      correlationId,
    });
  }

  if (envelope.data === undefined) {
    throw new ApiError({
      code: "invalid.response",
      message: "Success envelope missing `data` field.",
      status: response.status,
      correlationId,
    });
  }

  return envelope.data;
}
