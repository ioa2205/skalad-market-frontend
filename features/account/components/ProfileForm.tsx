"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { ErrorState } from "@/components/feedback";
import { LoadingButton } from "@/components/feedback/loading-button";
import { FormField, FormFieldControl } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import type { UsersDTO } from "@/lib/api/schemas/user";

import {
  ProfileFormSchema,
  type ProfileFormInput,
  type ProfileFormValues,
} from "../schemas/profileForm";
import { useUpdateProfile } from "../api/account.client";

export interface ProfileFormProps {
  initial: UsersDTO;
  /** Read-only username (login) shown above the form. Comes from the JWT. */
  username?: string | undefined;
}

export function ProfileForm({ initial, username }: ProfileFormProps) {
  const t = useTranslations("account.profile");
  const update = useUpdateProfile();
  const [formError, setFormError] = useState<{
    code: string;
    correlationId?: string;
  } | null>(null);

  const form = useForm<ProfileFormInput, unknown, ProfileFormValues>({
    resolver: zodResolver(ProfileFormSchema),
    defaultValues: initial,
    mode: "onSubmit",
  });

  // If the server returns refreshed data (e.g. another tab saved), reset form.
  useEffect(() => {
    form.reset(initial);
  }, [initial, form]);

  const onSubmit = form.handleSubmit((values) => {
    setFormError(null);
    update.mutate(values, {
      onSuccess: () => {
        form.reset(values);
        toast.success(t("savedToast"));
      },
      onError: (error) => {
        setFormError({
          code: error.code,
          ...(error.correlationId ? { correlationId: error.correlationId } : {}),
        });
        toast.error(t("errorToast"), {
          ...(error.correlationId
            ? { description: t("errorWithId", { id: error.correlationId }) }
            : {}),
        });
      },
    });
  });

  const errors = form.formState.errors;

  const validationMessage = (key?: string): string | undefined => {
    if (!key) return undefined;
    if (key === "firstNameRequired") return t("validation.firstNameRequired");
    if (key === "lastNameRequired") return t("validation.lastNameRequired");
    if (key === "tooLong") return t("validation.tooLong");
    return key;
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      {username ? (
        <FormField label={t("fields.username")} description={t("fields.usernameHint")}>
          <FormFieldControl>
            <Input value={username} disabled readOnly aria-readonly="true" />
          </FormFieldControl>
        </FormField>
      ) : null}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <FormField
          label={t("fields.firstName")}
          required
          error={validationMessage(errors.firstName?.message)}
        >
          <FormFieldControl>
            <Input autoComplete="given-name" {...form.register("firstName")} />
          </FormFieldControl>
        </FormField>

        <FormField
          label={t("fields.lastName")}
          required
          error={validationMessage(errors.lastName?.message)}
        >
          <FormFieldControl>
            <Input autoComplete="family-name" {...form.register("lastName")} />
          </FormFieldControl>
        </FormField>
      </div>

      <FormField
        label={t("fields.position")}
        error={validationMessage(errors.position?.message)}
      >
        <FormFieldControl>
          <Input
            placeholder={t("placeholders.position")}
            autoComplete="organization-title"
            {...form.register("position")}
          />
        </FormFieldControl>
      </FormField>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <FormField
          label={t("fields.telegram")}
          error={validationMessage(errors.telegram?.message)}
        >
          <FormFieldControl>
            <Input
              placeholder={t("placeholders.telegram")}
              {...form.register("telegram")}
            />
          </FormFieldControl>
        </FormField>

        <FormField
          label={t("fields.extraPhone")}
          error={validationMessage(errors.extraPhone?.message)}
        >
          <FormFieldControl>
            <Input
              type="tel"
              placeholder={t("placeholders.extraPhone")}
              autoComplete="tel"
              {...form.register("extraPhone")}
            />
          </FormFieldControl>
        </FormField>
      </div>

      {formError ? (
        <ErrorState
          title={t("errorToast")}
          {...(formError.correlationId
            ? {
                correlationId: formError.correlationId,
                correlationIdLabel: t("loadError.correlationLabel"),
              }
            : {})}
        />
      ) : null}

      <div className="flex justify-end">
        <LoadingButton
          type="submit"
          variant="primary"
          pending={update.isPending}
          pendingLabel={t("savePending")}
          disabled={!form.formState.isDirty || update.isPending}
        >
          {t("save")}
        </LoadingButton>
      </div>
    </form>
  );
}
