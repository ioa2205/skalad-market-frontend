import type { LeadStatus } from "@/lib/api/schemas/enums";

export interface LeadsListParams {
  status?: LeadStatus;
  page: number;
  perPage: number;
}

export const leadsKeys = {
  all: ["leads"] as const,
  list: (params: LeadsListParams) => [...leadsKeys.all, "list", params] as const,
  detail: (id: number) => [...leadsKeys.all, "detail", id] as const,
};
