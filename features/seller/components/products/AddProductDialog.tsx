"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Upload, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";

import { LoadingButton } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useCategories } from "@/features/category/api/categories.client";
import { ApiError } from "@/lib/api/errors";
import { cn } from "@/lib/utils/cn";

import {
  createProduct,
  uploadProductImages,
  type CreateProductWireBody,
} from "../../api/products.client";
import {
  AddProductDialogSchema,
  DEFAULT_ADD_PRODUCT_VALUES,
  UNIT_OPTIONS,
  type AddProductDialogValues,
} from "../../schemas/addProductDialog";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/png", "image/jpeg"];

export interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: number;
  /** Region defaults from the seller's company so the figma's simplified form
   * still satisfies the backend `regionId` requirement. */
  companyRegionId: number;
  /** Optional district default, also from the seller's company. */
  companyDistrictId?: number;
}

interface SubmitErrorPayload {
  code: string;
  correlationId?: string | undefined;
}

/**
 * "Добавить товар" modal — replaces the page-route product-create form in the
 * design. Required-by-backend fields that the modal doesn't surface
 * (region/district/currency/priceType) are filled from sensible defaults so
 * the simplified form still produces a valid `CreateProductRequest`.
 *
 * Photos are uploaded after the product is created via `/products/{id}/images`.
 * A partial photo upload failure does not roll back the product — we toast a
 * warning so the seller knows to retry photos on the edit screen.
 */
