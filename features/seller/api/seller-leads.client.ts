"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/errors";
import type { LeadStatus } from "@/lib/api/schemas/enums";
import { REQUEST_ID_HEADER } from "@/lib/http/requestId";
import { log } from "@/lib/log";

import { sellerKeys } from "./queryKeys";

interface ProxyEnvelope<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface UpdateLeadStatusInput {
  id: number;
  status: LeadStatus;
  closeReason?: string | undefined;
}

async function callUpdateLeadStatus(input: UpdateLeadStatusInput) {
  const body: Record<string, unknown> = { status: input.status };
  if (input.closeReason && input.closeReason.length > 0) {
    body.closeReason = input.closeReason;
  }
  const response = await fetch(`/api/proxy/api/v1/leads/${input.id}/status`, {
    method: "PUT",
    credentials: "include",
    headers: { accept: "application/json", "content-type": "application/json" },
    body: JSON.stringify(body),
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
  if (!response.ok || !json.success) {
    throw new ApiError({
      code: json.message ?? "lead.status.update.failed",
      message: json.message ?? "lead.status.update.failed",
      status: response.status,
      correlationId,
    });
  }
  return { correlationId };
}

export function useUpdateLeadStatus() {
  const queryClient = useQueryClient();
  return useMutation<{ correlationId?: string | undefined }, ApiError, UpdateLeadStatusInput>({
    mutationFn: (input) => callUpdateLeadStatus(input),
    onError: (error, variables) => {
      log.warn("seller.lead.status.update.failed", {
        leadId: variables.id,
        nextStatus: variables.status,
        code: error.code,
        correlationId: error.correlationId,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: sellerKeys.leads.all() });
    },
  });
}
