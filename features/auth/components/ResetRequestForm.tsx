"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { LoadingButton } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import { FormField, FormFieldControl } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { toCopyKey } from "@/lib/i18n/serverErrors";

import { useResetRequest } from "../hooks/useResetRequest";
import {
  ResetRequestFormSchema,
  type ResetRequestFormValues,
} from "../schemas/forms";

export function ResetRequestForm() {
  const t = useTranslations("auth.reset");
  const tValidation = useTranslations("auth.validation");
  const tError = useTranslations();
  const tCorrelation = useTranslations("auth");
  const tCommon = useTranslations("common");
  const router = useRouter();

  const form = useForm<ResetRequestFormValues>({
    resolver: zodResolver(ResetRequestFormSchema),
    defaultValues: { email: "" },
    mode: "onTouched",
  });

  const mutation = useResetRequest();

  const onSubmit = form.handleSubmit(async (values) => {
    const email = values.email.trim();
    try {
      await mutation.mutateAsync(email);
      toast.success(t("successToast", { email }));
      router.push(`/reset/confirm?email=${encodeURIComponent(email)}`);
    } catch {
      // banner below
    }
  });

  const error = mutation.error ?? null;
  const errorCopyKey = error ? toCopyKey(error.code) : null;
  const errorMessage = errorCopyKey ? tError(errorCopyKey) : null;
  const correlationId = error?.correlationId;

  function vmsg(key: string | undefined): string | undefined {
    if (!key) return undefined;
    return tValidation(key.replace(/^auth\.validation\./, ""));
  }

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="space-y-2">
        <h1 className="text-h3 text-fg">{t("title")}</h1>
        <p className="text-body-sm text-fg-muted">{t("body")}</p>
      </div>

      <FormField
        label={t("emailLabel")}
        error={vmsg(form.formState.errors.email?.message)}
      >
        <FormFieldControl>
          <Input
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder={t("emailPlaceholder")}
            {...form.register("email")}
          />
        </FormFieldControl>
      </FormField>

      {errorMessage ? (
        <div
          role="alert"
          className="rounded-md border border-danger/40 bg-danger-soft px-3 py-2 text-body-sm text-danger-soft-foreground"
        >
          {errorMessage}
          {correlationId ? (
            <p className="mt-0.5 text-caption text-fg-muted">
              {tCorrelation("correlationId", { id: correlationId })}
            </p>
          ) : null}
        </div>
      ) : null}

      <LoadingButton
        type="submit"
        size="lg"
        pending={mutation.isPending}
        pendingLabel={t("submitPending")}
        className="w-full"
      >
        {t("submit")}
      </LoadingButton>

      <Button asChild variant="ghost" size="sm" className="self-center">
        <Link href="/login">{t("backToLogin")}</Link>
      </Button>

      <span className="sr-only">{tCommon("loading")}</span>
    </form>
  );
}
