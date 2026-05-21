export const REQUEST_ID_HEADER = "x-request-id";

export function mintRequestId(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  // Fallback — not expected on Node 20+ / modern edge runtimes.
  return `req-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function resolveRequestId(
  headers: Headers | { get(name: string): string | null } | Record<string, string | undefined>,
): string {
  let raw: string | null | undefined;
  if (typeof (headers as { get?: unknown }).get === "function") {
    raw = (headers as { get(name: string): string | null }).get(REQUEST_ID_HEADER);
  } else {
    const bag = headers as Record<string, string | undefined>;
    raw = bag[REQUEST_ID_HEADER] ?? bag[REQUEST_ID_HEADER.toUpperCase()];
  }
  return raw && raw.length > 0 ? raw : mintRequestId();
}
