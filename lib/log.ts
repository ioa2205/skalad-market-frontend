/* eslint-disable no-console */

type LogLevel = "info" | "warn" | "error";

type LogContext = Record<string, unknown>;

interface LogPayload extends LogContext {
  level: LogLevel;
  msg: string;
  time: string;
}

/**
 * One-shot sink contract. Phase 10 intentionally keeps the default sink as
 * structured stdout — install a real provider (Sentry, Logtail, Axiom) by
 * registering it via `setLogSink` from a server-only bootstrap, or by
 * extending the resolver below to read `LOG_SINK`.
 */
export type LogSink = (payload: LogPayload) => void;

function isProd(): boolean {
  return process.env.NODE_ENV === "production";
}

function stdoutSink(payload: LogPayload): void {
  const line = JSON.stringify(payload);
  if (typeof process !== "undefined" && typeof process.stdout?.write === "function") {
    process.stdout.write(line + "\n");
  } else {
    console.log(line);
  }
}

function devConsoleSink(payload: LogPayload): void {
  const { level, msg, time: _time, ...context } = payload;
  const prefix = `[${level}]`;
  const extra = Object.keys(context).length > 0 ? context : "";
  if (level === "error") console.error(prefix, msg, extra);
  else if (level === "warn") console.warn(prefix, msg, extra);
  else console.log(prefix, msg, extra);
}

let activeSink: LogSink | null = null;

function resolveSink(): LogSink {
  if (activeSink) return activeSink;
  // Future: switch on `process.env.LOG_SINK` here when wiring Sentry/Logtail/
  // Axiom. The contract is intentionally narrow so an adapter can wrap any
  // upstream SDK without rewriting call sites.
  return isProd() ? stdoutSink : devConsoleSink;
}

/**
 * Override the active log sink. Call once from a server-only bootstrap (e.g.
 * `instrumentation.ts`) to plug in Sentry/Logtail/Axiom. Pass `null` to
 * restore the default. No-op outside server runtimes — client code never
 * imports a real sink, so the default `console`/`stdout` path is enough.
 */
export function setLogSink(sink: LogSink | null): void {
  activeSink = sink;
}

function emit(level: LogLevel, msg: string, context?: LogContext): void {
  const payload: LogPayload = {
    level,
    msg,
    time: new Date().toISOString(),
    ...context,
  };
  resolveSink()(payload);
}

export const log = {
  info: (msg: string, context?: LogContext) => emit("info", msg, context),
  warn: (msg: string, context?: LogContext) => emit("warn", msg, context),
  error: (msg: string, context?: LogContext) => emit("error", msg, context),
};

export type { LogContext, LogLevel, LogPayload };
