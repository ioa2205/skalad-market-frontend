"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Controller, useForm, type Resolver } from "react-hook-form";
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
import type {
  Currency,
  PriceType,
  SaleType,
} from "@/lib/api/schemas/enums";
import type { CategoryResponse } from "@/lib/api/schemas/category";
import { REGION_FIXTURES, findRegion } from "@/lib/data/regions";
import { log } from "@/lib/log";

import {
  createProduct,
  updateProduct,
} from "../../api/products.client";
import {
  ProductCreateFormSchema,
  ProductEditFormSchema,
  toCreateProductWire,
  toUpdateProductWire,
  type ProductCreateFormValues,
  type ProductEditFormValues,
} from "../../schemas/productForm";

export interface ProductFormProps {
  mode: "create" | "edit";
  /** Carries the ID for edit mode. */
  productId?: number;
  companyId: number;
  categories: CategoryResponse[];
  initialValues?: Partial<ProductCreateFormValues> & Partial<ProductEditFormValues>;
}

interface FormErrorPayload {
  code: string;
  correlationId?: string | undefined;
}

const CURRENCY_OPTIONS: Currency[] = ["UZS", "USD"];
const PRICE_TYPE_OPTIONS: PriceType[] = ["FIXED", "FROM_PRICE", "NEGOTIABLE"];
const SALE_TYPE_OPTIONS: SaleType[] = ["WHOLESALE", "RETAIL"];

export function ProductForm({
  mode,
  productId,
  companyId,
  categories,
  initialValues,
}: ProductFormProps) {
  const t = useTranslations("seller.dashboard.products.form");
  const tValidation = useTranslations();
  const router = useRouter();
  const [submitError, setSubmitError] = useState<FormErrorPayload | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (mode === "create") {
    return (
      <CreateForm
        companyId={companyId}
        categories={categories}
        t={t}
        tValidation={tValidation}
        router={router}
        submitError={submitError}
        setSubmitError={setSubmitError}
        submitting={submitting}
        setSubmitting={setSubmitting}
        initialValues={initialValues}
      />
    );
  }

  return (
    <EditForm
      productId={productId!}
      companyId={companyId}
      categories={categories}
      t={t}
      tValidation={tValidation}
      router={router}
      submitError={submitError}
      setSubmitError={setSubmitError}
      submitting={submitting}
      setSubmitting={setSubmitting}
      initialValues={initialValues}
    />
  );
}

interface SharedFormProps {
  companyId: number;
  categories: CategoryResponse[];
  t: ReturnType<typeof useTranslations>;
  tValidation: ReturnType<typeof useTranslations>;
  router: ReturnType<typeof useRouter>;
  submitError: FormErrorPayload | null;
  setSubmitError: (e: FormErrorPayload | null) => void;
  submitting: boolean;
  setSubmitting: (v: boolean) => void;
  initialValues?: Partial<ProductCreateFormValues> & Partial<ProductEditFormValues>;
}

