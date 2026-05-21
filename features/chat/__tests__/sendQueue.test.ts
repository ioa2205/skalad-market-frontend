import { describe, expect, it } from "vitest";

import {
  RATE_LIMIT,
  RATE_WINDOW_MS,
  ackInflight,
  canSendNow,
  dequeueIfReady,
  dropMessage,
  enqueue,
  failInflight,
  initialSendQueue,
  nextSlotAt,
  pruneWindow,
} from "../hooks/sendQueue";

const T0 = 1_700_000_000_000;

function build({ count = 0, gapMs = 100 }: { count?: number; gapMs?: number } = {}) {
  let state = initialSendQueue;
  for (let i = 0; i < count; i++) {
    state = enqueue(state, {
      id: `m-${i}`,
      threadId: 1,
      body: `hello ${i}`,
      enqueuedAt: T0 + i * gapMs,
    });
  }
  return state;
}

describe("pruneWindow", () => {
  it("drops timestamps older than the rate window", () => {
    const ts = [T0, T0 + 10_000, T0 + RATE_WINDOW_MS + 1];
    expect(pruneWindow(ts, T0 + RATE_WINDOW_MS + 100)).toEqual([
      T0 + 10_000,
      T0 + RATE_WINDOW_MS + 1,
    ]);
  });
});

describe("dequeueIfReady — rate limit", () => {
  it("releases the head when the queue is below the limit", () => {
    const state = build({ count: 1 });
    const { state: after, message } = dequeueIfReady(state, T0);
    expect(message?.id).toBe("m-0");
    expect(after.inflight?.id).toBe("m-0");
    expect(after.pending).toEqual([]);
    expect(after.sendTimestamps).toEqual([T0]);
  });

  it("blocks when an inflight message is still outstanding", () => {
    let state = build({ count: 2 });
    state = dequeueIfReady(state, T0).state;
    expect(canSendNow(state, T0 + 5)).toBe(false);
    expect(dequeueIfReady(state, T0 + 5).message).toBeNull();
  });

  it("blocks once the 30-s window already holds 20 sent timestamps", () => {
    let state = enqueue(initialSendQueue, {
      id: "next",
      threadId: 1,
      body: "x",
      enqueuedAt: T0,
    });
    state = {
      ...state,
      sendTimestamps: Array.from({ length: RATE_LIMIT }, (_, i) => T0 + i * 50),
    };
    expect(canSendNow(state, T0 + RATE_LIMIT * 50 + 5)).toBe(false);
    expect(nextSlotAt(state, T0 + RATE_LIMIT * 50 + 5)).toBe(T0 + RATE_WINDOW_MS);
    expect(dequeueIfReady(state, T0 + RATE_LIMIT * 50 + 5).message).toBeNull();
  });

  it("admits a new send once the oldest timestamp drops out of the window", () => {
    let state = enqueue(initialSendQueue, {
      id: "after-window",
      threadId: 1,
      body: "x",
      enqueuedAt: T0,
    });
    state = {
      ...state,
      sendTimestamps: Array.from({ length: RATE_LIMIT }, (_, i) => T0 + i * 50),
    };
    const wakeUp = T0 + RATE_WINDOW_MS + 1;
    expect(canSendNow(state, wakeUp)).toBe(true);
    const { message } = dequeueIfReady(state, wakeUp);
    expect(message?.id).toBe("after-window");
  });
});

describe("ackInflight / failInflight / dropMessage", () => {
  it("acks the inflight message — slot stays counted", () => {
    let state = build({ count: 1 });
    state = dequeueIfReady(state, T0).state;
    state = ackInflight(state, "m-0");
    expect(state.inflight).toBeNull();
    expect(state.sendTimestamps).toEqual([T0]);
  });

  it("re-queues a failed inflight at the head with retries++", () => {
    let state = build({ count: 2 });
    state = dequeueIfReady(state, T0).state; // m-0 inflight
    state = failInflight(state, "m-0");
    expect(state.inflight).toBeNull();
    expect(state.pending[0]?.id).toBe("m-0");
    expect(state.pending[0]?.retries).toBe(1);
    expect(state.pending[1]?.id).toBe("m-1");
  });

  it("drops a pending message without re-queueing", () => {
    let state = build({ count: 2 });
    state = dropMessage(state, "m-1");
    expect(state.pending.map((m) => m.id)).toEqual(["m-0"]);
  });

  it("drops the inflight message", () => {
    let state = build({ count: 2 });
    state = dequeueIfReady(state, T0).state;
    state = dropMessage(state, "m-0");
    expect(state.inflight).toBeNull();
    expect(state.pending.map((m) => m.id)).toEqual(["m-1"]);
  });

  it("ignores acks/fails that don't match the inflight id", () => {
    let state = build({ count: 1 });
    state = dequeueIfReady(state, T0).state;
    expect(ackInflight(state, "wrong")).toBe(state);
    expect(failInflight(state, "wrong")).toBe(state);
  });
});
