"use client";

import { ApiError } from "@/lib/api/errors";
import type {
  CompanyRequestDTO,
  CompanyResponseDTO,
} from "@/lib/api/schemas/company";
import { REQUEST_ID_HEADER } from "@/lib/http/requestId";

interface ProxyEnvelope<T> {
  success: boolean;
  data?: T;
  message?: string;
}

async function postJson<TBody, TData>(
  path: string,
  body: TBody,
  errorCode: string,
  method: "POST" | "PUT" = "POST",
): Promise<{ data: TData; correlationId?: string | undefined }> {
  const response = await fetch(`/api/proxy${path}`, {
    method,
    credentials: "include",
    headers: { accept: "application/json", "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const correlationId = response.headers.get(REQUEST_ID_HEADER) ?? undefined;

  let json: ProxyEnvelope<TData>;
  try {
    json = (await response.json()) as ProxyEnvelope<TData>;
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
      code: json.message ?? errorCode,
      message: json.message ?? errorCode,
      status: response.status,
      correlationId,
    });
  }
  return { data: json.data, correlationId };
}

async function uploadFile<TData>(
  path: string,
  fieldName: string,
  file: File,
  errorCode: string,
): Promise<{ data: TData; correlationId?: string | undefined }> {
  const formData = new FormData();
  formData.set(fieldName, file);

  const response = await fetch(`/api/proxy${path}`, {
    method: "POST",
    credentials: "include",
    headers: { accept: "application/json" },
    body: formData,
  });
  const correlationId = response.headers.get(REQUEST_ID_HEADER) ?? undefined;

  let json: ProxyEnvelope<TData>;
  try {
    json = (await response.json()) as ProxyEnvelope<TData>;
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
      code: json.message ?? errorCode,
      message: json.message ?? errorCode,
      status: response.status,
      correlationId,
    });
  }
  return { data: json.data, correlationId };
}

export interface CreateCompanyResult {
  company: CompanyResponseDTO;
  correlationId?: string | undefined;
}

export async function createCompany(
  body: CompanyRequestDTO,
): Promise<CreateCompanyResult> {
  const { data, correlationId } = await postJson<
    CompanyRequestDTO,
    CompanyResponseDTO
  >("/api/v1/companies/create", body, "company.create.failed");
  return { company: data, correlationId };
}

export async function updateCompany(
  id: number,
  body: CompanyRequestDTO,
): Promise<CreateCompanyResult> {
  const { data, correlationId } = await postJson<
    CompanyRequestDTO,
    CompanyResponseDTO
  >(`/api/v1/companies/${id}`, body, "company.update.failed", "PUT");
  return { company: data, correlationId };
}

export interface UploadResult {
  url: string;
  id: string;
  correlationId?: string | undefined;
}

export async function uploadCompanyLogo(
  companyId: number,
  file: File,
): Promise<UploadResult> {
  const { data, correlationId } = await uploadFile<{ id: string; url: string }>(
    `/api/v1/companies/${companyId}/logo`,
    "file",
    file,
    "company.logo.upload.failed",
  );
  return { id: data.id, url: data.url, correlationId };
}

export async function uploadCompanyCover(
  companyId: number,
  file: File,
): Promise<UploadResult> {
  const { data, correlationId } = await uploadFile<{ id: string; url: string }>(
    `/api/v1/companies/${companyId}/coverUrl`,
    "file",
    file,
    "company.cover.upload.failed",
  );
  return { id: data.id, url: data.url, correlationId };
}

export interface SubmitVerificationResult {
  correlationId?: string | undefined;
}

export async function submitCompanyVerification(
  companyId: number,
): Promise<SubmitVerificationResult> {
  const response = await fetch(
    `/api/proxy/api/v1/companies/${companyId}/submit-verification`,
    {
      method: "POST",
      credentials: "include",
      headers: { accept: "application/json" },
    },
  );
  const correlationId = response.headers.get(REQUEST_ID_HEADER) ?? undefined;

  let json: ProxyEnvelope<unknown>;
  try {
    json = (await response.json()) as ProxyEnvelope<unknown>;
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
      code: json.message ?? "company.submit.failed",
      message: json.message ?? "company.submit.failed",
      status: response.status,
      correlationId,
    });
  }
  return { correlationId };
}