function CreateForm({
  companyId,
  categories,
  t,
  tValidation,
  router,
  submitError,
  setSubmitError,
  submitting,
  setSubmitting,
  initialValues,
}: SharedFormProps) {
  const form = useForm<ProductCreateFormValues>({
    // The schema uses `preprocess` for numeric fields, so the resolver's
    // input type is `unknown`. Cast keeps the call site readable while
    // RHF still type-checks the rest of the form.
    resolver: zodResolver(
      ProductCreateFormSchema,
    ) as unknown as Resolver<ProductCreateFormValues>,
    mode: "onTouched",
    defaultValues: {
      name: initialValues?.name ?? "",
      shortDescription: initialValues?.shortDescription ?? "",
      description: initialValues?.description ?? "",
      categoryId: initialValues?.categoryId ?? 0,
      priceType: initialValues?.priceType ?? "FIXED",
      saleType: (initialValues as Partial<ProductCreateFormValues>)?.saleType ?? "WHOLESALE",
      price: initialValues?.price ?? 0,
      currency: initialValues?.currency ?? "UZS",
      regionId: initialValues?.regionId ?? 0,
      districtId: initialValues?.districtId ?? 0,
      minProduct:
        (initialValues as Partial<ProductCreateFormValues>)?.minProduct ?? 1,
      attributes: initialValues?.attributes ?? {},
    },
  });

  function vmsg(key: string | undefined): string | undefined {
    return key ? tValidation(key) : undefined;
  }

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null);
    setSubmitting(true);
    try {
      const wire = toCreateProductWire(values, companyId);
      await createProduct(wire);
      toast.success(t("createSuccess"));
      router.push("/seller/products");
      router.refresh();
    } catch (error) {
      const apiError = error instanceof ApiError ? error : null;
      setSubmitError({
        code: apiError?.code ?? "product.create.failed",
        correlationId: apiError?.correlationId,
      });
      log.warn("seller.product.create.failed", {
        code: apiError?.code ?? "product.create.failed",
        correlationId: apiError?.correlationId,
      });
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <FormBody
      form={form}
      categories={categories}
      mode="create"
      onSubmit={onSubmit}
      submitError={submitError}
      submitting={submitting}
      t={t}
      vmsg={vmsg}
    />
  );
}

function EditForm({
  productId,
  companyId,
  categories,
  t,
  tValidation,
  router,
  submitError,
  setSubmitError,
  submitting,
  setSubmitting,
  initialValues,
}: SharedFormProps & { productId: number }) {
  const form = useForm<ProductEditFormValues>({
    resolver: zodResolver(
      ProductEditFormSchema,
    ) as unknown as Resolver<ProductEditFormValues>,
    mode: "onTouched",
    defaultValues: {
      name: initialValues?.name ?? "",
      shortDescription: initialValues?.shortDescription ?? "",
      description: initialValues?.description ?? "",
      categoryId: initialValues?.categoryId ?? 0,
      priceType: initialValues?.priceType ?? "FIXED",
      price: initialValues?.price ?? 0,
      currency: initialValues?.currency ?? "UZS",
      regionId: initialValues?.regionId ?? 0,
      districtId: initialValues?.districtId ?? 0,
      attributes: initialValues?.attributes ?? {},
    },
  });

  function vmsg(key: string | undefined): string | undefined {
    return key ? tValidation(key) : undefined;
  }

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null);
    setSubmitting(true);
    try {
      const wire = toUpdateProductWire(values, companyId);
      await updateProduct(productId, wire);
      toast.success(t("updateSuccess"));
      router.push("/seller/products");
      router.refresh();
    } catch (error) {
      const apiError = error instanceof ApiError ? error : null;
      setSubmitError({
        code: apiError?.code ?? "product.update.failed",
        correlationId: apiError?.correlationId,
      });
      log.warn("seller.product.update.failed", {
        code: apiError?.code ?? "product.update.failed",
        correlationId: apiError?.correlationId,
      });
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <FormBody
      form={form}
      categories={categories}
      mode="edit"
      onSubmit={onSubmit}
      submitError={submitError}
      submitting={submitting}
      t={t}
      vmsg={vmsg}
    />
  );
}

/**
 * The body works against either form shape — typing it on the discriminated
 * union of `ProductCreateFormValues | ProductEditFormValues` was producing
 * non-assignable Control unions in react-hook-form. We instead accept a
 * loose `UseFormReturn<any>` here and trust the parent (CreateForm/EditForm)
 * to have already enforced types via the zod resolver.
 */
interface FormBodyProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: ReturnType<typeof useForm<any>>;
  categories: CategoryResponse[];
  mode: "create" | "edit";
  onSubmit: (event?: React.BaseSyntheticEvent) => Promise<void>;
  submitError: FormErrorPayload | null;
  submitting: boolean;
  t: ReturnType<typeof useTranslations>;
  vmsg: (key: string | undefined) => string | undefined;
}

