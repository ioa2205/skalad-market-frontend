"use client";

import { Check, MessageSquare, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { LoadingButton } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormField, FormFieldControl } from "@/components/ui/form-field";
import { Textarea } from "@/components/ui/textarea";
import type { LeadResponse } from "@/lib/api/schemas/lead";

import { useUpdateLeadStatus } from "../../api/seller-leads.client";

import { LeadStatusBadge } from "./LeadStatusBadge";

export interface SellerLeadRowProps {
  lead: LeadResponse;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0]![0] ?? "";
  const second = parts[1]?.[0] ?? "";
  return (first + second).toUpperCase();
}

const REJECT_REASON_MIN = 3;
const REJECT_REASON_MAX = 280;

export function SellerLeadRow({ lead }: SellerLeadRowProps) {
  const t = useTranslations("seller.dashboard.leads.row");
  const tStub = useTranslations("seller.dashboard.leads");
  const updateMutation = useUpdateLeadStatus();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [reasonError, setReasonError] = useState<string | null>(null);

  const isOpen = lead.status === "NEW" || lead.status === "VIEWED";
  const itemSummary =
    lead.items.length > 0
      ? `${lead.items[0]!.productNameSnapshot} · ${lead.items[0]!.quantity}`
      : tStub("itemSummaryEmpty");

  async function handleAccept(): Promise<void> {
    try {
      await updateMutation.mutateAsync({ id: lead.id, status: "CONTACTED" });
      toast.success(t("acceptedToast"));
    } catch {
      // Error surfaced inline below.
    }
  }

  async function handleConfirmReject(): Promise<void> {
    const trimmed = rejectReason.trim();
    if (trimmed.length < REJECT_REASON_MIN) {
      setReasonError(t("reasonMinError", { min: REJECT_REASON_MIN }));
      return;
    }
    if (trimmed.length > REJECT_REASON_MAX) {
      setReasonError(t("reasonMaxError", { max: REJECT_REASON_MAX }));
      return;
    }
    setReasonError(null);
    try {
      await updateMutation.mutateAsync({
        id: lead.id,
        status: "CLOSED",
        closeReason: trimmed,
      });
      toast.success(t("rejectedToast"));
      setRejectOpen(false);
      setRejectReason("");
    } catch {
      // ApiError surfaced inline.
    }
  }

  const error = updateMutation.isError ? updateMutation.error : null;

  return (
    <li className="flex flex-col gap-3 rounded-lg border border-border bg-bg-elevated p-4 md:flex-row md:items-center">
      <span
        aria-hidden="true"
        className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary-600 text-body-sm font-semibold text-fg-on-primary"
      >
        {getInitials(lead.contactName)}
      </span>
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-body-sm font-semibold text-fg">
            {lead.contactName}
          </span>
          <LeadStatusBadge status={lead.status} />
        </div>
        <p className="text-caption text-fg-muted">{itemSummary}</p>
        <p className="text-caption text-fg-muted">{lead.contactPhone}</p>
        {error ? (
          <p
            role="alert"
            className="rounded-md border border-danger/40 bg-danger-soft px-2 py-1 text-caption text-danger-soft-foreground"
          >
            {t("updateError")}
            {error.correlationId ? ` · ${error.correlationId}` : ""}
          </p>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {isOpen ? (
          <>
            <LoadingButton
              type="button"
              size="sm"
              pending={
                updateMutation.isPending && updateMutation.variables?.status === "CONTACTED"
              }
              pendingLabel={t("acceptPending")}
              onClick={handleAccept}
              className="bg-success text-success-foreground hover:bg-success/90"
            >
              <Check aria-hidden="true" className="size-4" />
              {t("accept")}
            </LoadingButton>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={() => setRejectOpen(true)}
            >
              <X aria-hidden="true" className="size-4" />
              {t("reject")}
            </Button>
          </>
        ) : null}
        <Button asChild variant="secondary" size="sm">
          <a href={`/seller/messages?leadId=${lead.id}`} className="flex items-center gap-2">
            <MessageSquare aria-hidden="true" className="size-4" />
            {t("write")}
          </a>
        </Button>
      </div>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("rejectTitle")}</DialogTitle>
            <DialogDescription>{t("rejectDescription")}</DialogDescription>
          </DialogHeader>
          <FormField
            label={t("reasonLabel")}
            required
            error={reasonError ?? undefined}
          >
            <FormFieldControl>
              <Textarea
                rows={3}
                value={rejectReason}
                onChange={(event) => setRejectReason(event.target.value)}
                maxLength={REJECT_REASON_MAX}
                placeholder={t("reasonPlaceholder")}
              />
            </FormFieldControl>
          </FormField>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setRejectOpen(false)}
              disabled={updateMutation.isPending}
            >
              {t("cancel")}
            </Button>
            <LoadingButton
              type="button"
              variant="danger"
              pending={updateMutation.isPending}
              pendingLabel={t("rejectPending")}
              onClick={handleConfirmReject}
            >
              {t("rejectConfirm")}
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </li>
  );
}
