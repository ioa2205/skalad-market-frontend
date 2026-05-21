import "server-only";

import { serverFetch } from "@/lib/api/server";
import {
  ChatMessageResponse,
  ChatThreadResponse,
  type ChatMessageResponse as ChatMessageResponseT,
  type ChatThreadResponse as ChatThreadResponseT,
} from "@/lib/api/schemas/chat";
import { pagedResponseSchema } from "@/lib/api/schemas/common";
import { log } from "@/lib/log";

const ThreadsPage = pagedResponseSchema(ChatThreadResponse);
const MessagesPage = pagedResponseSchema(ChatMessageResponse);

export interface ThreadsResult {
  items: ChatThreadResponseT[];
  meta: { total: number; page: number; perPage: number; totalPages: number };
  error?: { code: string; correlationId?: string | undefined };
}

export async function fetchThreadsServer(input: {
  page: number;
  perPage: number;
}): Promise<ThreadsResult> {
  const params = new URLSearchParams({
    page: String(input.page),
    per_page: String(input.perPage),
  });
  try {
    const data = await serverFetch(`/api/v1/chats?${params.toString()}`, {
      schema: ThreadsPage,
      cache: "no-store",
    });
    return { items: data.items, meta: data.meta };
  } catch (error) {
    const err = error as { code?: string; correlationId?: string };
    log.warn("chat.threads.fetch.failed", {
      code: err.code ?? "unknown.error",
      correlationId: err.correlationId,
    });
    return {
      items: [],
      meta: { total: 0, page: input.page, perPage: input.perPage, totalPages: 0 },
      error: {
        code: err.code ?? "unknown.error",
        correlationId: err.correlationId,
      },
    };
  }
}

export interface MessagesResult {
  items: ChatMessageResponseT[];
  meta: { total: number; page: number; perPage: number; totalPages: number };
  error?: { code: string; correlationId?: string | undefined };
}

export async function fetchMessagesServer(input: {
  threadId: number;
  page: number;
  perPage: number;
}): Promise<MessagesResult> {
  const params = new URLSearchParams({
    page: String(input.page),
    per_page: String(input.perPage),
  });
  try {
    const data = await serverFetch(
      `/api/v1/chats/${input.threadId}/messages?${params.toString()}`,
      { schema: MessagesPage, cache: "no-store" },
    );
    return { items: data.items, meta: data.meta };
  } catch (error) {
    const err = error as { code?: string; correlationId?: string };
    log.warn("chat.messages.fetch.failed", {
      threadId: input.threadId,
      code: err.code ?? "unknown.error",
      correlationId: err.correlationId,
    });
    return {
      items: [],
      meta: { total: 0, page: input.page, perPage: input.perPage, totalPages: 0 },
      error: {
        code: err.code ?? "unknown.error",
        correlationId: err.correlationId,
      },
    };
  }
}
