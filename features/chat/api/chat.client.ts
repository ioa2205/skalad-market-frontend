"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/errors";
import type {
  ChatCreateResponse,
  ChatMessageResponse,
  ChatThreadResponse,
  ChatUploadAttachmentResponse,
  WsTokenResponse,
} from "@/lib/api/schemas/chat";
import { REQUEST_ID_HEADER } from "@/lib/http/requestId";
import { log } from "@/lib/log";

import {
  chatKeys,
  type ChatMessagesParams,
  type ChatThreadsParams,
} from "./queryKeys";

interface ProxyEnvelope<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface ChatThreadsResponse {
  items: ChatThreadResponse[];
  meta: { total: number; page: number; perPage: number; totalPages: number };
}

interface ChatMessagesResponse {
  items: ChatMessageResponse[];
  meta: { total: number; page: number; perPage: number; totalPages: number };
}

async function parseJson<T>(response: Response, fallbackCode: string): Promise<T> {
  const correlationId = response.headers.get(REQUEST_ID_HEADER) ?? undefined;
  let json: ProxyEnvelope<T>;
  try {
    json = (await response.json()) as ProxyEnvelope<T>;
  } catch {
    throw new ApiError({
      code: "invalid.response",
      message: "invalid.response",
      status: response.status,
      correlationId,
    });
  }
  if (!response.ok || !json.success || json.data === undefined) {
    throw new ApiError({
      code: json.message ?? fallbackCode,
      message: json.message ?? fallbackCode,
      status: response.status,
      correlationId,
    });
  }
  return json.data;
}

export async function fetchThreads(
  params: ChatThreadsParams,
): Promise<ChatThreadsResponse> {
  const search = new URLSearchParams({
    page: String(params.page),
    per_page: String(params.perPage),
  });
  const response = await fetch(`/api/proxy/api/v1/chats?${search.toString()}`, {
    credentials: "include",
    headers: { accept: "application/json" },
  });
  return parseJson<ChatThreadsResponse>(response, "chat.threads.failed");
}

export function useThreads(params: ChatThreadsParams) {
  return useQuery<ChatThreadsResponse, ApiError>({
    queryKey: chatKeys.threads(params),
    queryFn: () => fetchThreads(params),
    staleTime: 15_000,
  });
}

export async function fetchMessages(
  params: ChatMessagesParams,
): Promise<ChatMessagesResponse> {
  const search = new URLSearchParams({
    page: String(params.page),
    per_page: String(params.perPage),
  });
  if (params.beforeId !== undefined) {
    search.set("before_id", String(params.beforeId));
  }
  const response = await fetch(
    `/api/proxy/api/v1/chats/${params.threadId}/messages?${search.toString()}`,
    { credentials: "include", headers: { accept: "application/json" } },
  );
  return parseJson<ChatMessagesResponse>(response, "chat.messages.failed");
}

export function useMessages(params: ChatMessagesParams, enabled = true) {
  return useQuery<ChatMessagesResponse, ApiError>({
    queryKey: chatKeys.messages(params),
    queryFn: () => fetchMessages(params),
    enabled,
    staleTime: 5_000,
  });
}

export async function fetchUnreadCount(): Promise<number> {
  const response = await fetch("/api/proxy/api/v1/chats/unread-count", {
    credentials: "include",
    headers: { accept: "application/json" },
  });
  const data = await parseJson<{ unread_count: number }>(
    response,
    "chat.unread.failed",
  );
  return data.unread_count;
}

export function useUnreadCount(options?: { refetchInterval?: number | false }) {
  return useQuery<number, ApiError>({
    queryKey: chatKeys.unread(),
    queryFn: fetchUnreadCount,
    refetchInterval: options?.refetchInterval ?? 30_000,
    refetchOnWindowFocus: true,
    staleTime: 10_000,
  });
}

export async function fetchWsToken(): Promise<WsTokenResponse> {
  const response = await fetch("/api/proxy/api/v1/chats/ws-token", {
    method: "POST",
    credentials: "include",
    headers: { accept: "application/json" },
  });
  return parseJson<WsTokenResponse>(response, "chat.ws-token.failed");
}

export interface CreateThreadInput {
  sellerCompanyId: number;
  productId?: number;
}

export async function createThread(
  input: CreateThreadInput,
): Promise<ChatCreateResponse> {
  const body: Record<string, number> = {
    seller_company_id: input.sellerCompanyId,
  };
  if (input.productId !== undefined) body.product_id = input.productId;
  const response = await fetch("/api/proxy/api/v1/chats/create", {
    method: "POST",
    credentials: "include",
    headers: { accept: "application/json", "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return parseJson<ChatCreateResponse>(response, "chat.create.failed");
}

export function useCreateThread() {
  const queryClient = useQueryClient();
  return useMutation<ChatCreateResponse, ApiError, CreateThreadInput>({
    mutationFn: createThread,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.all });
    },
    onError: (error) => {
      log.warn("chat.create.failed", {
        code: error.code,
        correlationId: error.correlationId,
      });
    },
  });
}

export async function uploadAttachment(
  threadId: number,
  file: File,
): Promise<ChatUploadAttachmentResponse> {
  const form = new FormData();
  form.append("file", file);
  const response = await fetch(
    `/api/proxy/api/v1/chats/${threadId}/messages/image`,
    {
      method: "POST",
      credentials: "include",
      headers: { accept: "application/json" },
      body: form,
    },
  );
  return parseJson<ChatUploadAttachmentResponse>(
    response,
    "chat.attachment.failed",
  );
}

export async function hideThread(threadId: number): Promise<void> {
  const response = await fetch(`/api/proxy/api/v1/chats/${threadId}`, {
    method: "DELETE",
    credentials: "include",
    headers: { accept: "application/json" },
  });
  await parseJson<unknown>(response, "chat.hide.failed");
}

export function useHideThread() {
  const queryClient = useQueryClient();
  return useMutation<void, ApiError, number>({
    mutationFn: hideThread,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.all });
    },
    onError: (error, threadId) => {
      log.warn("chat.hide.failed", {
        threadId,
        code: error.code,
        correlationId: error.correlationId,
      });
    },
  });
}
