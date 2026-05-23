const REQUIRED_SERVER_ENV = ["GATEWAY_URL"] as const;
const REQUIRED_PUBLIC_ENV = [
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_WS_URL",
  "NEXT_PUBLIC_MINIO_BASE_URL",
] as const;

export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const missing = [...REQUIRED_SERVER_ENV, ...REQUIRED_PUBLIC_ENV].filter(
    (key) => !process.env[key],
  );

  if (missing.length > 0) {
    const message = `[env] Missing required env vars: ${missing.join(", ")}. Copy .env.example to .env.local and restart.`;
    // Log loudly. Throwing here would crash the dev server on every reload,
    // so we only fatally fail in production.
    if (process.env.NODE_ENV === "production") throw new Error(message);
    // eslint-disable-next-line no-console
    console.error(`\n\x1b[31m${message}\x1b[0m\n`);
  }

  const gateway = process.env.GATEWAY_URL;
  if (gateway && /\/\/localhost(:|\/|$)/.test(gateway)) {
    // eslint-disable-next-line no-console
    console.warn(
      "\x1b[33m[env] GATEWAY_URL uses 'localhost'. On Windows + Node 18+ this can resolve to IPv6 ::1 while the backend binds 0.0.0.0 (IPv4-only), causing 502 errors. Use http://127.0.0.1:8080 instead.\x1b[0m",
    );
  }
}
