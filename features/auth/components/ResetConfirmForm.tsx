"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { LoadingButton } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import { FormField, FormFieldControl } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { toCopyKey } from "@/lib/i18n/serverErrors";

import { useResetConfirm } from "../hooks/useResetConfirm";
import {
  ResetConfirmFormSchema,
  type ResetConfirmFormValues,
} from "../schemas/forms";

export function ResetConfirmForm() {
  const t = useTranslations("auth.resetConfirm");
  const tLogin = useTranslations("auth.login");
  const tValidation = useTranslations("auth.validation");
  const tError = useTranslations();
  const tCorrelation = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") ?? "";

  const form = useForm<ResetConfirmFormValues>({
    resolver: zodResolver(ResetConfirmFormSchema),
    defaultValues: {
      username: emailParam,
      code: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onTouched",
  });

  const mutation = useResetConfirm();

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await mutation.mutateAsync({
        username: values.username,
        confirmCode: values.code,
        newPassword: values.newPassword,
      });
      toast.success(t("successToast"));
      router.push("/login");
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

      {!emailParam ? (
        <FormField
          label={tLogin("emailLabel")}
          error={vmsg(form.formState.errors.username?.message)}
        >
          <FormFieldControl>
            <Input
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder={tLogin("emailPlaceholder")}
              {...form.register("username")}
            />
          </FormFieldControl>
        </FormField>
      ) : (
        <input type="hidden" {...form.register("username")} />
      )}

      <FormField
        label={t("codeLabel")}
        error={vmsg(form.formState.errors.code?.message)}
      >
        <FormFieldControl>
          <Input
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="••••••"
            {...form.register("code")}
          />
        </FormFieldControl>
      </FormField>

      <FormField
        label={t("newPasswordLabel")}
        error={vmsg(form.formState.errors.newPassword?.message)}
      >
        <FormFieldControl>
          <PasswordInput
            autoComplete="new-password"
            placeholder={t("newPasswordPlaceholder")}
            showLabel={tLogin("passwordShow")}
            hideLabel={tLogin("passwordHide")}
            {...form.register("newPassword")}
          />
        </FormFieldControl>
      </FormField>

      <FormField
        label={t("newPasswordConfirmLabel")}
        error={vmsg(form.formState.errors.confirmPassword?.message)}
      >
        <FormFieldControl>
          <PasswordInput
            autoComplete="new-password"
            placeholder={t("newPasswordConfirmPlaceholder")}
            showLabel={tLogin("passwordShow")}
            hideLabel={tLogin("passwordHide")}
            {...form.register("confirmPassword")}
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
        <Link href="/login">{tLogin("forgotPassword")}</Link>
      </Button>
    </form>
  );
}
