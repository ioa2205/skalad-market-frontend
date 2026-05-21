"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { StatusBadge, type LeadStatus } from "@/components/badges/status-badge";
import { ErrorState } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/sonner";
import { ApiError } from "@/lib/api/errors";
import type { LeadResponse } from "@/lib/api/schemas/lead";
import { REQUEST_ID_HEADER } from "@/lib/http/requestId";

import { useCancelLead } from "../api/leads.client";
import { leadsKeys } from "../api/queryKeys";

import { LeadCancelDialog } from "./LeadCancelDialog";

export interface LeadDetailDrawerProps {
  leadId: number | null;
  /** Pre-seeded record from the list — used to render instantly while detail refetches. */
  initial?: LeadResponse;
  onClose: () => void;
}

const CANCELABLE: LeadStatus[] = ["NEW", "VIEWED"];

interface ProxyEnvelope<T> {
  success: boolean;
  data?: T;
  message?: string;
}

async function fetchLeadDetail(id: number): Promise<LeadResponse> {
  const response = await fetch(`/api/proxy/api/v1/leads/${id}`, {
    credentials: "include",
    headers: { accept: "application/json" },
  });
  const correlationId = response.headers.get(REQUEST_ID_HEADER) ?? undefined;
  let json: ProxyEnvelope<LeadResponse>;
  try {
    json = (await response.json()) as ProxyEnvelope<LeadResponse>;
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
      code: json.message ?? "lead.detail.failed",
      message: json.message ?? "lead.detail.failed",
      status: response.status,
      correlationId,
    });
  }
  return json.data;
}

export function LeadDetailDrawer({ leadId, initial, onClose }: LeadDetailDrawerProps) {
  const t = useTranslations("leads.detail");
  const tCommon = useTranslations("common");
  const tCancel = useTranslations("leads.cancel");
  const tStatus = useTranslations("status.lead");
  const tSource = useTranslations("leads.source");
  const tError = useTranslations("leads.detail.error");
  const queryClient = useQueryClient();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const cancelMutation = useCancelLead();

  const open = leadId !== null;

  const detailQuery = useQuery<LeadResponse, ApiError>({
    queryKey: leadId !== null ? leadsKeys.detail(leadId) : leadsKeys.detail(-1),
    queryFn: () => fetchLeadDetail(leadId as number),
    enabled: open,
    initialData: initial && initial.id === leadId ? initial : undefined,
    retry: false,
    staleTime: 10_000,
  });

  const lead = detailQuery.data;
  const error = detailQuery.error;

  const handleConfirm = () => {
    if (leadId === null) return;
    cancelMutation.mutate(
      { id: leadId, previousStatus: lead?.status as LeadStatus | undefined },
      {
        onSuccess: () => {
          toast.success(tCancel("successToast"));
          setConfirmOpen(false);
          // Optimistically refetch this detail and the list cache.
          queryClient.invalidateQueries({ queryKey: leadsKeys.all });
          onClose();
        },
        onError: (err) => {
          toast.error(tCancel("errorToast"));
          // Surface correlation id inline via ErrorState in the drawer body.
          if (err.correlationId) {
            toast.error(tError("correlationLabel") + " " + err.correlationId);
          }
        },
      },
    );
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next && !cancelMutation.isPending) onClose();
        }}
      >
        <DialogContent
          closeLabel={tCommon("close")}
          className="max-w-2xl"
          onPointerDownOutside={(event) => {
            if (cancelMutation.isPending) event.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {lead ? t("title", { id: lead.id }) : t("titleLoading")}
            </DialogTitle>
            {lead ? (
              <DialogDescription>
                <span className="inline-flex items-center gap-2">
                  <StatusBadge
                    kind="lead"
                    status={lead.status as LeadStatus}
                    label={tStatus(lead.status)}
                  />
                  <span>{tSource(lead.source)}</span>
                </span>
              </DialogDescription>
            ) : null}
          </DialogHeader>

          {error ? (
            <ErrorState
              title={tError("title")}
              description={tError("description")}
              correlationId={error.correlationId}
              correlationIdLabel={tError("correlationLabel")}
            />
          ) : !lead ? (
            <div className="flex flex-col gap-3" aria-busy="true">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-6 w-72" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label={t("contactName")} value={lead.contactName} />
                <Field label={t("contactPhone")} value={lead.contactPhone} mono />
                {lead.comment ? (
                  <Field label={t("comment")} value={lead.comment} className="sm:col-span-2" />
                ) : null}
                {lead.closeReason ? (
                  <Field
                    label={t("closeReason")}
                    value={lead.closeReason}
                    className="sm:col-span-2"
                  />
                ) : null}
              </dl>

              <section className="flex flex-col gap-2">
                <h4 className="text-body font-semibold text-fg">{t("itemsHeading")}</h4>
                <ul className="flex flex-col divide-y divide-border rounded-md border border-border">
                  {lead.items.map((item) => (
                    <li
                      key={item.productId}
                      className="flex items-center justify-between gap-3 px-4 py-3"
                    >
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-body text-fg">
                          {item.productNameSnapshot}
                        </span>
                        <span className="text-caption text-fg-muted">
                          {t("qtyLabel", { qty: item.quantity })}
                        </span>
                      </div>
                      <span className="font-mono text-body-sm text-fg-muted">
                        {String(item.priceSnapshot)}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              <div className="flex flex-wrap items-center justify-end gap-2">
                <Button type="button" variant="ghost" onClick={onClose}>
                  {tCommon("close")}
                </Button>
                {CANCELABLE.includes(lead.status as LeadStatus) ? (
                  <Button
                    type="button"
                    variant="danger-soft"
                    onClick={() => setConfirmOpen(true)}
                    disabled={cancelMutation.isPending}
                  >
                    {tCancel("button")}
                  </Button>
                ) : null}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {lead ? (
        <LeadCancelDialog
          open={confirmOpen}
          onOpenChange={(next) => {
            if (!cancelMutation.isPending) setConfirmOpen(next);
          }}
          leadId={lead.id}
          pending={cancelMutation.isPending}
          onConfirm={handleConfirm}
        />
      ) : null}
    </>
  );
}

function Field({
  label,
  value,
  mono,
  className,
}: {
  label: string;
  value: string;
  mono?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-caption uppercase text-fg-subtle">{label}</dt>
      <dd className={mono ? "font-mono text-body text-fg" : "text-body text-fg"}>{value}</dd>
    </div>
  );
}
