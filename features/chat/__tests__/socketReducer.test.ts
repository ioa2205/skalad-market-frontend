import { describe, expect, it } from "vitest";

import type { ChatMessageResponse, WsServerEvent } from "@/lib/api/schemas/chat";

import {
  TYPING_TTL_MS,
  addOptimistic,
  applyServerEvent,
  initialThreadState,
  isAnyoneTyping,
  markOptimisticFailed,
  pruneTyping,
  reconnectDelayMs,
  upsertMessages,
} from "../hooks/socketReducer";

const T0 = 1_700_000_000_000;

function msg(
  id: number,
  overrides: Partial<ChatMessageResponse> = {},
): ChatMessageResponse {
  return {
    id,
    thread_id: 1,
    sender_id: 7, // other party by default
    sender_type: "SELLER",
    body: `m${id}`,
    sent_at: "2026-04-27T10:00:00",
    status: "DELIVERED",
    ...overrides,
  };
}

describe("upsertMessages", () => {
  it("dedupes by id and keeps ascending order", () => {
    const start = upsertMessages(initialThreadState(1), [msg(2), msg(1)]);
    expect(start.messages.map((m) => m.id)).toEqual([1, 2]);

    const after = upsertMessages(start, [msg(2, { status: "READ" }), msg(3)]);
    expect(after.messages.map((m) => m.id)).toEqual([1, 2, 3]);
    expect(after.messages.find((m) => m.id === 2)?.status).toBe("READ");
  });

  it("ignores empty input", () => {
    const start = initialThreadState(1);
    expect(upsertMessages(start, [])).toBe(start);
  });
});

describe("applyServerEvent — new_message", () => {
  it("appends a new message from the other party", () => {
    const next = applyServerEvent(
      initialThreadState(1),
      { event: "new_message", thread_id: 1, message: msg(10) },
      { currentUserId: 1, now: T0 },
    );
    expect(next.messages.map((m) => m.id)).toEqual([10]);
  });

  it("ignores events for a different thread", () => {
    const start = initialThreadState(1);
    const next = applyServerEvent(
      start,
      {
        event: "new_message",
        thread_id: 999,
        message: { ...msg(99), thread_id: 999 },
      },
      { currentUserId: 1, now: T0 },
    );
    expect(next).toBe(start);
  });

  it("reconciles an own optimistic bubble with matching body", () => {
    let state = initialThreadState(1);
    state = addOptimistic(state, {
      local_id: "local-1",
      thread_id: 1,
      body: "hi seller",
      status: "sending",
      sent_at: "2026-04-27T10:00:00",
    });

    const next = applyServerEvent(
      state,
      {
        event: "new_message",
        thread_id: 1,
        message: msg(50, { sender_id: 1, sender_type: "BUYER", body: "hi seller" }),
      },
      { currentUserId: 1, now: T0 },
    );
    expect(next.optimistic).toEqual([]);
    expect(next.messages.map((m) => m.id)).toEqual([50]);
  });

  it("does not reconcile when the new message is from someone else", () => {
    let state = initialThreadState(1);
    state = addOptimistic(state, {
      local_id: "local-1",
      thread_id: 1,
      body: "hi seller",
      status: "sending",
      sent_at: "2026-04-27T10:00:00",
    });
    const next = applyServerEvent(
      state,
      { event: "new_message", thread_id: 1, message: msg(60, { body: "hi seller" }) },
      { currentUserId: 1, now: T0 },
    );
    expect(next.optimistic).toHaveLength(1);
  });
});

describe("applyServerEvent — read_receipt", () => {
  it("bumps lastReadByOther to the highest acked id", () => {
    let state = initialThreadState(1);
    state = applyServerEvent(
      state,
      {
        event: "read_receipt",
        thread_id: 1,
        message_ids: [3, 5, 4],
        read_by: 7,
      },
      { currentUserId: 1, now: T0 },
    );
    expect(state.lastReadByOther).toBe(5);

    state = applyServerEvent(
      state,
      { event: "read_receipt", thread_id: 1, message_ids: [2], read_by: 7 },
      { currentUserId: 1, now: T0 },
    );
    // Stays at the higher value — read receipts are monotonic.
    expect(state.lastReadByOther).toBe(5);
  });

  it("ignores receipts emitted by the current user", () => {
    const start = initialThreadState(1);
    const next = applyServerEvent(
      start,
      { event: "read_receipt", thread_id: 1, message_ids: [9], read_by: 1 },
      { currentUserId: 1, now: T0 },
    );
    expect(next).toBe(start);
  });
});

describe("typing + pruneTyping", () => {
  it("records typing timestamps and reports active typing", () => {
    let state = applyServerEvent(
      initialThreadState(1),
      { event: "typing", thread_id: 1, user_id: 7 },
      { currentUserId: 1, now: T0 },
    );
    expect(isAnyoneTyping(state, T0)).toBe(true);

    state = pruneTyping(state, T0 + TYPING_TTL_MS + 1);
    expect(isAnyoneTyping(state, T0 + TYPING_TTL_MS + 1)).toBe(false);
  });

  it("ignores own typing events", () => {
    const start = initialThreadState(1);
    const next = applyServerEvent(
      start,
      { event: "typing", thread_id: 1, user_id: 1 },
      { currentUserId: 1, now: T0 },
    );
    expect(next).toBe(start);
  });
});

describe("error events", () => {
  it("captures the latest error payload", () => {
    const event: WsServerEvent = {
      event: "error",
      code: "rate_limited",
      message: "Slow down",
    };
    const next = applyServerEvent(initialThreadState(1), event, {
      currentUserId: 1,
      now: T0,
    });
    expect(next.lastError).toEqual({ code: "rate_limited", message: "Slow down" });
  });
});

describe("optimistic helpers", () => {
  it("marks an optimistic message as failed", () => {
    let state = initialThreadState(1);
    state = addOptimistic(state, {
      local_id: "local-2",
      thread_id: 1,
      body: "x",
      status: "sending",
      sent_at: "2026-04-27T10:00:00",
    });
    state = markOptimisticFailed(state, "local-2");
    expect(state.optimistic[0]?.status).toBe("failed");
  });
});

describe("reconnectDelayMs", () => {
  it("is bounded between 250 ms and 30 000 ms", () => {
    for (let attempt = 0; attempt < 12; attempt++) {
      const delay = reconnectDelayMs(attempt);
      expect(delay).toBeGreaterThanOrEqual(250);
      expect(delay).toBeLessThanOrEqual(30_000);
    }
  });
});
