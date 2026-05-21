import type { NotificationResponse } from "@/lib/api/schemas/notification";

/**
 * Pure helper used by the optimistic mark-as-read flow. Stamping happens here
 * so the dropdown doesn't have to wait for the server roundtrip — TanStack
 * Query gets re-invalidated afterward and the canonical timestamps win.
 */
export function applyMarkRead(
  items: NotificationResponse[],
  input: { ids?: number[]; markAll?: boolean; now: string },
): NotificationResponse[] {
  if (input.markAll) {
    return items.map((n) => (n.read_at ? n : { ...n, read_at: input.now }));
  }
  if (!input.ids?.length) return items;
  const set = new Set(input.ids);
  return items.map((n) =>
    set.has(n.id) && !n.read_at ? { ...n, read_at: input.now } : n,
  );
}

export function unreadCount(items: NotificationResponse[]): number {
  return items.reduce((acc, n) => (n.read_at ? acc : acc + 1), 0);
}

interface InboxBucketKey {
  type: string;
}

export function bucketByType<T extends InboxBucketKey>(
  items: T[],
): Record<string, T[]> {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    (acc[item.type] ??= []).push(item);
    return acc;
  }, {});
}
