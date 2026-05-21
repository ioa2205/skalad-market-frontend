"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, type ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { LoadingButton } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import { FormField, FormFieldControl } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/api/errors";
import { REGION_FIXTURES, findRegion } from "@/lib/data/regions";
import { log } from "@/lib/log";

import {
  createCompany,
  submitCompanyVerification,
  uploadCompanyCover,
  uploadCompanyLogo,
} from "../../api/company-onboarding.client";
import {
  CompanyStepContactSchema,
  CompanyStepProfileSchema,
  CompanyWizardSchema,
  toCompanyRequestDTO,
  type CompanyWizardValues,
} from "../../schemas/companyForm";

import { OnboardingProgress } from "./OnboardingProgress";

type StepKey = "profile" | "contact" | "branding";

const STEP_ORDER: StepKey[] = ["profile", "contact", "branding"];

const STEP_FIELDS: Record<StepKey, (keyof CompanyWizardValues)[]> = {
  profile: ["name", "shortDescription", "description", "stir"],
  contact: [
    "phonePrimary",
    "phoneSecondary",
    "website",
    "regionId",
    "districtId",
    "address",
  ],
  branding: ["logoUrl", "coverFileName"],
};

export interface OnboardingWizardProps {
  /**
   * Optional pre-filled values when the seller resumes a draft. Right now we
   * only get the latest company from `GET /api/v1/companies` (CompanyShortDTO),
   * so we hydrate name + slug only — everything else stays blank.
   */
  initialValues?: Partial<CompanyWizardValues>;
}

