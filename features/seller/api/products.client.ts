"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/errors";
import { REQUEST_ID_HEADER } from "@/lib/http/requestId";
import { log } from "@/lib/log";

import { sellerKeys } from "./queryKeys";

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

export interface CreateProductWireBody {
  companyId: number;
  categoryId: number;
  name: string;
  shortDescription?: string;
  description: string;
  priceType: "FIXED" | "FROM_PRICE" | "NEGOTIABLE";
  saleType: "WHOLESALE" | "RETAIL";
  price: number;
  currency: "UZS" | "USD";
  regionId: number;
  districtId?: number;
  minProduct: number;
  attributes?: Record<string, unknown>;
}

export interface UpdateProductWireBody {
  company_id: number;
  category_id: number;
  name: string;
  short_description?: string;
  description?: string;
  price_type: "FIXED" | "FROM_PRICE" | "NEGOTIABLE";
  price?: number;
  currency: "UZS" | "USD";
  region_id: number;
  district_id?: number;
  attributes?: Record<string, unknown>;
}

export async function createProduct(body: CreateProductWireBody) {
  return callJson<{ id: number; slug: string }>(
    "/api/v1/products",
    { method: "POST", body },
    "product.create.failed",
  );
}

export async function updateProduct(id: number, body: UpdateProductWireBody) {
  return callJson<{ id: number; slug: string }>(
    `/api/v1/products/${id}`,
    { method: "PUT", body },
    "product.update.failed",
  );
}

export async function deleteProduct(id: number) {
  return callJson<unknown>(
    `/api/v1/products/${id}`,
    { method: "DELETE" },
    "product.delete.failed",
  );
}

export async function publishProduct(id: number) {
  return callJson<unknown>(
    `/api/v1/products/${id}/publish`,
    { method: "POST" },
    "product.publish.failed",
  );
}

export async function archiveProduct(id: number) {
  return callJson<unknown>(
    `/api/v1/products/${id}/archive`,
    { method: "POST" },
    "product.archive.failed",
  );
}

/**
 * Uploads images to a product. Backend expects `multipart/form-data` with the
 * field name `files` (plural). Used after creating a product from the
 * dashboard modal so the seller can drop photos in one flow. We surface the
 * count of successfully uploaded files so the caller can warn if any failed.
 */
export interface UploadProductImagesResult {
  uploadedCount: number;
  attemptedCount: number;
  correlationId?: string | undefined;
}

export async function uploadProductImages(
  productId: number,
  files: File[],
): Promise<UploadProductImagesResult> {
  if (files.length === 0) {
    return { uploadedCount: 0, attemptedCount: 0 };
  }
  const formData = new FormData();
  for (const file of files) formData.append("files", file);
  const response = await fetch(
    `/api/proxy/api/v1/products/${productId}/images`,
    { method: "POST", credentials: "include", body: formData },
  );
  const correlationId = response.headers.get(REQUEST_ID_HEADER) ?? undefined;
  if (!response.ok) {
    throw new ApiError({
      code: "product.image.upload.failed",
      message: "product.image.upload.failed",
      status: response.status,
      correlationId,
    });
  }
  let body: { data?: unknown[] } = {};
  try {
    body = (await response.json()) as { data?: unknown[] };
  } catch {
    // Body parse failure isn't critical — count by attempted.
  }
  const uploadedCount = Array.isArray(body.data)
    ? body.data.length
    : files.length;
  return { uploadedCount, attemptedCount: files.length, correlationId };
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, { id: number }>({
    mutationFn: ({ id }) => deleteProduct(id),
    onError: (error, variables) => {
      log.warn("seller.product.delete.failed", {
        productId: variables.id,
        code: error.code,
        correlationId: error.correlationId,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: sellerKeys.products.all() });
    },
  });
}

export function useArchiveProduct() {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, { id: number }>({
    mutationFn: ({ id }) => archiveProduct(id),
    onError: (error, variables) => {
      log.warn("seller.product.archive.failed", {
        productId: variables.id,
        code: error.code,
        correlationId: error.correlationId,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: sellerKeys.products.all() });
    },
  });
}
