"use client";

import { useMutation } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/errors";
import {
  ReportCreateRequest,
  ReportShortResponse,
} from "@/lib/api/schemas/report";
import { REQUEST_ID_HEADER } from "@/lib/http/requestId";
import { log } from "@/lib/log";

import { reportKeys } from "./queryKeys";

interface ProxyEnvelope<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export async function createReport(
  input: ReportCreateRequest,
): Promise<ReportShortResponse> {
  // The backend endpoint is `[PUBLIC]` (no auth) but we still go through the
  // Next proxy so we get the same correlation-id header on the response.
  const payload = ReportCreateRequest.parse(input);

  const response = await fetch("/api/proxy/api/v1/reports", {
    method: "POST",
    credentials: "include",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

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

  if (!response.ok || !json.success || json.data === undefined) {
    throw new ApiError({
      code: json.message ?? "report.create.failed",
      message: json.message ?? "report.create.failed",
      status: response.status,
      correlationId,
    });
  }

  const parsed = ReportShortResponse.safeParse(json.data);
  if (!parsed.success) {
    throw new ApiError({
      code: "invalid.response",
      message: "invalid.response",
      status: response.status,
      correlationId,
    });
  }
  return parsed.data;
}

export function useCreateReport() {
  return useMutation<ReportShortResponse, ApiError, ReportCreateRequest>({
    mutationKey: reportKeys.create(),
    mutationFn: createReport,
    retry: false,
    onError: (error) => {
      log.warn("report.create.failed", {
        code: error.code,
        status: error.status,
        correlationId: error.correlationId,
      });
    },
  });
}
