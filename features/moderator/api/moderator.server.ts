import "server-only";

import { z } from "zod";

import { serverFetch } from "@/lib/api/server";
import { springPageSchema } from "@/lib/api/schemas/common";
import { CompanyResponseDTO } from "@/lib/api/schemas/company";
import { ProductResponse } from "@/lib/api/schemas/product";
import { ReportListItem } from "@/lib/api/schemas/report";
import { UsersResponse } from "@/lib/api/schemas/user";

/**
 * Server-side fetchers for the moderator dashboard. Every call is `no-store`
 * because moderation queues must reflect the latest pending items — caching a
 * queue would mean the moderator approves stale entries.
 */

const ProductQueueSchema = z.array(ProductResponse);
const CompanyQueueSchema = z.array(CompanyResponseDTO);
const ReportPageSchema = springPageSchema(ReportListItem);
const UserPageSchema = springPageSchema(UsersResponse);

export async function fetchProductsQueue() {
  return serverFetch("/api/v1/admin/products/moderation-queue", {
    schema: ProductQueueSchema,
    cache: "no-store",
  });
}

export async function fetchCompaniesQueue() {
  return serverFetch("/api/v1/admin/companies/moderation-queue", {
    schema: CompanyQueueSchema,
    cache: "no-store",
  });
}

export interface ReportsListParams {
  status?: "NEW" | "RESOLVED" | "REJECTED";
  page?: number;
  size?: number;
}

export async function fetchReportsList(params: ReportsListParams = {}) {
  const query = new URLSearchParams();
  query.set("page", String(params.page ?? 1));
  query.set("size", String(params.size ?? 20));
  if (params.status) query.set("status", params.status);
  return serverFetch(`/api/v1/admin/reports?${query.toString()}`, {
    schema: ReportPageSchema,
    cache: "no-store",
  });
}

export interface AccountsListParams {
  q?: string;
  status?: "ACTIVE" | "IN_REGISTRATION" | "BLOCK";
  roles?: string;
  page?: number;
  perPage?: number;
}

export async function fetchAccountsList(params: AccountsListParams = {}) {
  const query = new URLSearchParams();
  query.set("page", String(params.page ?? 1));
  query.set("per_page", String(params.perPage ?? 20));
  if (params.q) query.set("q", params.q);
  if (params.status) query.set("status", params.status);
  if (params.roles) query.set("roles", params.roles);
  return serverFetch(`/api/v1/admin/users?${query.toString()}`, {
    schema: UserPageSchema,
    cache: "no-store",
  });
}

/**
 * Single aggregate call for the Overview tab. Returns counts only — the
 * server-rendered KPI cards don't need the full lists, so we drop the items
 * after counting them. Each upstream call is wrapped in `Promise.allSettled`
 * so a partial failure (e.g. reports service down) still shows the cards we
 * could load.
 */
export interface OverviewCounts {
  productsPending: number | null;
  companiesPending: number | null;
  reportsNew: number | null;
  recentProducts: import("@/lib/api/schemas/product").ProductResponse[];
  recentCompanies: import("@/lib/api/schemas/company").CompanyResponseDTO[];
}

export async function fetchOverview(): Promise<OverviewCounts> {
  const [products, companies, reports] = await Promise.allSettled([
    fetchProductsQueue(),
    fetchCompaniesQueue(),
    fetchReportsList({ status: "NEW", size: 1 }),
  ]);

  return {
    productsPending:
      products.status === "fulfilled" ? products.value.length : null,
    companiesPending:
      companies.status === "fulfilled" ? companies.value.length : null,
    reportsNew:
      reports.status === "fulfilled" ? reports.value.totalElements : null,
    recentProducts:
      products.status === "fulfilled" ? products.value.slice(0, 3) : [],
    recentCompanies:
      companies.status === "fulfilled" ? companies.value.slice(0, 3) : [],
  };
}
