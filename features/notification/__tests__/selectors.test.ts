import { describe, expect, it } from "vitest";

import type { NotificationResponse } from "@/lib/api/schemas/notification";

import { applyMarkRead, unreadCount } from "../selectors";

const NOW = "2026-04-27T12:00:00";

function notif(
  id: number,
  read?: string | undefined,
): NotificationResponse {
  return {
    id,
    type: "lead.new",
    payload: {},
    sent_at: "2026-04-27T10:00:00",
    ...(read ? { read_at: read } : {}),
  };
}

describe("applyMarkRead", () => {
  it("stamps every unread item with `now` when markAll=true", () => {
    const before = [notif(1), notif(2, "2026-04-26T00:00:00"), notif(3)];
    const after = applyMarkRead(before, { markAll: true, now: NOW });

    expect(after[0]?.read_at).toBe(NOW);
    expect(after[1]?.read_at).toBe("2026-04-26T00:00:00"); // already read; not touched
    expect(after[2]?.read_at).toBe(NOW);
  });

  it("only stamps ids passed in `ids`", () => {
    const before = [notif(1), notif(2), notif(3)];
    const after = applyMarkRead(before, { ids: [2], now: NOW });

    expect(after[0]?.read_at).toBeUndefined();
    expect(after[1]?.read_at).toBe(NOW);
    expect(after[2]?.read_at).toBeUndefined();
  });

  it("returns the same shape when ids is empty and markAll false", () => {
    const before = [notif(1), notif(2)];
    expect(applyMarkRead(before, { ids: [], now: NOW })).toEqual(before);
  });

  it("does not mutate the input", () => {
    const before = [notif(1)];
    applyMarkRead(before, { markAll: true, now: NOW });
    expect(before[0]?.read_at).toBeUndefined();
  });
});

describe("unreadCount", () => {
  it("counts items with no read_at", () => {
    expect(unreadCount([notif(1), notif(2, NOW), notif(3)])).toBe(2);
  });

  it("returns 0 for an empty list", () => {
    expect(unreadCount([])).toBe(0);
  });
});
