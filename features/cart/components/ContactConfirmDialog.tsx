"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { LoadingButton } from "@/components/feedback";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormField, FormFieldControl } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import type { CartContactInfo } from "../api/cart.client";

export interface ContactConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaults: CartContactInfo;
  submitting?: boolean;
  onConfirm: (contact: CartContactInfo) => void;
}

interface FieldErrors {
  contactName?: string;
  contactPhone?: string;
}

/**
 * Cart Figma has no contact form. `LeadCreateRequest` requires contactName +
 * contactPhone, so we surface a small confirm-and-edit dialog at submit time:
 * fields prefill from the user profile (or session username), the user
 * verifies/edits, then we fan out per-company.
 */
export function ContactConfirmDialog({
  open,
  onOpenChange,
  defaults,
  submitting,
  onConfirm,
}: ContactConfirmDialogProps) {
  const t = useTranslations("cart.contact");
  const tCommon = useTranslations("common");
  const tValidation = useTranslations("auth.validation");

  const [name, setName] = useState(defaults.contactName);
  const [phone, setPhone] = useState(defaults.contactPhone);
  const [comment, setComment] = useState(defaults.comment ?? "");
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (open) {
      setName(defaults.contactName);
      setPhone(defaults.contactPhone);
      setComment(defaults.comment ?? "");
      setErrors({});
    }
  }, [open, defaults.contactName, defaults.contactPhone, defaults.comment]);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const next: FieldErrors = {};
    if (!name.trim()) next.contactName = tValidation("nameRequired");
    if (!phone.trim()) next.contactPhone = tValidation("phoneInvalid");
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onConfirm({
      contactName: name.trim(),
      contactPhone: phone.trim(),
      ...(comment.trim() ? { comment: comment.trim() } : {}),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent closeLabel={tCommon("close")}>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
          <FormField label={t("nameLabel")} required error={errors.contactName}>
            <FormFieldControl>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                placeholder={t("namePlaceholder")}
              />
            </FormFieldControl>
          </FormField>

          <FormField label={t("phoneLabel")} required error={errors.contactPhone}>
            <FormFieldControl>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
                inputMode="tel"
                placeholder={t("phonePlaceholder")}
              />
            </FormFieldControl>
          </FormField>

          <FormField label={t("commentLabel")} description={t("commentHint")}>
            <FormFieldControl>
              <Textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t("commentPlaceholder")}
              />
            </FormFieldControl>
          </FormField>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              {tCommon("cancel")}
            </Button>
            <LoadingButton
              type="submit"
              variant="primary"
              pending={submitting}
              pendingLabel={t("submitting")}
            >
              {t("submit")}
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
