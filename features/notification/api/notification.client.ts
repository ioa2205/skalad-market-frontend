"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useIsAuthenticated } from "@/features/auth/hooks/useIsAuthenticated";
import { ApiError } from "@/lib/api/errors";
import type {
  NotificationPreferences,
  NotificationResponse,
} from "@/lib/api/schemas/notification";
import { REQUEST_ID_HEADER } from "@/lib/http/requestId";
import { log } from "@/lib/log";

import { notificationKeys, type NotificationsListParams } from "./queryKeys";

interface ProxyEnvelope<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface NotificationsListResponse {
  items: NotificationResponse[];
  meta: { total: number; page: number; perPage: number; totalPages: number };
}

type WirePageMeta = NotificationsListResponse["meta"] & {
  per_page?: number;
  total_pages?: number;
};

function normalizeMeta(meta: WirePageMeta): NotificationsListResponse["meta"] {
  return {
    total: meta.total,
    page: meta.page,
    perPage: meta.perPage ?? meta.per_page ?? 0,
    totalPages: meta.totalPages ?? meta.total_pages ?? 0,
  };
}

async function parseJson<T>(
  response: Response,
  fallbackCode: string,
  options: { allowEmpty?: boolean } = {},
): Promise<T> {
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
  if (!response.ok || !json.success || (!options.allowEmpty && json.data === undefined)) {
    throw new ApiError({
      code: json.message ?? fallbackCode,
      message: json.message ?? fallbackCode,
      status: response.status,
      correlationId,
    });
  }
  return json.data as T;
}

export async function fetchNotifications(
  params: NotificationsListParams,
): Promise<NotificationsListResponse> {
  const search = new URLSearchParams({
    page: String(params.page),
    per_page: String(params.perPage),
  });
  if (params.isRead !== undefined) search.set("is_read", String(params.isRead));
  const response = await fetch(
    `/api/proxy/api/v1/notifications?${search.toString()}`,
    { credentials: "include", headers: { accept: "application/json" } },
  );
  const data = await parseJson<NotificationsListResponse>(
    response,
    "notifications.list.failed",
  );
  return { ...data, meta: normalizeMeta(data.meta as WirePageMeta) };
}

export function useNotifications(
  params: NotificationsListParams,
  options?: { enabled?: boolean; refetchInterval?: number | false },
) {
  const isAuthenticated = useIsAuthenticated();
  return useQuery<NotificationsListResponse, ApiError>({
    queryKey: notificationKeys.list(params),
    queryFn: () => fetchNotifications(params),
    // Guests have no notifications — gate to skip the 401 round-trip.
    enabled: isAuthenticated && (options?.enabled ?? true),
    refetchInterval: options?.refetchInterval ?? false,
    staleTime: 15_000,
  });
}

export interface MarkReadInput {
  ids?: number[];
  markAll?: boolean;
}

async function callMarkRead(input: MarkReadInput): Promise<void> {
  const body = input.markAll
    ? { mark_all: true }
    : { notification_ids: input.ids ?? [] };
  const response = await fetch("/api/proxy/api/v1/notifications/mark-read", {
    method: "POST",
    credentials: "include",
    headers: { accept: "application/json", "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  await parseJson<unknown>(response, "notifications.mark-read.failed", {
    allowEmpty: true,
  });
}

export function useMarkNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation<void, ApiError, MarkReadInput>({
    mutationFn: callMarkRead,
    onError: (error) => {
      log.warn("notifications.mark-read.failed", {
        code: error.code,
        correlationId: error.correlationId,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export async function fetchPreferences(): Promise<NotificationPreferences> {
  const response = await fetch("/api/proxy/api/v1/notifications/preferences", {
    credentials: "include",
    headers: { accept: "application/json" },
  });
  return parseJson<NotificationPreferences>(
    response,
    "notifications.preferences.failed",
  );
}

export async function savePreferences(
  prefs: NotificationPreferences,
): Promise<NotificationPreferences> {
  const response = await fetch("/api/proxy/api/v1/notifications/preferences", {
    method: "PUT",
    credentials: "include",
    headers: { accept: "application/json", "content-type": "application/json" },
    body: JSON.stringify(prefs),
  });
  return parseJson<NotificationPreferences>(
    response,
    "notifications.preferences.failed",
  );
}

export function usePreferences(initial?: NotificationPreferences) {
  return useQuery<NotificationPreferences, ApiError>({
    queryKey: notificationKeys.preferences(),
    queryFn: fetchPreferences,
    ...(initial ? { initialData: initial } : {}),
    staleTime: 60_000,
  });
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient();
  return useMutation<NotificationPreferences, ApiError, NotificationPreferences>({
    mutationFn: savePreferences,
    onSuccess: (data) => {
      queryClient.setQueryData(notificationKeys.preferences(), data);
    },
    onError: (error) => {
      log.warn("notifications.preferences.failed", {
        code: error.code,
        correlationId: error.correlationId,
      });
    },
  });
}
