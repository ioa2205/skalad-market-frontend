"use client";

import { Check, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { ApiError } from "@/lib/api/errors";
import type { CompanyResponseDTO } from "@/lib/api/schemas/company";
import { cn } from "@/lib/utils/cn";

import { useRejectCompany, useVerifyCompany } from "../api/moderator.client";

import { ModeratorActionButton } from "./ModeratorActionButton";

export interface CompanyQueueCardProps {
  company: CompanyResponseDTO;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

/**
 * One company in the verification queue — Figma-exact (moderator_dashboard_3):
 * 30×30 avatar, name + sub-line + document chips on the left, status pill
 * pinned top-right and the accept/reject buttons pinned bottom-right.
 *
 * The "ready vs issues" pill is derived from the backend's data (the API
 * returns no separate flag): a blocked company, or one with no description,
 * is treated as having issues — matching the figma's red "Проблемы" pill.
 */
export function CompanyQueueCard({ company }: CompanyQueueCardProps) {
  const t = useTranslations("moderator.companies");
  const tCommon = useTranslations("moderator.common");
  const verify = useVerifyCompany();
  const reject = useRejectCompany();

  const hasIssues =
    Boolean(company.isBlocked) || (company.description ?? "").trim() === "";
  const subline = company.shortDescription ?? company.address ?? "";
  const busy = verify.isPending || reject.isPending;

  const onAccept = async () => {
    try {
      await verify.mutateAsync({ id: company.id });
      toast.success(t("approveSuccess"));
    } catch (error) {
      handleError(error, tCommon);
    }
  };

  const onReject = async () => {
    try {
      await reject.mutateAsync({ id: company.id });
      toast.success(t("rejectSuccess"));
    } catch (error) {
      handleError(error, tCommon);
    }
  };

  return (
    <article className="flex min-h-[115px] justify-between gap-3 rounded-mod border border-mod-border bg-bg-elevated p-3">
      <div className="flex min-w-0 items-center gap-3">
        <div
          className="flex size-[30px] shrink-0 items-center justify-center overflow-hidden rounded-mod-sm bg-primary-600 text-[11px] font-semibold text-fg-on-primary"
          aria-hidden="true"
        >
          {company.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={company.logoUrl}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            initials(company.name)
          )}
        </div>
        <div className="flex min-w-0 flex-col gap-1">
          <p className="truncate text-body-sm font-bold text-chrome-strong">
            {company.name}
          </p>
          {subline ? (
            <p className="line-clamp-1 text-caption text-mod-meta">{subline}</p>
          ) : null}
          <p className="text-caption text-mod-meta">{t("documentsLabel")}</p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex h-[22px] items-center rounded-mod-xs bg-mod-badge-blue/20 px-2 text-caption text-mod-badge-blue-fg">
              {t("documents.registration")}
            </span>
            <span
              className={cn(
                "inline-flex h-[22px] items-center rounded-mod-xs px-2 text-caption",
                hasIssues
                  ? "bg-mod-badge-red/20 text-mod-badge-red"
                  : "bg-mod-badge-blue/20 text-mod-badge-blue-fg",
              )}
            >
              {hasIssues
                ? t("documents.charterMissing")
                : t("documents.charter")}
            </span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end justify-between gap-3">
        <span
          className={cn(
            "inline-flex h-[22px] items-center rounded-mod-xs px-2 text-caption font-medium",
            hasIssues
              ? "bg-mod-badge-red/20 text-mod-badge-red"
              : "bg-mod-badge-green/20 text-mod-badge-green",
          )}
        >
          {hasIssues ? t("statusIssues") : t("statusReady")}
        </span>
        <div className="flex items-center gap-[13px]">
          <ModeratorActionButton
            tone="green"
            className="w-[111px]"
            onClick={onAccept}
            pending={verify.isPending}
            disabled={busy}
          >
            <Check aria-hidden="true" />
            {tCommon("accept")}
          </ModeratorActionButton>
          <ModeratorActionButton
            tone="red"
            className="w-[126px]"
            onClick={onReject}
            pending={reject.isPending}
            disabled={busy}
          >
            <X aria-hidden="true" />
            {tCommon("reject")}
          </ModeratorActionButton>
        </div>
      </div>
    </article>
  );
}

function handleError(
  error: unknown,
  tCommon: ReturnType<typeof useTranslations>,
) {
  const apiError = error instanceof ApiError ? error : null;
  toast.error(tCommon("actionError"), {
    ...(apiError?.correlationId ? { description: apiError.correlationId } : {}),
  });
}
