"use client";

import { ApiError } from "@/lib/api/errors";
import { createLead, type LeadContact } from "@/features/lead/api/leads.client";

import { groupByCompany } from "../selectors";
import type { CartItem } from "../schemas";

export type CartContactInfo = LeadContact;

export interface SubmitCartInput {
  items: CartItem[];
  contact: CartContactInfo;
}

export interface CompanySubmissionResult {
  companyId: number;
  companyName: string | undefined;
  productIds: number[];
  ok: boolean;
  leadId?: number;
  error?: { code: string; correlationId?: string | undefined };
}

/**
 * Backend wants one lead per company. We fan out in parallel (mutations don't
 * auto-retry per §3.3) and return per-company results so the UI can show
 * partial-failure states with their correlation ids.
 */
export async function submitCart(
  input: SubmitCartInput,
): Promise<CompanySubmissionResult[]> {
  const groups = groupByCompany(input.items);
  return Promise.all(
    groups.map(async (group): Promise<CompanySubmissionResult> => {
      const productIds = group.items.map((i) => i.productId);
      try {
        const { leadId } = await createLead({
          source: "CART",
          productIds,
          ...input.contact,
        });
        return {
          companyId: group.companyId,
          companyName: group.companyName,
          productIds,
          ok: true,
          leadId,
        };
      } catch (error) {
        const apiError = ApiError.from(error);
        return {
          companyId: group.companyId,
          companyName: group.companyName,
          productIds,
          ok: false,
          error: {
            code: apiError.code,
            correlationId: apiError.correlationId,
          },
        };
      }
    }),
  );
}
