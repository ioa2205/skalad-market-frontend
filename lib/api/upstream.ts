import { apiResponseSchema, type ApiDataSchema, type ApiEnvelope } from "./response";

export type UpstreamEnvelopeResult<T> =
  | { ok: true; envelope: ApiEnvelope<T> }
  | { ok: false; message: string; schemaMismatch: boolean };

function extractMessage(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value !== "object" || value === null) return undefined;
  const record = value as Record<string, unknown>;
  const message = record.message ?? record.detail ?? record.title;
  return typeof message === "string" && message.trim() ? message : undefined;
}

export async function readUpstreamEnvelope<T>(
  response: Response,
  schema: ApiDataSchema<T>,
): Promise<UpstreamEnvelopeResult<T>> {
  const raw = await response.text();
  let json: unknown;

  if (raw.trim()) {
    try {
      json = JSON.parse(raw);
    } catch {
      return {
        ok: false,
        message: raw.trim(),
        schemaMismatch: response.ok,
      };
    }
  } else {
    return {
      ok: false,
      message: response.status === 401 ? "session.expired" : "invalid.response",
      schemaMismatch: response.ok,
    };
  }

  const envelope = apiResponseSchema(schema).safeParse(json);
  if (!envelope.success) {
    return {
      ok: false,
      message: extractMessage(json) ?? "invalid.response",
      schemaMismatch: response.ok,
    };
  }

  return { ok: true, envelope: envelope.data };
}