export function OnboardingWizard({ initialValues }: OnboardingWizardProps) {
  const t = useTranslations("seller.onboarding");
  const tValidation = useTranslations();
  const router = useRouter();

  const [stepIndex, setStepIndex] = useState(0);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState<{
    code: string;
    correlationId?: string | undefined;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<CompanyWizardValues>({
    resolver: zodResolver(CompanyWizardSchema),
    mode: "onTouched",
    defaultValues: {
      name: initialValues?.name ?? "",
      shortDescription: initialValues?.shortDescription ?? "",
      description: initialValues?.description ?? "",
      stir: initialValues?.stir ?? "",
      phonePrimary: initialValues?.phonePrimary ?? "",
      phoneSecondary: initialValues?.phoneSecondary ?? "",
      website: initialValues?.website ?? "",
      regionId: initialValues?.regionId ?? 0,
      districtId: initialValues?.districtId ?? 0,
      address: initialValues?.address ?? "",
      logoUrl: initialValues?.logoUrl ?? "",
      coverFileName: initialValues?.coverFileName ?? "",
    },
  });

  const currentStep = STEP_ORDER[stepIndex];
  const isLastStep = stepIndex === STEP_ORDER.length - 1;

  const steps = STEP_ORDER.map((key) => ({ key, label: t(`steps.${key}`) }));

  function vmsg(key: string | undefined): string | undefined {
    if (!key) return undefined;
    return tValidation(key);
  }

  async function goNext(): Promise<void> {
    if (!currentStep) return;
    const fields = STEP_FIELDS[currentStep];
    const ok = await form.trigger(fields, { shouldFocus: true });
    if (!ok) return;
    if (isLastStep) {
      await onSubmit();
      return;
    }
    setStepIndex((i) => Math.min(i + 1, STEP_ORDER.length - 1));
  }

  function goBack(): void {
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  async function onSubmit(): Promise<void> {
    setSubmitError(null);
    setSubmitting(true);
    try {
      const values = form.getValues();
      const dto = toCompanyRequestDTO(values);
      const { company } = await createCompany(dto);

      if (logoFile) {
        try {
          await uploadCompanyLogo(company.id, logoFile);
        } catch (error) {
          log.warn("seller.onboarding.logo.failed", {
            companyId: company.id,
            code: error instanceof ApiError ? error.code : "unknown.error",
            correlationId:
              error instanceof ApiError ? error.correlationId : undefined,
          });
        }
      }
      if (coverFile) {
        try {
          await uploadCompanyCover(company.id, coverFile);
        } catch (error) {
          log.warn("seller.onboarding.cover.failed", {
            companyId: company.id,
            code: error instanceof ApiError ? error.code : "unknown.error",
            correlationId:
              error instanceof ApiError ? error.correlationId : undefined,
          });
        }
      }

      await submitCompanyVerification(company.id);
      toast.success(t("successToast"));
      router.push("/seller/overview");
      router.refresh();
    } catch (error) {
      const apiError = error instanceof ApiError ? error : null;
      const fallback = "company.create.failed";
      setSubmitError({
        code: apiError?.code ?? fallback,
        correlationId: apiError?.correlationId,
      });
      log.warn("seller.onboarding.submit.failed", {
        code: apiError?.code ?? fallback,
        correlationId: apiError?.correlationId,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <OnboardingProgress steps={steps} activeIndex={stepIndex} />

      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void goNext();
        }}
        className="flex flex-col gap-5"
        aria-labelledby="onboarding-step-title"
      >
        <h2
          id="onboarding-step-title"
          className="text-h3 font-semibold text-fg"
        >
          {t(`steps.${currentStep}`)}
        </h2>

        {currentStep === "profile" ? (
          <ProfileStep form={form} t={t} vmsg={vmsg} />
        ) : null}
        {currentStep === "contact" ? (
          <ContactStep form={form} t={t} vmsg={vmsg} />
        ) : null}
        {currentStep === "branding" ? (
          <BrandingStep
            form={form}
            t={t}
            logoFile={logoFile}
            coverFile={coverFile}
            onLogoChange={setLogoFile}
            onCoverChange={setCoverFile}
          />
        ) : null}

        {submitError ? (
          <div
            role="alert"
            className="rounded-md border border-danger/40 bg-danger-soft px-3 py-2 text-body-sm text-danger-soft-foreground"
          >
            {t("submitError")}
            {submitError.correlationId ? (
              <p className="mt-0.5 text-caption text-fg-muted">
                {t("correlationId", { id: submitError.correlationId })}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={goBack}
            disabled={stepIndex === 0 || submitting}
          >
            {t("back")}
          </Button>
          <LoadingButton
            type="submit"
            pending={submitting}
            pendingLabel={t("submitting")}
          >
            {isLastStep ? t("submit") : t("next")}
          </LoadingButton>
        </div>
      </form>
    </div>
  );
}

interface StepProps {
  form: ReturnType<typeof useForm<CompanyWizardValues>>;
  t: ReturnType<typeof useTranslations>;
  vmsg: (key: string | undefined) => string | undefined;
}

function ProfileStep({ form, t, vmsg }: StepProps) {
  return (
    <>
      <FormField
        label={t("fields.name")}
        required
        error={vmsg(form.formState.errors.name?.message)}
      >
        <FormFieldControl>
          <Input
            placeholder={t("placeholders.name")}
            autoComplete="organization"
            {...form.register("name")}
          />
        </FormFieldControl>
      </FormField>

      <FormField
        label={t("fields.shortDescription")}
        description={t("hints.shortDescription")}
        error={vmsg(form.formState.errors.shortDescription?.message)}
      >
        <FormFieldControl>
          <Input
            placeholder={t("placeholders.shortDescription")}
            {...form.register("shortDescription")}
          />
        </FormFieldControl>
      </FormField>

      <FormField
        label={t("fields.description")}
        error={vmsg(form.formState.errors.description?.message)}
      >
        <FormFieldControl>
          <Textarea
            rows={4}
            placeholder={t("placeholders.description")}
            {...form.register("description")}
          />
        </FormFieldControl>
      </FormField>

      <FormField
        label={t("fields.stir")}
        required
        description={t("hints.stir")}
        error={vmsg(form.formState.errors.stir?.message)}
      >
        <FormFieldControl>
          <Input
            inputMode="numeric"
            placeholder={t("placeholders.stir")}
            {...form.register("stir")}
          />
        </FormFieldControl>
      </FormField>
    </>
  );
}

function ContactStep({ form, t, vmsg }: StepProps) {
  const tRegions = useTranslations("regionsStub");
  const tDistricts = useTranslations("districtsStub");
  const regionId = form.watch("regionId");
  const region = regionId ? findRegion(Number(regionId)) : undefined;

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          label={t("fields.phonePrimary")}
          required
          error={vmsg(form.formState.errors.phonePrimary?.message)}
        >
          <FormFieldControl>
            <Input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder={t("placeholders.phone")}
              {...form.register("phonePrimary")}
            />
          </FormFieldControl>
        </FormField>

        <FormField
          label={t("fields.phoneSecondary")}
          error={vmsg(form.formState.errors.phoneSecondary?.message)}
        >
          <FormFieldControl>
            <Input
              type="tel"
              inputMode="tel"
              placeholder={t("placeholders.phoneSecondary")}
              {...form.register("phoneSecondary")}
            />
          </FormFieldControl>
        </FormField>
      </div>

      <FormField
        label={t("fields.website")}
        error={vmsg(form.formState.errors.website?.message)}
      >
        <FormFieldControl>
          <Input
            placeholder={t("placeholders.website")}
            {...form.register("website")}
          />
        </FormFieldControl>
      </FormField>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          label={t("fields.region")}
          required
          error={vmsg(form.formState.errors.regionId?.message)}
        >
          <Controller
            control={form.control}
            name="regionId"
            render={({ field }) => (
              <Select
                value={field.value ? String(field.value) : ""}
                onValueChange={(value) => {
                  field.onChange(Number(value));
                  // Reset district when region changes — districts are scoped.
                  form.setValue("districtId", 0, { shouldValidate: false });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("placeholders.region")} />
                </SelectTrigger>
                <SelectContent>
                  {REGION_FIXTURES.map((row) => (
                    <SelectItem key={row.id} value={String(row.id)}>
                      {tRegions(row.i18nKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>

        <FormField
          label={t("fields.district")}
          required
          error={vmsg(form.formState.errors.districtId?.message)}
        >
          <Controller
            control={form.control}
            name="districtId"
            render={({ field }) => (
              <Select
                value={field.value ? String(field.value) : ""}
                onValueChange={(value) => field.onChange(Number(value))}
                disabled={!region}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      region ? t("placeholders.district") : t("placeholders.districtPickRegion")
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {region?.districts.map((d) => (
                    <SelectItem key={d.id} value={String(d.id)}>
                      {tDistricts(d.i18nKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>
      </div>

      <FormField
        label={t("fields.address")}
        required
        error={vmsg(form.formState.errors.address?.message)}
      >
        <FormFieldControl>
          <Input
            placeholder={t("placeholders.address")}
            autoComplete="street-address"
            {...form.register("address")}
          />
        </FormFieldControl>
      </FormField>
    </>
  );
}

interface BrandingStepProps {
  form: ReturnType<typeof useForm<CompanyWizardValues>>;
  t: ReturnType<typeof useTranslations>;
  logoFile: File | null;
  coverFile: File | null;
  onLogoChange: (file: File | null) => void;
  onCoverChange: (file: File | null) => void;
}

function BrandingStep({
  form,
  t,
  logoFile,
  coverFile,
  onLogoChange,
  onCoverChange,
}: BrandingStepProps) {
  return (
    <div className="flex flex-col gap-5">
      <FilePickerRow
        id="onboarding-logo"
        label={t("fields.logo")}
        hint={t("hints.logo")}
        file={logoFile}
        onChange={(file) => {
          onLogoChange(file);
          form.setValue("logoUrl", file ? file.name : "");
        }}
        accept="image/png,image/jpeg,image/webp"
        emptyLabel={t("filePicker.choose")}
      />
      <FilePickerRow
        id="onboarding-cover"
        label={t("fields.cover")}
        hint={t("hints.cover")}
        file={coverFile}
        onChange={(file) => {
          onCoverChange(file);
          form.setValue("coverFileName", file ? file.name : "");
        }}
        accept="image/png,image/jpeg,image/webp"
        emptyLabel={t("filePicker.choose")}
      />

      <BrandingNote t={t} />
    </div>
  );
}

function FilePickerRow({
  id,
  label,
  hint,
  file,
  onChange,
  accept,
  emptyLabel,
}: {
  id: string;
  label: string;
  hint: string;
  file: File | null;
  onChange: (file: File | null) => void;
  accept: string;
  emptyLabel: string;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-dashed border-border bg-bg-elevated p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <label htmlFor={id} className="text-body-sm font-semibold text-fg">
            {label}
          </label>
          <p className="text-caption text-fg-muted">{hint}</p>
        </div>
        <Button
          asChild
          variant="secondary"
          size="sm"
          className="cursor-pointer"
        >
          <label htmlFor={id}>
            {file ? file.name : emptyLabel}
          </label>
        </Button>
      </div>
      <input
        id={id}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(event) => {
          const next = event.target.files?.[0] ?? null;
          onChange(next);
        }}
      />
    </div>
  );
}

function BrandingNote({ t }: { t: ReturnType<typeof useTranslations> }): ReactNode {
  return (
    <p className="text-caption text-fg-muted">
      {t("hints.coverGap")}
    </p>
  );
}
