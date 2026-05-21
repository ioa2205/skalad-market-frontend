"use client";

import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId } from "react";

import { Money } from "@/components/locale";
import { MinioImage } from "@/components/media";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { QuantityStepper } from "@/features/product";

import type { CartItem } from "../schemas";

export interface CartLineItemProps {
  item: CartItem;
  onChangeQty: (productId: number, qty: number) => void;
  onRemove: (productId: number) => void;
}

export function CartLineItem({ item, onChangeQty, onRemove }: CartLineItemProps) {
  const t = useTranslations("cart.lineItem");
  const inputId = useId();

  const total = item.unitPrice !== null ? item.unitPrice * item.qty : null;

  return (
    <Card className="flex gap-4 rounded-[11.28px] p-[18px]">
      <div className="h-[122px] w-[127px] shrink-0 overflow-hidden rounded-[2.47px] bg-bg-muted">
        {item.primaryImage ? (
          <MinioImage
            src={item.primaryImage}
            alt={item.name}
            width={127}
            height={122}
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col">
            <h3 className="text-body font-semibold text-fg line-clamp-2">{item.name}</h3>
            {item.companyName ? (
              <p className="text-caption text-fg-muted">{item.companyName}</p>
            ) : null}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => onRemove(item.productId)}
            aria-label={t("removeAria", { name: item.name })}
          >
            <Trash2 aria-hidden="true" />
          </Button>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-3">
          <QuantityStepper
            inputId={inputId}
            value={item.qty}
            onChange={(next) => onChangeQty(item.productId, next)}
          />

          <div className="flex flex-col items-end">
            {total !== null ? (
              <Money
                amount={total}
                currency={item.currency}
                maximumFractionDigits={0}
                className="text-h4 font-semibold text-primary-600"
              />
            ) : (
              <span className="text-body-sm text-fg-muted">{t("negotiable")}</span>
            )}
            {item.unitPrice !== null ? (
              <span className="text-caption text-fg-muted">
                <Money
                  amount={item.unitPrice}
                  currency={item.currency}
                  maximumFractionDigits={0}
                />
                {t("unitPriceSuffix")}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </Card>
  );
}
