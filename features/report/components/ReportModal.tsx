"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { ReasonCode, TargetType } from "@/lib/api/schemas/enums";

import { useCreateReport } from "../api/report.client";
import {
  REPORT_FORM_DEFAULTS,
  REPORT_REASON_CODES,
  ReportFormSchema,
  type ReportFormValues,
} from "../schemas/form";

interface ReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetType: TargetType;
  targetId: number;
  /**
   * Optional human-readable label for the thing being reported (product name,
   * company name, chat partner). Rendered in the modal description so the user
   * confirms what they're reporting.
   */
  targetLabel?: string;
}

export function ReportModal({
  open,
  onOpenChange,
  targetType,
  targetId,
  targetLabel,
}: ReportModalProps) {
  const t = useTranslations("report");
  const tValidation = useTranslations("report.validation");
  const tCommon = useTranslations("common");

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(ReportFormSchema),
    defaultValues: REPORT_FORM_DEFAULTS,
    mode: "onTouched",
  });

  const mutation = useCreateReport();

  useEffect(() => {
    if (open) {
      form.reset(REPORT_FORM_DEFAULTS);
      mutation.reset();
    }
    // intentionally only reacts to `open` flips, not form/mutation identity
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onSubmit = form.handleSubmit(async (values) => {
    const reasonCode = values.reasonCode as ReasonCode;
    try {
      await mutation.mutateAsync({
        targetType,
        targetId,
        reasonCode,
        ...(values.comment ? { comment: values.comment } : {}),
      });
      toast.success(t("toast.successTitle"), {
        description: t("toast.successBody"),
      });
      onOpenChange(false);
    } catch {
      // banner below surfaces the error + correlation id
    }
  });

  const reasonError = form.formState.errors.reasonCode?.message;
  const commentError = form.formState.errors.comment?.message;
  const apiError = mutation.error ?? null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent closeLabel={tCommon("close")}>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {targetLabel
              ? t("descriptionWithLabel", {
                  label: targetLabel,
                  target: t(`target.${targetType}`),
                })
              : t("descriptionGeneric", { target: t(`target.${targetType}`) })}
          </DialogDescription>
        </DialogHeader>

        <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
          <FormField
            label={t("reasonLabel")}
            required
            error={reasonError ? tValidation(reasonError) : undefined}
          >
            <Controller
              control={form.control}
              name="reasonCode"
              render={({ field }) => (
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  aria-label={t("reasonLabel")}
                  aria-invalid={Boolean(reasonError) || undefined}
                  className="gap-3"
                >
                  {REPORT_REASON_CODES.map((code) => {
                    const id = `report-reason-${code.toLowerCase()}`;
                    return (
                      <label
                        key={code}
                        htmlFor={id}
                        className="flex cursor-pointer items-start gap-3 rounded-md border border-border bg-bg-elevated p-3 transition-colors duration-fast ease-standard hover:bg-bg-muted"
                      >
                        <RadioGroupItem id={id} value={code} className="mt-0.5" />
                        <span className="flex flex-col">
                          <span className="text-body font-medium text-fg">
                            {t(`reason.${code}.title`)}
                          </span>
                          <span className="text-caption text-fg-muted">
                            {t(`reason.${code}.body`)}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </RadioGroup>
              )}
            />
          </FormField>

          <FormField
            label={t("commentLabel")}
            description={t("commentHint")}
            error={
              commentError
                ? tValidation(commentError, { max: 500 })
                : undefined
            }
          >
            <FormFieldControl>
              <Textarea
                rows={4}
                maxLength={500}
                placeholder={t("commentPlaceholder")}
                {...form.register("comment")}
              />
            </FormFieldControl>
          </FormField>

          {apiError ? (
            <div
              role="alert"
              className="rounded-md border border-danger/40 bg-danger-soft px-3 py-2 text-body-sm text-danger-soft-foreground"
            >
              {t("submitError")}
              {apiError.correlationId ? (
                <p className="mt-0.5 text-caption text-fg-muted">
                  {t("correlationId", { id: apiError.correlationId })}
                </p>
              ) : null}
            </div>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
            >
              {tCommon("cancel")}
            </Button>
            <LoadingButton
              type="submit"
              pending={mutation.isPending}
              pendingLabel={t("submitPending")}
            >
              {t("submit")}
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
