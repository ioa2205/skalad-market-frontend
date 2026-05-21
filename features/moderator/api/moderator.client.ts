"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/errors";
import { REQUEST_ID_HEADER } from "@/lib/http/requestId";
import { log } from "@/lib/log";

import { moderatorKeys } from "./queryKeys";

interface ProxyEnvelope<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface JsonRequestInit {
  method: "POST" | "PUT" | "DELETE";
  body?: unknown;
}

async function callJson<T>(
  path: string,
  init: JsonRequestInit,
  errorCode: string,
): Promise<{ data: T; correlationId?: string | undefined }> {
  const headers: Record<string, string> = { accept: "application/json" };
  if (init.body !== undefined) headers["content-type"] = "application/json";
  const response = await fetch(`/api/proxy${path}`, {
    method: init.method,
    credentials: "include",
    headers,
    ...(init.body !== undefined ? { body: JSON.stringify(init.body) } : {}),
  });
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
  if (!response.ok || !json.success) {
    throw new ApiError({
      code: json.message ?? errorCode,
      message: json.message ?? errorCode,
      status: response.status,
      correlationId,
    });
  }
  return { data: (json.data ?? ({} as T)), correlationId };
}

// ---- Product moderation ----------------------------------------------------

export interface RejectReasonBody {
  reasonCode?: string;
  comment?: string;
}

export async function approveProduct(id: number) {
  return callJson<unknown>(
    `/api/v1/admin/products/${id}/approve`,
    { method: "PUT" },
    "product.approve.failed",
  );
}

export async function rejectProduct(id: number, body: RejectReasonBody = {}) {
  return callJson<unknown>(
    `/api/v1/admin/products/${id}/reject`,
    { method: "PUT", body },
    "product.reject.failed",
  );
}

export async function blockProduct(id: number, reason?: string) {
  return callJson<unknown>(
    `/api/v1/admin/products/${id}/block`,
    { method: "PUT", body: { reason: reason ?? "" } },
    "product.block.failed",
  );
}

// ---- Company moderation ----------------------------------------------------

export async function verifyCompany(id: number) {
  return callJson<unknown>(
    `/api/v1/admin/companies/${id}/verify`,
    { method: "PUT" },
    "company.verify.failed",
  );
}

export async function rejectCompany(id: number, body: RejectReasonBody = {}) {
  return callJson<unknown>(
    `/api/v1/admin/companies/${id}/reject`,
    { method: "PUT", body },
    "company.reject.failed",
  );
}

export async function blockCompany(id: number, reason?: string) {
  return callJson<unknown>(
    `/api/v1/admin/companies/${id}/block`,
    { method: "PUT", body: { reason: reason ?? "" } },
    "company.block.failed",
  );
}

// ---- Report moderation ----------------------------------------------------

export async function resolveReport(id: number, resolutionNote: string) {
  return callJson<unknown>(
    `/api/v1/admin/reports/${id}/resolve`,
    { method: "PUT", body: { resolutionNote } },
    "report.resolve.failed",
  );
}

export async function dismissReport(id: number, resolutionNote: string) {
  return callJson<unknown>(
    `/api/v1/admin/reports/${id}/reject`,
    { method: "PUT", body: { resolutionNote } },
    "report.reject.failed",
  );
}

// ---- User moderation ------------------------------------------------------

export async function blockUser(userId: number, reason: string) {
  return callJson<unknown>(
    `/api/v1/admin/users/${userId}/block`,
    { method: "PUT", body: { reason } },
    "user.block.failed",
  );
}

export async function unblockUser(userId: number) {
  return callJson<unknown>(
    `/api/v1/admin/users/${userId}/unblock`,
    { method: "PUT" },
    "user.unblock.failed",
  );
}

// ---- React Query mutation hooks -------------------------------------------

export function useApproveProduct() {
  const qc = useQueryClient();
  return useMutation<unknown, ApiError, { id: number }>({
    mutationFn: ({ id }) => approveProduct(id),
    onError: (error, vars) => {
      log.warn("moderator.product.approve.failed", {
        productId: vars.id,
        code: error.code,
        correlationId: error.correlationId,
      });
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: moderatorKeys.products.all() });
      qc.invalidateQueries({ queryKey: moderatorKeys.all });
    },
  });
}

export function useRejectProduct() {
  const qc = useQueryClient();
  return useMutation<unknown, ApiError, { id: number; reason?: string }>({
    mutationFn: ({ id, reason }) =>
      rejectProduct(id, reason ? { comment: reason } : {}),
    onError: (error, vars) => {
      log.warn("moderator.product.reject.failed", {
        productId: vars.id,
        code: error.code,
        correlationId: error.correlationId,
      });
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: moderatorKeys.products.all() });
      qc.invalidateQueries({ queryKey: moderatorKeys.all });
    },
  });
}

export function useVerifyCompany() {
  const qc = useQueryClient();
  return useMutation<unknown, ApiError, { id: number }>({
    mutationFn: ({ id }) => verifyCompany(id),
    onError: (error, vars) => {
      log.warn("moderator.company.verify.failed", {
        companyId: vars.id,
        code: error.code,
        correlationId: error.correlationId,
      });
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: moderatorKeys.companies.all() });
      qc.invalidateQueries({ queryKey: moderatorKeys.all });
    },
  });
}

export function useRejectCompany() {
  const qc = useQueryClient();
  return useMutation<unknown, ApiError, { id: number; reason?: string }>({
    mutationFn: ({ id, reason }) =>
      rejectCompany(id, reason ? { comment: reason } : {}),
    onError: (error, vars) => {
      log.warn("moderator.company.reject.failed", {
        companyId: vars.id,
        code: error.code,
        correlationId: error.correlationId,
      });
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: moderatorKeys.companies.all() });
      qc.invalidateQueries({ queryKey: moderatorKeys.all });
    },
  });
}

export function useResolveReport() {
  const qc = useQueryClient();
  return useMutation<
    unknown,
    ApiError,
    { id: number; resolutionNote: string }
  >({
    mutationFn: ({ id, resolutionNote }) => resolveReport(id, resolutionNote),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: moderatorKeys.reports.all() });
      qc.invalidateQueries({ queryKey: moderatorKeys.all });
    },
  });
}

export function useDismissReport() {
  const qc = useQueryClient();
  return useMutation<
    unknown,
    ApiError,
    { id: number; resolutionNote: string }
  >({
    mutationFn: ({ id, resolutionNote }) => dismissReport(id, resolutionNote),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: moderatorKeys.reports.all() });
      qc.invalidateQueries({ queryKey: moderatorKeys.all });
    },
  });
}

export function useBlockUser() {
  const qc = useQueryClient();
  return useMutation<unknown, ApiError, { userId: number; reason: string }>({
    mutationFn: ({ userId, reason }) => blockUser(userId, reason),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: moderatorKeys.accounts.all() });
    },
  });
}

export function useUnblockUser() {
  const qc = useQueryClient();
  return useMutation<unknown, ApiError, { userId: number }>({
    mutationFn: ({ userId }) => unblockUser(userId),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: moderatorKeys.accounts.all() });
    },
  });
}
