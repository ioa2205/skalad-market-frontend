"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Mail, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Controller, useForm } from "react-hook-form";

import { LoadingButton } from "@/components/feedback";
import { FormField, FormFieldControl } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import {
  SegmentedTabs,
  SegmentedTabsList,
  SegmentedTabsTrigger,
} from "@/components/ui/segmented-tabs";
import { Separator } from "@/components/ui/separator";
import { toCopyKey } from "@/lib/i18n/serverErrors";
import { cn } from "@/lib/utils/cn";

import { useLogin } from "../hooks/useLogin";
import { LoginFormSchema, type LoginFormValues } from "../schemas/forms";
import { SsoButton } from "./SsoButton";

export function LoginForm() {
  const t = useTranslations("auth.login");
  const tValidation = useTranslations("auth.validation");
  const tError = useTranslations();
  const tCorrelation = useTranslations("auth");

  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: { method: "PHONE", username: "", password: "" },
    mode: "onTouched",
  });

  const mutation = useLogin();

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const result = await mutation.mutateAsync({
        username: values.username.trim(),
        password: values.password,
      });
      const target = next && next.startsWith("/") ? next : result.redirectTo;
      router.push(target);
      router.refresh();
    } catch {
      // ApiError is captured in mutation.error; banner renders below.
    }
  });

  const method = form.watch("method");
  const username = form.watch("username");
  const password = form.watch("password");
  const error = mutation.error ?? null;
  const errorCopyKey = error ? toCopyKey(error.code) : null;
  const errorMessage = errorCopyKey ? tError(errorCopyKey) : null;
  const correlationId = error?.correlationId;
  const isPristine = !username && !password;

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      className="flex flex-col gap-5"
      id="auth-tab-login"
      aria-labelledby="auth-tab-login-title"
    >
      <h1 id="auth-tab-login-title" className="sr-only">
        {t("title")}
      </h1>

      <Controller
        control={form.control}
        name="method"
        render={({ field }) => (
          <SegmentedTabs
            value={field.value}
            onValueChange={(value) => {
              field.onChange(value);
              form.setValue("username", "", { shouldValidate: false });
            }}
            aria-label={t("methodPhone") + " / " + t("methodEmail")}
          >
            <SegmentedTabsList>
              <SegmentedTabsTrigger
                value="PHONE"
                className="rounded-full py-3 data-[state=active]:bg-primary-50 data-[state=active]:text-primary-600"
              >
                <span className="inline-flex items-center gap-2">
                  <Phone className="size-4" />
                  {t("methodPhone")}
                </span>
              </SegmentedTabsTrigger>
              <SegmentedTabsTrigger
                value="EMAIL"
                className="rounded-full py-3 data-[state=active]:bg-primary-50 data-[state=active]:text-primary-600"
              >
                <span className="inline-flex items-center gap-2">
                  <Mail className="size-4" />
                  {t("methodEmail")}
                </span>
              </SegmentedTabsTrigger>
            </SegmentedTabsList>
          </SegmentedTabs>
        )}
      />

      <FormField
        error={
          form.formState.errors.username?.message
            ? tValidation(
                form.formState.errors.username.message.replace(
                  /^auth\.validation\./,
                  "",
                ),
              )
            : undefined
        }
      >
        <FormFieldControl>
          <Input
            variant="pill"
            iconLeft={method === "PHONE" ? <Phone /> : <Mail />}
            type={method === "PHONE" ? "tel" : "email"}
            inputMode={method === "PHONE" ? "tel" : "email"}
            autoComplete={method === "PHONE" ? "tel" : "email"}
            placeholder={
              method === "PHONE" ? t("phonePlaceholder") : t("emailPlaceholder")
            }
            aria-label={method === "PHONE" ? t("phoneLabel") : t("emailLabel")}
            {...form.register("username")}
          />
        </FormFieldControl>
      </FormField>

      <FormField
        error={
          form.formState.errors.password?.message
            ? tValidation(
                form.formState.errors.password.message.replace(
                  /^auth\.validation\./,
                  "",
                ),
              )
            : undefined
        }
      >
        <FormFieldControl>
          <PasswordInput
            variant="pill"
            iconLeft={<Lock />}
            autoComplete="current-password"
            placeholder={t("passwordPlaceholder")}
            aria-label={t("passwordLabel")}
            showLabel={t("passwordShow")}
            hideLabel={t("passwordHide")}
            {...form.register("password")}
          />
        </FormFieldControl>
      </FormField>

      <div className="flex justify-end">
        <Link
          href="/reset"
          className={cn(
            "text-body-sm font-medium text-primary-600",
            "transition-colors duration-fast ease-standard hover:text-primary-700",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
            "rounded-sm",
          )}
        >
          {t("forgotPassword")}
        </Link>
      </div>

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
        className={cn(
          "h-[52px] w-full rounded-2xl",
          isPristine &&
            "!bg-bg-muted !text-white shadow-none hover:!bg-bg-muted hover:!shadow-none",
        )}
      >
        {t("submit")}
      </LoadingButton>

      <div className="flex items-center gap-3" aria-hidden="true">
        <Separator className="flex-1" />
        <span className="text-caption text-fg-subtle">{t("orDivider")}</span>
        <Separator className="flex-1" />
      </div>

      <SsoButton />
    </form>
  );
}
