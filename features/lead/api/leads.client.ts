"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/errors";
import type { LeadSource, LeadStatus } from "@/lib/api/schemas/enums";
import { REQUEST_ID_HEADER } from "@/lib/http/requestId";
import { log } from "@/lib/log";

import { leadsKeys } from "./queryKeys";

interface ProxyEnvelope<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface LeadContact {
  contactName: string;
  contactPhone: string;
  comment?: string;
}

export type CreateLeadInput =
  | ({ source: Extract<LeadSource, "PRODUCT">; productId: number } & LeadContact)
  | ({ source: Extract<LeadSource, "CART">; productIds: number[] } & LeadContact);

export interface CreateLeadResult {
  leadId: number;
  correlationId?: string | undefined;
}

interface LeadCreateResponseShape {
  id: number;
}

/**
 * One POST per call. Cart fan-out (one lead per company) lives in
 * `features/cart` — this helper is intentionally single-shot so product-detail
 * "request" flows can reuse it without inheriting cart-only branching.
 */
export async function createLead(input: CreateLeadInput): Promise<CreateLeadResult> {
  const body =
    input.source === "CART"
      ? {
          source: "CART" as const,
          productIds: input.productIds,
          contactName: input.contactName,
          contactPhone: input.contactPhone,
          ...(input.comment ? { comment: input.comment } : {}),
        }
      : {
          source: "PRODUCT" as const,
          productId: input.productId,
          contactName: input.contactName,
          contactPhone: input.contactPhone,
          ...(input.comment ? { comment: input.comment } : {}),
        };

  const response = await fetch("/api/proxy/api/v1/leads", {
    method: "POST",
    credentials: "include",
    headers: { accept: "application/json", "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const correlationId = response.headers.get(REQUEST_ID_HEADER) ?? undefined;

  let json: ProxyEnvelope<LeadCreateResponseShape>;
  try {
    json = (await response.json()) as ProxyEnvelope<LeadCreateResponseShape>;
  } catch {
    throw new ApiError({
      code: "invalid.response",
      message: "invalid.response",
      status: response.status,
      correlationId,
    });
  }
  if (!response.ok || !json.success || !json.data) {
    throw new ApiError({
      code: json.message ?? "lead.create.failed",
      message: json.message ?? "lead.create.failed",
      status: response.status,
      correlationId,
    });
  }
  return { leadId: json.data.id, correlationId };
}

interface CancelLeadResponseShape {
  /** Backend returns `boolean` in `data` per /api/v1/leads/{id} DELETE. */
  ok: boolean;
}

async function callCancelLead(id: number): Promise<CancelLeadResponseShape> {
  const response = await fetch(`/api/proxy/api/v1/leads/${id}`, {
    method: "DELETE",
    credentials: "include",
    headers: { accept: "application/json" },
  });
  const correlationId = response.headers.get(REQUEST_ID_HEADER) ?? undefined;

  let json: ProxyEnvelope<boolean>;
  try {
    json = (await response.json()) as ProxyEnvelope<boolean>;
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
      code: json.message ?? "lead.cancel.failed",
      message: json.message ?? "lead.cancel.failed",
      status: response.status,
      correlationId,
    });
  }
  return { ok: json.data ?? true };
}

export interface CancelLeadVariables {
  id: number;
  /** Carried so optimistic UIs can identify which row to flip to CANCELED. */
  previousStatus?: LeadStatus;
}

export function useCancelLead() {
  const queryClient = useQueryClient();
  return useMutation<CancelLeadResponseShape, ApiError, CancelLeadVariables>({
    mutationFn: ({ id }) => callCancelLead(id),
    onError: (error, variables) => {
      log.warn("lead.cancel.failed", {
        leadId: variables.id,
        code: error.code,
        correlationId: error.correlationId,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: leadsKeys.all });
    },
  });
}