export function AddProductDialog({
  open,
  onOpenChange,
  companyId,
  companyRegionId,
  companyDistrictId,
}: AddProductDialogProps) {
  const t = useTranslations("addProduct");
  const tValidation = useTranslations();
  const router = useRouter();
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const categoriesQuery = useCategories(200);
  const [files, setFiles] = useState<File[]>([]);
  const [submitError, setSubmitError] = useState<SubmitErrorPayload | null>(
    null,
  );

  const form = useForm<AddProductDialogValues>({
    resolver: zodResolver(
      AddProductDialogSchema,
    ) as unknown as Resolver<AddProductDialogValues>,
    mode: "onTouched",
    defaultValues: DEFAULT_ADD_PRODUCT_VALUES,
  });

  // Reset on close so re-opening starts fresh. Keeps draft restore explicit.
  useEffect(() => {
    if (!open) {
      form.reset(DEFAULT_ADD_PRODUCT_VALUES);
      setFiles([]);
      setSubmitError(null);
    }
  }, [open, form]);

  const errors = form.formState.errors as Record<string, { message?: string }>;
  const submitting = form.formState.isSubmitting;

  function vmsg(key: string | undefined): string | undefined {
    return key ? tValidation(key) : undefined;
  }

  const onFilesPicked = (picked: FileList | null) => {
    if (!picked || picked.length === 0) return;
    const next: File[] = [];
    for (const file of Array.from(picked)) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error(t("upload.wrongType"));
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(t("upload.tooLarge"));
        continue;
      }
      next.push(file);
    }
    if (next.length > 0) {
      setFiles((prev) => [...prev, ...next]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const submit = form.handleSubmit(async (values) => {
    setSubmitError(null);
    const wire: CreateProductWireBody = {
      companyId,
      categoryId: values.categoryId,
      name: values.name,
      description: values.description,
      priceType: "FIXED",
      saleType: values.saleType,
      price: values.price,
      currency: "UZS",
      regionId: companyRegionId,
      minProduct: values.minProduct,
      attributes: { unit: values.unit },
    };
    if (companyDistrictId !== undefined && companyDistrictId > 0) {
      wire.districtId = companyDistrictId;
    }

    try {
      const created = await createProduct(wire);
      const productId = created.data.id;

      if (files.length > 0) {
        try {
          const result = await uploadProductImages(productId, files);
          if (result.uploadedCount < result.attemptedCount) {
            toast.warning(t("submit.photoUploadWarning"));
          }
        } catch {
          toast.warning(t("submit.photoUploadWarning"));
        }
      }

      toast.success(t("submit.successModeration"));
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      const apiError = error instanceof ApiError ? error : null;
      setSubmitError({
        code: apiError?.code ?? "product.create.failed",
        correlationId: apiError?.correlationId,
      });
    }
  });

  const saveDraft = () => {
    // Backend has no draft endpoint for products. We stash the form values in
    // localStorage so the seller can come back to a half-filled form — the
    // standard `/seller/products/new` route reads the same key if present.
    try {
      const values = form.getValues();
      localStorage.setItem(
        "skladx.draft.addProduct",
        JSON.stringify({ values, savedAt: Date.now() }),
      );
      toast.success(t("submit.successDraft"));
      onOpenChange(false);
    } catch {
      toast.error(t("submit.error"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-center">{t("title")}</DialogTitle>
        </DialogHeader>

        <form
          noValidate
          onSubmit={submit}
          className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto pr-1"
        >
          {/* Sale type toggle — top of the form per figma. */}
          <Controller
            control={form.control}
            name="saleType"
            render={({ field }) => (
              <div
                role="tablist"
                aria-label={t("title")}
                className="grid grid-cols-2 gap-0 rounded-full bg-bg-muted p-1"
              >
                {(["WHOLESALE", "RETAIL"] as const).map((option) => {
                  const selected = field.value === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      onClick={() => field.onChange(option)}
                      className={cn(
                        "inline-flex h-9 items-center justify-center rounded-full px-4 text-body-sm font-medium",
                        "transition-colors duration-fast ease-standard",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
                        selected
                          ? "bg-bg-elevated text-fg shadow-sm"
                          : "text-fg-muted",
                      )}
                    >
                      {t(`saleType.${option}`)}
                    </button>
                  );
                })}
              </div>
            )}
          />

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

          <div className="grid gap-4 sm:grid-cols-2">
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
                    disabled={
                      categoriesQuery.isPending || categoriesQuery.isError
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("placeholders.category")} />
                    </SelectTrigger>
                    <SelectContent>
                      {categoriesQuery.data?.content.map((cat) => (
                        <SelectItem key={cat.id} value={String(cat.id)}>
                          {cat.nameRu}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>

            <FormField
              label={t("fields.unit")}
              required
              error={vmsg(errors.unit?.message)}
            >
              <Controller
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("placeholders.unit")} />
                    </SelectTrigger>
                    <SelectContent>
                      {UNIT_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {t(`units.${option}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label={t("fields.price")}
              required
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
              label={t("fields.minOrder")}
              required
              error={vmsg(errors.minProduct?.message)}
            >
              <FormFieldControl>
                <Input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  step={1}
                  placeholder={t("placeholders.minOrder")}
                  {...form.register("minProduct", { valueAsNumber: true })}
                />
              </FormFieldControl>
            </FormField>
          </div>

          <FormField
            label={t("fields.description")}
            required
            error={vmsg(errors.description?.message)}
          >
            <FormFieldControl>
              <Textarea
                rows={4}
                placeholder={t("placeholders.description")}
                {...form.register("description")}
              />
            </FormFieldControl>
          </FormField>

          <FormField label={t("fields.photos")}>
            <label
              htmlFor={fileInputId}
              className={cn(
                "flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-bg-muted/40 px-4 py-6 text-center",
                "cursor-pointer hover:border-primary-300 hover:bg-bg-muted/70",
                "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-bg",
              )}
            >
              <Upload className="size-5 text-fg-muted" aria-hidden="true" />
              <p className="text-body-sm text-fg-muted">{t("upload.title")}</p>
              <p className="text-caption text-fg-muted">{t("upload.hint")}</p>
              <input
                id={fileInputId}
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_TYPES.join(",")}
                multiple
                className="sr-only"
                onChange={(e) => {
                  onFilesPicked(e.target.files);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              />
              <p className="text-caption text-fg-muted">
                {t("upload.selectedCount", { count: files.length })}
              </p>
            </label>
            {files.length > 0 ? (
              <ul className="mt-2 flex flex-col gap-1">
                {files.map((file, index) => (
                  <li
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between gap-2 rounded-md border border-border bg-bg-elevated px-3 py-1.5 text-body-sm"
                  >
                    <span className="truncate">{file.name}</span>
                    <button
                      type="button"
                      className="text-fg-muted hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
                      onClick={() => removeFile(index)}
                      aria-label={`Remove ${file.name}`}
                    >
                      <X className="size-4" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </FormField>

          {submitError ? (
            <div
              role="alert"
              className="rounded-md border border-danger/40 bg-danger-soft px-3 py-2 text-body-sm text-danger-soft-foreground"
            >
              {t("submit.error")}
              {submitError.correlationId ? (
                <p className="mt-0.5 text-caption text-fg-muted">
                  {t("submit.correlationId", { id: submitError.correlationId })}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="mt-2 grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={saveDraft}
              disabled={submitting}
            >
              {t("submit.draft")}
            </Button>
            <LoadingButton
              type="submit"
              pending={submitting}
              pendingLabel={t("submit.saving")}
            >
              {t("submit.moderation")}
            </LoadingButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Trigger button kept exported so the dashboard header can compose its own. */
export function AddProductTrigger({ onClick }: { onClick: () => void }) {
  const t = useTranslations("addProduct");
  return (
    <Button onClick={onClick} className="flex items-center gap-2">
      <Plus aria-hidden="true" className="size-5" />
      <span>{t("trigger")}</span>
    </Button>
  );
}
