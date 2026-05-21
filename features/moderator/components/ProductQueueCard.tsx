"use client";

import { Check, Package, X } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { toast } from "sonner";

import { ApiError } from "@/lib/api/errors";
import type { ProductResponse } from "@/lib/api/schemas/product";

import { useApproveProduct, useRejectProduct } from "../api/moderator.client";

import { ModeratorActionButton } from "./ModeratorActionButton";

export interface ProductQueueCardProps {
  product: ProductResponse;
}

const CURRENCY_SYMBOL: Record<string, string> = {
  USD: "$",
  UZS: "UZS",
};

function formatPrice(
  price: ProductResponse["price"],
  currency: ProductResponse["currency"],
): string {
  if (price === null || price === undefined) return "—";
  const symbol = CURRENCY_SYMBOL[currency] ?? currency;
  const value = typeof price === "number" ? price : Number(price);
  if (!Number.isFinite(value)) return `${symbol} ${price}`;
  return currency === "USD"
    ? `$${value.toLocaleString()}`
    : `${value.toLocaleString()} ${symbol}`;
}

/**
 * One pending product in the moderation queue — Figma-exact
 * (moderator_dashboard_2): 127×86 thumbnail, name + description/warnings +
 * date, and a right column with the price stacked over the approve/reject
 * buttons.
 *
 * Approve/Reject mutate via the moderator client and rely on its query-key
 * invalidation to refresh the list — no manual splice here.
 */
export function ProductQueueCard({ product }: ProductQueueCardProps) {
  const t = useTranslations("moderator");
  const tCommon = useTranslations("moderator.common");
  const format = useFormatter();
  const approve = useApproveProduct();
  const reject = useRejectProduct();

  const description = product.description ?? "";
  const missingDescription = description.trim().length === 0;
  const missingPhoto = !product.images || product.images.length === 0;
  const busy = approve.isPending || reject.isPending;
  const date = formatDate(product.createdAt, format);

  const onApprove = async () => {
    try {
      await approve.mutateAsync({ id: product.id });
      toast.success(t("products.approveSuccess"));
    } catch (error) {
      reportError(error, tCommon);
    }
  };

  const onReject = async () => {
    try {
      await reject.mutateAsync({ id: product.id });
      toast.success(t("products.rejectSuccess"));
    } catch (error) {
      reportError(error, tCommon);
    }
  };

  return (
    <article className="flex flex-col gap-3 rounded-mod border border-mod-border bg-bg-elevated p-3 md:flex-row md:items-center md:justify-between">
      <div className="flex min-w-0 gap-3">
        <div
          className="flex h-[86px] w-[127px] shrink-0 items-center justify-center overflow-hidden rounded-mod-xs bg-mod-thumb text-mod-meta"
          aria-hidden="true"
        >
          {product.images?.[0]?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.images[0].url}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            <Package className="size-6" />
          )}
        </div>
        <div className="flex min-w-0 flex-col gap-1">
          <p className="truncate text-body-sm font-bold text-chrome-strong">
            {product.name}
          </p>
          {missingDescription ? null : (
            <p className="line-clamp-1 text-body-sm text-fg">{description}</p>
          )}
          {missingDescription || missingPhoto ? (
            <div className="flex flex-wrap items-center gap-2">
              {missingDescription ? (
                <span className="inline-flex h-[22px] items-center rounded-mod-xs bg-mod-badge-amber/20 px-2 text-caption font-medium text-mod-btn-orange">
                  {t("products.noDescriptionBadge")}
                </span>
              ) : null}
              {missingPhoto ? (
                <span className="inline-flex h-[22px] items-center rounded-mod-xs bg-mod-badge-amber/20 px-2 text-caption font-medium text-mod-btn-orange">
                  {t("products.noPhotoBadge")}
                </span>
              ) : null}
            </div>
          ) : null}
          {date ? (
            <span className="text-caption text-mod-meta">{date}</span>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-4">
        <p className="text-[24px] font-bold leading-none text-primary-600">
          {formatPrice(product.price ?? null, product.currency)}
        </p>
        <div className="flex items-center gap-[13px]">
          <ModeratorActionButton
            tone="green"
            className="w-[121px]"
            onClick={onApprove}
            pending={approve.isPending}
            disabled={busy}
          >
            <Check aria-hidden="true" />
            {tCommon("approve")}
          </ModeratorActionButton>
          <ModeratorActionButton
            tone="red"
            className="w-[126px]"
            onClick={onReject}
            pending={reject.isPending}
            disabled={busy}
          >
            <X aria-hidden="true" />
            {tCommon("reject")}
          </ModeratorActionButton>
        </div>
      </div>
    </article>
  );
}

function reportError(
  error: unknown,
  tCommon: ReturnType<typeof useTranslations>,
) {
  const apiError = error instanceof ApiError ? error : null;
  toast.error(tCommon("actionError"), {
    ...(apiError?.correlationId ? { description: apiError.correlationId } : {}),
  });
}

function formatDate(
  iso: string | null | undefined,
  format: ReturnType<typeof useFormatter>,
): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return format.dateTime(d, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
