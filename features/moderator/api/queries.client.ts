"use client";

import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { apiFetch } from "@/lib/api/client";
import { springPageSchema } from "@/lib/api/schemas/common";
import { CompanyResponseDTO } from "@/lib/api/schemas/company";
import { ProductResponse } from "@/lib/api/schemas/product";
import { ReportInfoResponse, ReportListItem } from "@/lib/api/schemas/report";
import { UsersResponse } from "@/lib/api/schemas/user";

import { moderatorKeys } from "./queryKeys";

/**
 * Client-side fetchers for the moderator tabs. Each tab calls the matching
 * `useXxxQueue` hook so it only fetches when its tab is mounted.
 *
 * Backend caveat: admin list endpoints use Spring `PageImpl` with 1-indexed
 * `page` query (verified against backend_summary §4). The response envelope
 * matches `springPageSchema` (number/size/totalElements/totalPages).
 */

const ProductQueueSchema = z.array(ProductResponse);
const CompanyQueueSchema = z.array(CompanyResponseDTO);
const ReportPageSchema = springPageSchema(ReportListItem);
const UserPageSchema = springPageSchema(UsersResponse);

export function useProductsQueue() {
  return useQuery({
    queryKey: moderatorKeys.products.queue(),
    queryFn: () =>
      apiFetch("/api/v1/admin/products/moderation-queue", {
        schema: ProductQueueSchema,
      }),
    staleTime: 15_000,
  });
}

export function useCompaniesQueue() {
  return useQuery({
    queryKey: moderatorKeys.companies.queue(),
    queryFn: () =>
      apiFetch("/api/v1/admin/companies/moderation-queue", {
        schema: CompanyQueueSchema,
      }),
    staleTime: 15_000,
  });
}

export interface ReportsQueryParams {
  status?: "NEW" | "RESOLVED" | "REJECTED";
  page?: number;
  size?: number;
}

export function useReportsList(params: ReportsQueryParams = {}) {
  const status = params.status ?? "NEW";
  const page = params.page ?? 1;
  const size = params.size ?? 20;
  return useQuery({
    queryKey: moderatorKeys.reports.list(status),
    queryFn: () => {
      const query = new URLSearchParams({
        page: String(page),
        size: String(size),
        status,
      });
      return apiFetch(`/api/v1/admin/reports?${query.toString()}`, {
        schema: ReportPageSchema,
      });
    },
    staleTime: 15_000,
  });
}

/**
 * Lazily fetches a single report's full detail (incl. `comment`) for the
 * "Подробнее" expander. Disabled until `enabled` flips true so the request
 * only fires when a moderator actually expands the row.
 */
export function useReportDetail(id: number, enabled: boolean) {
  return useQuery({
    queryKey: moderatorKeys.reports.detail(id),
    queryFn: () =>
      apiFetch(`/api/v1/admin/reports/${id}`, {
        schema: ReportInfoResponse,
      }),
    enabled,
    staleTime: 60_000,
  });
}

export interface AccountsQueryParams {
  q?: string;
  status?: "ACTIVE" | "IN_REGISTRATION" | "BLOCK";
  roles?: string;
  page?: number;
  perPage?: number;
}

export function useAccountsList(params: AccountsQueryParams = {}) {
  const filterKey = {
    ...(params.q ? { q: params.q } : {}),
    ...(params.status ? { status: params.status } : {}),
    ...(params.roles ? { roles: params.roles } : {}),
  };
  return useQuery({
    queryKey: moderatorKeys.accounts.list(filterKey),
    queryFn: () => {
      const query = new URLSearchParams();
      query.set("page", String(params.page ?? 1));
      query.set("per_page", String(params.perPage ?? 20));
      if (params.q) query.set("q", params.q);
      if (params.status) query.set("status", params.status);
      if (params.roles) query.set("roles", params.roles);
      return apiFetch(`/api/v1/admin/users?${query.toString()}`, {
        schema: UserPageSchema,
      });
    },
    staleTime: 15_000,
  });
}
