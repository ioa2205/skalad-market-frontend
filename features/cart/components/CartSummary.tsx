"use client";

import { Send, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";

import { Money } from "@/components/locale";
import { LoadingButton } from "@/components/feedback";
import { Card } from "@/components/ui/card";
import { StartChatButton } from "@/features/chat";

import type { CartItem } from "../schemas";
import { lineTotal, totalsByCurrency } from "../selectors";

export interface CartSummaryProps {
  items: CartItem[];
  onSubmit: () => void;
  submitting?: boolean;
  disabled?: boolean;
}

export function CartSummary({
  items,
  onSubmit,
  submitting = false,
  disabled = false,
}: CartSummaryProps) {
  const t = useTranslations("cart.summary");

  const totals = totalsByCurrency(items);

  // The "Написать продавцу" CTA only makes sense when every line shares a
  // single company — otherwise we can't pick a thread target. With multiple
  // companies the cart still fans out to one lead each on submit.
  const sharedCompanyId = items.length > 0
    ? items.every((item) => item.companyId === items[0]?.companyId)
      ? items[0]?.companyId
      : undefined
    : undefined;

  return (
    <Card className="sticky top-20 flex flex-col gap-4 p-5">
      <h2 className="text-h3 font-semibold text-fg">{t("title")}</h2>

      <ul className="flex flex-col gap-2">
        {items.map((item) => {
          const total = lineTotal(item);
          return (
            <li
              key={item.productId}
              className="flex items-baseline justify-between gap-3 text-body-sm"
            >
              <span className="text-fg-muted line-clamp-1">{item.name}</span>
              {total !== null ? (
                <Money
                  amount={total}
                  currency={item.currency}
                  maximumFractionDigits={0}
                  className="font-medium text-fg"
                />
              ) : (
                <span className="text-fg-muted">{t("negotiable")}</span>
              )}
            </li>
          );
        })}
      </ul>

      <div className="border-t border-border pt-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-body font-semibold text-fg">{t("total")}</span>
          <div className="flex flex-col items-end gap-0.5">
            {totals.length === 0 ? (
              <span className="text-body-sm text-fg-muted">{t("negotiable")}</span>
            ) : (
              totals.map((total) => (
                <Money
                  key={total.currency}
                  amount={total.amount}
                  currency={total.currency}
                  maximumFractionDigits={0}
                  className="text-h3 font-semibold text-primary-600"
                />
              ))
            )}
          </div>
        </div>
        <p className="mt-2 text-caption text-fg-muted">{t("totalNegotiationNote")}</p>
      </div>

      <div className="flex flex-col gap-2">
        <LoadingButton
          variant="primary"
          size="lg"
          pending={submitting}
          pendingLabel={t("submitting")}
          onClick={onSubmit}
          disabled={disabled || items.length === 0}
        >
          <Send aria-hidden="true" />
          {t("submit")}
        </LoadingButton>
        {sharedCompanyId !== undefined ? (
          <StartChatButton variant="secondary" sellerCompanyId={sharedCompanyId}>
            {t("messageSeller")}
          </StartChatButton>
        ) : null}
      </div>

      <div className="flex gap-3">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-success" aria-hidden="true" />
        <div className="flex flex-col gap-1">
          <p className="text-body-sm font-semibold text-fg">{t("trustTitle")}</p>
          <p className="text-caption text-fg-muted">{t("trustBody")}</p>
        </div>
      </div>
    </Card>
  );
}
