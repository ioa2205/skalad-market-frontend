import "server-only";

import { serverFetch } from "@/lib/api/server";
import { LeadResponse, type LeadResponse as LeadT } from "@/lib/api/schemas/lead";
import { pagedResponseSchema } from "@/lib/api/schemas/common";
import type { LeadStatus } from "@/lib/api/schemas/enums";
import { log } from "@/lib/log";

const LeadsPage = pagedResponseSchema(LeadResponse);

export interface LeadsListMeta {
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface FetchLeadsInput {
  status?: LeadStatus;
  page: number;
  perPage: number;
}

export interface FetchLeadsResult {
  items: LeadT[];
  meta: LeadsListMeta;
  error?: { code: string; correlationId?: string | undefined };
}

export async function fetchLeads(input: FetchLeadsInput): Promise<FetchLeadsResult> {
  const params = new URLSearchParams({
    page: String(input.page),
    perPage: String(input.perPage),
  });
  if (input.status) params.set("status", input.status);

  try {
    const data = await serverFetch(`/api/v1/leads?${params.toString()}`, {
      schema: LeadsPage,
      cache: "no-store",
    });
    return { items: data.items, meta: data.meta };
  } catch (error) {
    const err = error as { code?: string; correlationId?: string };
    log.warn("leads.list.failed", {
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

export interface FetchLeadResult {
  lead?: LeadT;
  error?: { code: string; correlationId?: string | undefined };
}

export async function fetchLeadById(id: number): Promise<FetchLeadResult> {
  try {
    const lead = await serverFetch(`/api/v1/leads/${id}`, {
      schema: LeadResponse,
      cache: "no-store",
    });
    return { lead };
  } catch (error) {
    const err = error as { code?: string; correlationId?: string };
    log.warn("leads.detail.failed", {
      leadId: id,
      code: err.code ?? "unknown.error",
      correlationId: err.correlationId,
    });
    return {
      error: {
        code: err.code ?? "unknown.error",
        correlationId: err.correlationId,
      },
    };
  }
}
