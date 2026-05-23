export const GATEWAY_FETCH_TIMEOUT_MS = 8_000;

export function gatewayUrl(): string {
  const raw = process.env.GATEWAY_URL;
  if (!raw) throw new Error("GATEWAY_URL env var is not set.");
  return raw.replace(/\/$/, "");
}

export function gatewayPath(path: string): string {
  return `${gatewayUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function gatewayFetch(
  path: string,
  init: RequestInit & { timeoutMs?: number } = {},
): Promise<Response> {
  const { timeoutMs = GATEWAY_FETCH_TIMEOUT_MS, signal, ...rest } = init;
  const composedSignal = signal ?? AbortSignal.timeout(timeoutMs);
  return fetch(gatewayPath(path), { ...rest, signal: composedSignal });
}
