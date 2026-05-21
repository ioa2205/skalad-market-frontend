import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const env = process.env as Record<string, string | undefined>;

describe("log", () => {
  const originalEnv = env.NODE_ENV;
  let writeSpy: ReturnType<typeof vi.fn>;
  let logSpy: ReturnType<typeof vi.fn>;
  let warnSpy: ReturnType<typeof vi.fn>;
  let errorSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    writeSpy = vi
      .spyOn(process.stdout, "write")
      .mockImplementation(() => true) as unknown as ReturnType<typeof vi.fn>;
    logSpy = vi
      .spyOn(console, "log")
      .mockImplementation(() => undefined) as unknown as ReturnType<typeof vi.fn>;
    warnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined) as unknown as ReturnType<typeof vi.fn>;
    errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined) as unknown as ReturnType<typeof vi.fn>;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    env.NODE_ENV = originalEnv;
    vi.resetModules();
  });

  it("emits one JSON line to stdout in production", async () => {
    env.NODE_ENV = "production";
    vi.resetModules();
    const { log } = await import("./log");

    log.info("hello", { requestId: "abc", path: "/x" });

    expect(writeSpy).toHaveBeenCalledTimes(1);
    const first = writeSpy.mock.calls[0];
    if (!first) throw new Error("expected call");
    const [line] = first as [string];
    expect(line.endsWith("\n")).toBe(true);
    const parsed = JSON.parse(line.trim()) as Record<string, unknown>;
    expect(parsed).toMatchObject({
      level: "info",
      msg: "hello",
      requestId: "abc",
      path: "/x",
    });
    expect(typeof parsed.time).toBe("string");
    expect(logSpy).not.toHaveBeenCalled();
  });

  it("uses pretty console in development", async () => {
    env.NODE_ENV = "development";
    vi.resetModules();
    const { log } = await import("./log");

    log.info("hi");
    log.warn("careful");
    log.error("boom");

    expect(logSpy).toHaveBeenCalledWith("[info]", "hi", "");
    expect(warnSpy).toHaveBeenCalledWith("[warn]", "careful", "");
    expect(errorSpy).toHaveBeenCalledWith("[error]", "boom", "");
    expect(writeSpy).not.toHaveBeenCalled();
  });

  it("routes through a custom sink set via setLogSink and restores on null", async () => {
    env.NODE_ENV = "production";
    vi.resetModules();
    const { log, setLogSink } = await import("./log");

    const captured: unknown[] = [];
    setLogSink((payload) => {
      captured.push(payload);
    });

    log.info("hello", { code: "X" });
    expect(captured).toHaveLength(1);
    expect(captured[0]).toMatchObject({ level: "info", msg: "hello", code: "X" });
    expect(writeSpy).not.toHaveBeenCalled();

    setLogSink(null);
    log.info("back-to-stdout");
    expect(writeSpy).toHaveBeenCalledTimes(1);
  });
});
