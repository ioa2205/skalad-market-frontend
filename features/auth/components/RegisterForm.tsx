"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Lock, Mail, Phone, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { LoadingButton } from "@/components/feedback";
import { FormField, FormFieldControl } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import {
  SegmentedTabs,
  SegmentedTabsList,
  SegmentedTabsTrigger,
} from "@/components/ui/segmented-tabs";
import { toCopyKey } from "@/lib/i18n/serverErrors";
import { cn } from "@/lib/utils/cn";

import { useRegister } from "../hooks/useRegister";
import {
  RegisterFormSchema,
  toRegistrationWire,
  type RegisterFormValues,
} from "../schemas/forms";

export function RegisterForm() {
  const t = useTranslations("auth.register");
  const tValidation = useTranslations("auth.validation");
  const tError = useTranslations();
  const tCorrelation = useTranslations("auth");
  const tTerms = useTranslations("auth.register");

  const router = useRouter();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(RegisterFormSchema),
    defaultValues: {
      role: "BUYER",
      fullName: "",
      companyName: "",
      phone: "",
      email: "",
      password: "",
    },
    mode: "onTouched",
  });

  const mutation = useRegister();

  const onSubmit = form.handleSubmit(async (values) => {
    const wire = toRegistrationWire(values);
    try {
      await mutation.mutateAsync({
        role: wire.role,
        ...wire.body,
        ...(wire.intent.companyName ? { companyName: wire.intent.companyName } : {}),
        ...(wire.intent.phone ? { phone: wire.intent.phone } : {}),
      });
      toast.success(t("successToast", { email: wire.body.username }));
      const nextUrl = `/login?registered=1&email=${encodeURIComponent(
        wire.body.username,
      )}`;
      router.push(nextUrl);
      router.refresh();
    } catch {
      // ApiError captured in mutation.error.
    }
  });

  const watchedFullName = form.watch("fullName");
  const watchedCompanyName = form.watch("companyName");
  const watchedPhone = form.watch("phone");
  const watchedEmail = form.watch("email");
  const watchedPassword = form.watch("password");
  const error = mutation.error ?? null;
  const errorCopyKey = error ? toCopyKey(error.code) : null;
  const errorMessage = errorCopyKey ? tError(errorCopyKey) : null;
  const correlationId = error?.correlationId;
  const isPristine =
    !watchedFullName &&
    !watchedCompanyName &&
    !watchedPhone &&
    !watchedEmail &&
    !watchedPassword;

  function vmsg(key: string | undefined): string | undefined {
    if (!key) return undefined;
    return tValidation(key.replace(/^auth\.validation\./, ""));
  }

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      className="flex flex-col gap-5"
      id="auth-tab-register"
      aria-labelledby="auth-tab-register-title"
    >
      <h1 id="auth-tab-register-title" className="sr-only">
        {t("title")}
      </h1>

      <Controller
        control={form.control}
        name="role"
        render={({ field }) => (
          <SegmentedTabs
            value={field.value}
            onValueChange={field.onChange}
            aria-label={t("roleBuyer") + " / " + t("roleSeller")}
          >
            <SegmentedTabsList>
              <SegmentedTabsTrigger value="BUYER">
                <span className="text-body-sm font-semibold">{t("roleBuyer")}</span>
                <span className="text-caption text-fg-muted">
                  {t("roleBuyerSubtitle")}
                </span>
              </SegmentedTabsTrigger>
              <SegmentedTabsTrigger value="SELLER">
                <span className="text-body-sm font-semibold">{t("roleSeller")}</span>
                <span className="text-caption text-fg-muted">
                  {t("roleSellerSubtitle")}
                </span>
              </SegmentedTabsTrigger>
            </SegmentedTabsList>
          </SegmentedTabs>
        )}
      />

      <FormField error={vmsg(form.formState.errors.fullName?.message)}>
        <FormFieldControl>
          <Input
            variant="pill"
            iconLeft={<UserRound />}
            autoComplete="name"
            placeholder={t("namePlaceholder")}
            aria-label={t("nameLabel")}
            {...form.register("fullName")}
          />
        </FormFieldControl>
      </FormField>

      <FormField error={vmsg(form.formState.errors.companyName?.message)}>
        <FormFieldControl>
          <Input
            variant="pill"
            iconLeft={<Building2 />}
            autoComplete="organization"
            placeholder={t("companyPlaceholder")}
            aria-label={t("companyLabel")}
            {...form.register("companyName")}
          />
        </FormFieldControl>
      </FormField>

      <FormField error={vmsg(form.formState.errors.phone?.message)}>
        <FormFieldControl>
          <Input
            variant="pill"
            iconLeft={<Phone />}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder={t("phonePlaceholder")}
            aria-label={t("phoneLabel")}
            {...form.register("phone")}
          />
        </FormFieldControl>
      </FormField>

      <FormField error={vmsg(form.formState.errors.email?.message)}>
        <FormFieldControl>
          <Input
            variant="pill"
            iconLeft={<Mail />}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder={t("emailPlaceholder")}
            aria-label={t("emailLabel")}
            {...form.register("email")}
          />
        </FormFieldControl>
      </FormField>

      <FormField error={vmsg(form.formState.errors.password?.message)}>
        <FormFieldControl>
          <PasswordInput
            variant="pill"
            iconLeft={<Lock />}
            autoComplete="new-password"
            placeholder={t("passwordPlaceholder")}
            aria-label={t("passwordLabel")}
            showLabel={tCorrelation("login.passwordShow")}
            hideLabel={tCorrelation("login.passwordHide")}
            {...form.register("password")}
          />
        </FormFieldControl>
      </FormField>

      <p className="text-caption text-fg-muted">
        {tTerms("termsBefore")}{" "}
        <a
          href="/legal/terms"
          className="text-primary-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {tTerms("termsLink")}
        </a>{" "}
        {tTerms("termsAnd")}{" "}
        <a
          href="/legal/privacy"
          className="text-primary-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {tTerms("privacyLink")}
        </a>
      </p>

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
    </form>
  );
}
