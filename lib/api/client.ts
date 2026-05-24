import { REQUEST_ID_HEADER } from "../http/requestId";

import { ApiError } from "./errors";
import { apiResponseSchema, type ApiDataSchema } from "./response";

export interface ApiFetchOptions<T> {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  schema: ApiDataSchema<T>;
  signal?: AbortSignal;
  headers?: Record<string, string>;
  baseUrl?: string;
}

function joinPath(baseUrl: string, path: string): string {
  if (!path.startsWith("/")) return `${baseUrl}/${path}`;
  return `${baseUrl}${path}`;
}

function fallbackErrorCode(status: number, body: unknown): string {
  if (typeof body === "object" && body !== null) {
    const record = body as Record<string, unknown>;
    const message = record.message ?? record.detail ?? record.title;
    if (typeof message === "string" && message.trim()) return message;
  }
  if (typeof body === "string" && body.trim()) return body.trim();
  if (status === 401) return "session.expired";
  if (status === 403) return "forbidden";
  return "invalid.response";
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

  const raw = await response.text();
  let json: unknown;
  if (raw.trim()) {
    try {
      json = JSON.parse(raw);
    } catch {
      if (!response.ok) {
        const code = fallbackErrorCode(response.status, raw);
        throw new ApiError({
          code,
          message: code,
          status: response.status,
          correlationId,
        });
      }
      throw new ApiError({
        code: "invalid.response",
        message: "Server returned a non-JSON response.",
        status: response.status,
        correlationId,
      });
    }
  } else {
    if (!response.ok) {
      const code = fallbackErrorCode(response.status, undefined);
      throw new ApiError({
        code,
        message: code,
        status: response.status,
        correlationId,
      });
    }
    throw new ApiError({
      code: "invalid.response",
      message: "Server returned an empty response.",
      status: response.status,
      correlationId,
    });
  }

  const parsed = apiResponseSchema(schema).safeParse(json);
  if (!parsed.success) {
    if (!response.ok) {
      const code = fallbackErrorCode(response.status, json);
      throw new ApiError({
        code,
        message: code,
        status: response.status,
        correlationId,
      });
    }
    throw new ApiError({
      code: "invalid.response",
      message: "Server response did not match the expected schema.",
      status: response.status,
      correlationId,
    });
  }

  const envelope = parsed.data;
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
