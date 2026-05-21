"use client";

import { useTranslations } from "next-intl";

import { LoadingButton } from "@/components/feedback";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface LeadCancelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: number;
  pending?: boolean;
  onConfirm: () => void;
}

export function LeadCancelDialog({
  open,
  onOpenChange,
  leadId,
  pending,
  onConfirm,
}: LeadCancelDialogProps) {
  const t = useTranslations("leads.cancel");
  const tCommon = useTranslations("common");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent closeLabel={tCommon("close")}>
        <DialogHeader>
          <DialogTitle>{t("confirmTitle")}</DialogTitle>
          <DialogDescription>
            {t("confirmBody", { id: leadId })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            {t("cancelCta")}
          </Button>
          <LoadingButton
            type="button"
            variant="danger"
            pending={pending}
            pendingLabel={t("confirmPending")}
            onClick={onConfirm}
          >
            {t("confirmCta")}
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
