import type { ZodSchema } from "zod";

import { REQUEST_ID_HEADER } from "../http/requestId";

import { ApiError } from "./errors";
import { apiResponseSchema } from "./response";

export interface ApiFetchOptions<T> {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  schema: ZodSchema<T>;
  signal?: AbortSignal;
  headers?: Record<string, string>;
  baseUrl?: string;
}

function joinPath(baseUrl: string, path: string): string {
  if (!path.startsWith("/")) return `${baseUrl}/${path}`;
  return `${baseUrl}${path}`;
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions<T>): Promise<T> {
  const { method = "GET", body, schema, signal, headers, baseUrl = "/api/proxy" } = options;

  const init: RequestInit = {
    method,
    headers: {
      accept: "application/json",
      ...(body !== undefined ? { "content-type": "application/json" } : {}),
      ...headers,
    },
    credentials: "include",
    signal: signal as RequestInit["signal"],
  };
  if (body !== undefined) init.body = JSON.stringify(body);

  const response = await fetch(joinPath(baseUrl, path), init);
  const correlationId = response.headers.get(REQUEST_ID_HEADER) ?? undefined;

  let json: unknown;
  try {
    json = await response.json();
  } catch {
    throw new ApiError({
      code: "invalid.response",
      message: "Server returned a non-JSON response.",
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