function FormBody({
  form,
  categories,
  mode,
  onSubmit,
  submitError,
  submitting,
  t,
  vmsg,
}: FormBodyProps) {
  const tRegions = useTranslations("regionsStub");
  const tDistricts = useTranslations("districtsStub");
  const errors = form.formState.errors as Record<string, { message?: string }>;
  const regionId = form.watch("regionId");
  const region = regionId ? findRegion(Number(regionId)) : undefined;

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
      <FormField
        label={t("fields.name")}
        required
        error={vmsg(errors.name?.message)}
      >
        <FormFieldControl>
          <Input
            placeholder={t("placeholders.name")}
            {...form.register("name")}
          />
        </FormFieldControl>
      </FormField>

      <FormField
        label={t("fields.shortDescription")}
        error={vmsg(errors.shortDescription?.message)}
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
        required={mode === "create"}
        error={vmsg(errors.description?.message)}
      >
        <FormFieldControl>
          <Textarea
            rows={5}
            placeholder={t("placeholders.description")}
            {...form.register("description")}
          />
        </FormFieldControl>
      </FormField>

      <FormField
        label={t("fields.category")}
        required
        error={vmsg(errors.categoryId?.message)}
      >
        <Controller
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <Select
              value={field.value ? String(field.value) : ""}
              onValueChange={(v) => field.onChange(Number(v))}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("placeholders.category")} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={String(cat.id)}>
                    {cat.nameRu}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </FormField>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          label={t("fields.priceType")}
          required
          error={vmsg(errors.priceType?.message)}
        >
          <Controller
            control={form.control}
            name="priceType"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRICE_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {t(`priceTypes.${option}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>

        {mode === "create" ? (
          <FormField
            label={t("fields.saleType")}
            required
            error={vmsg(errors.saleType?.message)}
          >
            <Controller
              control={form.control}
              name="saleType"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SALE_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {t(`saleTypes.${option}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <FormField
          label={t("fields.price")}
          required={mode === "create"}
          error={vmsg(errors.price?.message)}
        >
          <FormFieldControl>
            <Input
              type="number"
              inputMode="decimal"
              step="any"
              min={0}
              placeholder={t("placeholders.price")}
              {...form.register("price", { valueAsNumber: true })}
            />
          </FormFieldControl>
        </FormField>

        <FormField
          label={t("fields.currency")}
          required
          error={vmsg(errors.currency?.message)}
        >
          <Controller
            control={form.control}
            name="currency"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCY_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>

        {mode === "create" ? (
          <FormField
            label={t("fields.minProduct")}
            required
            error={vmsg(errors.minProduct?.message)}
          >
            <FormFieldControl>
              <Input
                type="number"
                inputMode="numeric"
                min={1}
                step={1}
                {...form.register("minProduct", { valueAsNumber: true })}
              />
            </FormFieldControl>
          </FormField>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          label={t("fields.region")}
          required
          error={vmsg(errors.regionId?.message)}
        >
          <Controller
            control={form.control}
            name="regionId"
            render={({ field }) => (
              <Select
                value={field.value ? String(field.value) : ""}
                onValueChange={(v) => {
                  field.onChange(Number(v));
                  form.setValue("districtId" as never, 0 as never, {
                    shouldValidate: false,
                  });
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

        <FormField label={t("fields.district")}>
          <Controller
            control={form.control}
            name="districtId"
            render={({ field }) => (
              <Select
                value={field.value ? String(field.value) : ""}
                onValueChange={(v) => field.onChange(Number(v))}
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

      <p className="rounded-md border border-border bg-bg-muted px-3 py-2 text-caption text-fg-muted">
        {t("attributesGap")}
      </p>

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
          onClick={() => history.back()}
          disabled={submitting}
        >
          {t("cancel")}
        </Button>
        <LoadingButton
          type="submit"
          pending={submitting}
          pendingLabel={t("submitting")}
        >
          {mode === "create" ? t("submitCreate") : t("submitUpdate")}
        </LoadingButton>
      </div>
    </form>
  );
}
