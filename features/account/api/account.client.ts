"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/errors";
import type {
  AttachDTO,
  UserPhotoDTO,
  UsersDTO,
  UsersUpdateRequestDTO,
} from "@/lib/api/schemas/user";
import { REQUEST_ID_HEADER } from "@/lib/http/requestId";
import { log } from "@/lib/log";

import { accountKeys } from "./queryKeys";

interface ProxyEnvelope<T> {
  success: boolean;
  data?: T;
  message?: string;
}

async function parseEnvelope<T>(
  response: Response,
  fallbackCode: string,
  { allowEmpty = false }: { allowEmpty?: boolean } = {},
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
  const ok = response.ok && json.success;
  if (!ok || (!allowEmpty && json.data === undefined)) {
    throw new ApiError({
      code: json.message ?? fallbackCode,
      message: json.message ?? fallbackCode,
      status: response.status,
      correlationId,
    });
  }
  return json.data as T;
}

// ---- Profile --------------------------------------------------------------

export async function fetchProfile(): Promise<UsersDTO> {
  const response = await fetch("/api/proxy/api/v1/users", {
    credentials: "include",
    headers: { accept: "application/json" },
  });
  return parseEnvelope<UsersDTO>(response, "account.profile.failed");
}

export function useProfile(initial?: UsersDTO) {
  return useQuery<UsersDTO, ApiError>({
    queryKey: accountKeys.profile(),
    queryFn: fetchProfile,
    ...(initial ? { initialData: initial } : {}),
    staleTime: 60_000,
  });
}

export async function saveProfile(
  payload: UsersUpdateRequestDTO,
): Promise<UsersUpdateRequestDTO> {
  const response = await fetch("/api/proxy/api/v1/users", {
    method: "PUT",
    credentials: "include",
    headers: { accept: "application/json", "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseEnvelope<UsersUpdateRequestDTO>(response, "account.profile.save.failed");
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation<UsersUpdateRequestDTO, ApiError, UsersUpdateRequestDTO>({
    mutationFn: saveProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(accountKeys.profile(), data);
    },
    onError: (error) => {
      log.warn("account.profile.save.failed", {
        code: error.code,
        correlationId: error.correlationId,
      });
    },
  });
}

// ---- Photo ----------------------------------------------------------------

export async function fetchPhoto(): Promise<UserPhotoDTO | null> {
  const response = await fetch("/api/proxy/api/v1/users/photo", {
    credentials: "include",
    headers: { accept: "application/json" },
  });
  if (response.status === 404) return null;
  return parseEnvelope<UserPhotoDTO>(response, "account.photo.failed");
}

export interface UsePhotoOptions {
  initial?: UserPhotoDTO | null;
  enabled?: boolean;
}

export function usePhoto(options: UsePhotoOptions = {}) {
  const { initial, enabled = true } = options;
  return useQuery<UserPhotoDTO | null, ApiError>({
    queryKey: accountKeys.photo(),
    queryFn: fetchPhoto,
    enabled,
    ...(initial !== undefined ? { initialData: initial } : {}),
    staleTime: 60_000,
  });
}

export async function uploadAttach(file: File): Promise<AttachDTO> {
  const form = new FormData();
  form.set("file", file);
  const response = await fetch("/api/proxy/api/v1/attach/upload", {
    method: "POST",
    credentials: "include",
    headers: { accept: "application/json" },
    body: form,
  });
  return parseEnvelope<AttachDTO>(response, "attach.upload.failed");
}

export async function setUserPhoto(photoId: string): Promise<void> {
  const response = await fetch("/api/proxy/api/v1/users/update/photo", {
    method: "PUT",
    credentials: "include",
    headers: { accept: "application/json", "content-type": "application/json" },
    body: JSON.stringify({ photoId }),
  });
  await parseEnvelope<unknown>(response, "account.photo.update.failed", {
    allowEmpty: true,
  });
}

export interface ReplaceAvatarResult {
  photoId: string;
}

/**
 * Two-step flow: upload to /attach/upload, then PUT /users/update/photo.
 * On the second step's failure we surface the error so the UI can roll its
 * preview back; the orphaned attach is left for the backend to GC.
 */
export function useReplaceAvatar() {
  const queryClient = useQueryClient();
  return useMutation<ReplaceAvatarResult, ApiError, File>({
    mutationFn: async (file) => {
      const attach = await uploadAttach(file);
      await setUserPhoto(attach.id);
      return { photoId: attach.id };
    },
    onSuccess: ({ photoId }) => {
      queryClient.setQueryData(accountKeys.photo(), { photoId });
    },
    onError: (error) => {
      log.warn("account.avatar.replace.failed", {
        code: error.code,
        correlationId: error.correlationId,
      });
    },
  });
}

// ---- Locale ---------------------------------------------------------------

export async function setLocaleCookie(locale: "ru" | "en" | "uz"): Promise<void> {
  const response = await fetch("/api/locale", {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({ locale }),
  });
  if (!response.ok) {
    const correlationId = response.headers.get(REQUEST_ID_HEADER) ?? undefined;
    let message = "locale.update.failed";
    try {
      const body = (await response.json()) as { message?: string };
      message = body.message ?? message;
    } catch {
      // ignore
    }
    throw new ApiError({
      code: message,
      message,
      status: response.status,
      correlationId,
    });
  }
}
