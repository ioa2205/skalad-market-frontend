import "server-only";

import { serverFetch } from "@/lib/api/server";
import { pagedResponseSchema } from "@/lib/api/schemas/common";
import type { LeadStatus } from "@/lib/api/schemas/enums";
import {
  LeadResponse,
  type LeadResponse as LeadT,
} from "@/lib/api/schemas/lead";
import { log } from "@/lib/log";

const SellerLeadsPage = pagedResponseSchema(LeadResponse);

export interface FetchSellerLeadsInput {
  companyId?: number | undefined;
  status?: LeadStatus | undefined;
  page: number;
  perPage: number;
}

export interface SellerLeadsMeta {
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface FetchSellerLeadsResult {
  items: LeadT[];
  meta: SellerLeadsMeta;
  error?: { code: string; correlationId?: string | undefined };
}

/** Lists the seller's incoming leads (`GET /api/v1/leads/seller`). */
export async function fetchSellerLeads(
  input: FetchSellerLeadsInput,
): Promise<FetchSellerLeadsResult> {
  const params = new URLSearchParams({
    page: String(input.page),
    perPage: String(input.perPage),
  });
  if (input.companyId !== undefined) params.set("companyId", String(input.companyId));
  if (input.status) params.set("status", input.status);

  try {
    const data = await serverFetch(`/api/v1/leads/seller?${params.toString()}`, {
      schema: SellerLeadsPage,
      cache: "no-store",
    });
    return { items: data.items, meta: data.meta };
  } catch (error) {
    const err = error as { code?: string; correlationId?: string };
    log.warn("seller.leads.list.failed", {
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
