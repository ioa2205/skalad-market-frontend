"use client";

import {
  AlertTriangle,
  Ban,
  Building2,
  MessageSquare,
  Package,
} from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { ErrorState } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api/errors";
import type { TargetType } from "@/lib/api/schemas/enums";
import type { ReportListItem } from "@/lib/api/schemas/report";

import {
  blockCompany,
  blockProduct,
  useDismissReport,
} from "../api/moderator.client";
import { useReportDetail, useReportsList } from "../api/queries.client";

import { ModeratorActionButton } from "./ModeratorActionButton";

const TARGET_ICON: Record<TargetType, typeof Package> = {
  PRODUCT: Package,
  COMPANY: Building2,
  CHAT: MessageSquare,
};

export function ReportsTab() {
  const t = useTranslations("moderator.reports");
  const tLoad = useTranslations("moderator.loadError");
  const { data, isPending, isError, error } = useReportsList({ status: "NEW" });

  return (
    <section className="rounded-mod border border-mod-border bg-bg-elevated px-4 py-5">
      <h2 className="mb-5 text-[22px] font-bold text-chrome-strong">
        {t("queueTitle")}
      </h2>
      {isPending ? (
        <div className="flex flex-col gap-5">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-[135px] w-full rounded-mod" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          title={tLoad("title")}
          description={tLoad("description")}
          correlationId={
            (error as { correlationId?: string } | null)?.correlationId
          }
          correlationIdLabel={tLoad("correlationLabel")}
          action={
            <Button onClick={() => location.reload()}>{tLoad("retry")}</Button>
          }
        />
      ) : (data?.content.length ?? 0) === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-12 text-center text-fg-muted">
          <span className="flex size-12 items-center justify-center rounded-full bg-bg-muted text-fg-muted">
            <AlertTriangle className="size-5" aria-hidden="true" />
          </span>
          <p className="text-body font-medium text-fg">{t("empty.title")}</p>
          <p className="text-body-sm">{t("empty.description")}</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-5">
          {data!.content.map((report) => (
            <li key={report.id}>
              <ReportRow report={report} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ReportRow({ report }: { report: ReportListItem }) {
  const t = useTranslations("moderator.reports");
  const tCommon = useTranslations("moderator.common");
  const format = useFormatter();
  const dismiss = useDismissReport();
  const [blocking, setBlocking] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const Icon = TARGET_ICON[report.targetType];
  const detail = useReportDetail(report.id, expanded);
  const created = formatDate(report.createdDate, format);

  const onDismiss = async () => {
    try {
      await dismiss.mutateAsync({
        id: report.id,
        resolutionNote: "Dismissed by moderator",
      });
      toast.success(t("rejectSuccess"));
    } catch (error) {
      reportError(error, tCommon);
    }
  };

  // Warn has no backend endpoint yet — keep the button styled like the figma
  // and surface the gap honestly via a toast instead of a disabled state.
  const onWarn = () => {
    toast.info(t("warnComingSoon"), { description: t("warnComingSoonBody") });
  };

  const onBlock = async () => {
    if (report.targetType === "CHAT") {
      toast.info(t("blockChatUnavailable"));
      return;
    }
    setBlocking(true);
    try {
      if (report.targetType === "PRODUCT") {
        await blockProduct(report.targetId, "Blocked from report");
      } else {
        await blockCompany(report.targetId, "Blocked from report");
      }
      await dismiss.mutateAsync({
        id: report.id,
        resolutionNote: "Target blocked",
      });
      toast.success(t("resolveSuccess"));
    } catch (error) {
      reportError(error, tCommon);
    } finally {
      setBlocking(false);
    }
  };

  const busy = dismiss.isPending || blocking;

  return (
    <article className="flex min-h-[135px] justify-between gap-3 rounded-mod border border-mod-border bg-bg-elevated p-3">
      <div className="flex min-w-0 gap-3">
        <div
          className="flex size-[30px] shrink-0 items-center justify-center self-center rounded-mod-sm bg-kpi-indigo text-white"
          aria-hidden="true"
        >
          <Icon className="size-4" />
        </div>
        <div className="flex min-w-0 flex-col gap-1">
          <p className="truncate text-body-sm font-bold text-chrome-strong">
            {t(`targetType.${report.targetType}`)} #{report.targetId}
          </p>
          {created ? (
            <span className="text-caption text-mod-meta">{created}</span>
          ) : null}
          <div>
            <span className="inline-flex h-[22px] items-center rounded-mod-xs bg-mod-badge-red/20 px-2 text-caption font-medium text-mod-btn-red">
              {t(`reasonCode.${report.reasonCode}`)}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="w-fit text-caption text-mod-meta underline-offset-2 hover:text-fg hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            {expanded ? t("detailsCollapse") : t("detailsToggle")}
          </button>
          {expanded ? (
            <div className="mt-1 w-full rounded-mod-xs bg-mod-desc-box px-3 py-2 text-body-sm text-fg">
              {detail.isPending ? (
                <span className="text-mod-meta">{tCommon("loading")}</span>
              ) : detail.isError ? (
                <span className="text-mod-meta">{t("detailError")}</span>
              ) : detail.data?.comment?.trim() ? (
                detail.data.comment
              ) : (
                <span className="text-mod-meta">{t("noComment")}</span>
              )}
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-[13px]">
        <ModeratorActionButton
          tone="gray"
          className="w-[151px]"
          onClick={onDismiss}
          pending={dismiss.isPending}
          disabled={busy}
        >
          {t("rejectAction")}
        </ModeratorActionButton>
        <ModeratorActionButton
          tone="orange"
          className="w-[150px]"
          onClick={onWarn}
          disabled={busy}
        >
          <AlertTriangle aria-hidden="true" />
          {t("warnAction")}
        </ModeratorActionButton>
        <ModeratorActionButton
          tone="red"
          className="w-[155px]"
          onClick={onBlock}
          pending={blocking}
          disabled={busy}
        >
          <Ban aria-hidden="true" />
          {t("blockAction")}
        </ModeratorActionButton>
      </div>
    </article>
  );
}

function reportError(
  error: unknown,
  tCommon: ReturnType<typeof useTranslations>,
) {
  const apiError = error instanceof ApiError ? error : null;
  toast.error(tCommon("actionError"), {
    ...(apiError?.correlationId ? { description: apiError.correlationId } : {}),
  });
}

function formatDate(
  iso: string,
  format: ReturnType<typeof useFormatter>,
): string | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return format.dateTime(d, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
