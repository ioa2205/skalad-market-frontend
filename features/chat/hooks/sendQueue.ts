/**
 * Pure reducer for the WS send queue. The backend rate-limits client messages
 * at 20 / 30 s; we throttle locally so the composer stays usable instead of
 * surfacing a `rate_limited` error per keystroke.
 *
 * Times are passed in explicitly so tests can drive the clock without faking
 * `Date.now`.
 */

export const RATE_LIMIT = 20;
export const RATE_WINDOW_MS = 30_000;

export interface QueuedMessage {
  /** Locally generated id used to reconcile optimistic bubbles. */
  id: string;
  threadId: number;
  body?: string;
  attachmentKey?: string;
  enqueuedAt: number;
  retries: number;
}

export interface SendQueueState {
  pending: QueuedMessage[];
  inflight: QueuedMessage | null;
  /** Timestamps of recent successful sends, pruned to the 30 s window. */
  sendTimestamps: number[];
}

export const initialSendQueue: SendQueueState = {
  pending: [],
  inflight: null,
  sendTimestamps: [],
};

export function pruneWindow(timestamps: readonly number[], now: number): number[] {
  return timestamps.filter((t) => now - t < RATE_WINDOW_MS);
}

export function canSendNow(state: SendQueueState, now: number): boolean {
  return (
    state.inflight === null &&
    pruneWindow(state.sendTimestamps, now).length < RATE_LIMIT
  );
}

/** When the next slot opens (or `now` if free immediately). */
export function nextSlotAt(state: SendQueueState, now: number): number {
  const recent = pruneWindow(state.sendTimestamps, now);
  if (recent.length < RATE_LIMIT) return now;
  return (recent[0] ?? now) + RATE_WINDOW_MS;
}

export interface EnqueueInput {
  id: string;
  threadId: number;
  body?: string;
  attachmentKey?: string;
  enqueuedAt: number;
}

export function enqueue(state: SendQueueState, input: EnqueueInput): SendQueueState {
  const message: QueuedMessage = { ...input, retries: 0 };
  return { ...state, pending: [...state.pending, message] };
}

export interface DequeueResult {
  state: SendQueueState;
  message: QueuedMessage | null;
}

/**
 * Pop the head of the queue if rate-limit allows. The popped message moves to
 * `inflight` and `now` is appended to `sendTimestamps`.
 */
export function dequeueIfReady(state: SendQueueState, now: number): DequeueResult {
  if (!canSendNow(state, now)) return { state, message: null };
  const [next, ...rest] = state.pending;
  if (!next) return { state, message: null };
  return {
    state: {
      ...state,
      pending: rest,
      inflight: next,
      sendTimestamps: pruneWindow([...state.sendTimestamps, now], now),
    },
    message: next,
  };
}

export function ackInflight(state: SendQueueState, id: string): SendQueueState {
  if (state.inflight?.id !== id) return state;
  return { ...state, inflight: null };
}

/** Re-queue the inflight message at the head with retries++. */
export function failInflight(state: SendQueueState, id: string): SendQueueState {
  if (state.inflight?.id !== id) return state;
  const requeued: QueuedMessage = {
    ...state.inflight,
    retries: state.inflight.retries + 1,
  };
  return {
    ...state,
    pending: [requeued, ...state.pending],
    inflight: null,
  };
}

/** Drop an inflight or pending message by id without re-queueing. */
export function dropMessage(state: SendQueueState, id: string): SendQueueState {
  return {
    ...state,
    inflight: state.inflight?.id === id ? null : state.inflight,
    pending: state.pending.filter((m) => m.id !== id),
  };
}
