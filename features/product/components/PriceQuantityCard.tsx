"use client";

import {
  Eye,
  Heart,
  Phone,
  Share2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";

import { Money } from "@/components/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { AddToCartButton } from "@/features/cart";
import { StartChatButton } from "@/features/chat";
import { cn } from "@/lib/utils/cn";

import { PriceBlock } from "./PriceBlock";
import { QuantityStepper } from "./QuantityStepper";

type PriceType = "FIXED" | "FROM_PRICE" | "NEGOTIABLE";
type Currency = "UZS" | "USD";

export interface PriceQuantityCardProps {
  productId: number;
  productName: string;
  productSlug: string;
  /** Company that owns this product — required so cart submit can group leads per company. */
  companyId: number;
  companyName?: string;
  /** Optional primary image URL — passed into the cart so the cart line shows a thumbnail. */
  primaryImage?: string;
  priceType: PriceType;
  amount: number | null;
  currency: Currency;
  /** Optional unit ("ton" / "kg" / "piece" …). */
  unit?: string | undefined;
  /** Optional minimum order — clamps the stepper minimum and shows a hint. */
  minOrder?: number | undefined;
  /** Real `tel:` number from /companies/{slug}; if absent the button is hidden. */
  sellerPhone?: string | undefined;
  /** Category name shown as a badge at the top of the card. */
  categoryName?: string | undefined;
  /** Total view count rendered next to the badge. */
  views?: number | undefined;
  className?: string;
}

export function PriceQuantityCard({
  productId,
  productName,
  productSlug,
  companyId,
  companyName,
  primaryImage,
  priceType,
  amount,
  currency,
  unit,
  minOrder,
  sellerPhone,
  categoryName,
  views,
  className,
}: PriceQuantityCardProps) {
  const t = useTranslations("productDetail");
  const tShare = useTranslations("productDetail.cta");
  const inputId = useId();

  const minQty = minOrder && minOrder > 0 ? minOrder : 1;
  const [quantity, setQuantity] = useState<number>(minQty);

  const numericAmount =
    amount !== null && Number.isFinite(amount) ? (amount as number) : null;
  const showTotal = priceType !== "NEGOTIABLE" && numericAmount !== null;
  const total = useMemo(
    () => (numericAmount !== null ? numericAmount * quantity : null),
    [numericAmount, quantity],
  );

  const onAddToFavorites = () => {
    toast.message(t("cta.addToFavorites"), {
      description: t("contactSeller.comingSoonBody"),
    });
  };
  const onShare = async () => {
    const shareUrl =
      typeof window !== "undefined"
        ? new URL(`/product/${productSlug}`, window.location.origin).toString()
        : `/product/${productSlug}`;
    try {
      if (
        typeof navigator !== "undefined" &&
        typeof navigator.share === "function"
      ) {
        await navigator.share({ title: productName, url: shareUrl });
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
      toast.success(tShare("shareCopied"));
    } catch {
      toast.error(tShare("shareFailed"));
    }
  };

  const inStockLabel = t("stock.inStock");

  return (
    <Card className={cn("flex flex-col gap-[18px] rounded-xl p-[18px]", className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex h-[22px] items-center rounded px-2 text-[12px] font-medium bg-info-soft text-info-soft-foreground">
          {inStockLabel}
        </span>
        {typeof views === "number" ? (
          <span className="inline-flex items-center gap-1 text-caption text-fg-muted">
            <Eye aria-hidden="true" className="size-3.5" />
            {t("views", { count: views })}
          </span>
        ) : null}
      </div>

      {categoryName ? (
        <Badge variant="primary" className="self-start">
          {categoryName}
        </Badge>
      ) : null}

      <h2 className="text-body font-semibold text-fg">{productName}</h2>

      <PriceBlock
        priceType={priceType}
        amount={numericAmount}
        currency={currency}
        unit={unit}
        minOrder={minOrder}
      />

      <QuantityStepper
        inputId={inputId}
        value={quantity}
        onChange={setQuantity}
        min={minQty}
        className="gap-2"
        inputClassName="w-full flex-1"
      />

      {showTotal && total !== null ? (
        <p
          className="inline-flex items-baseline gap-1 text-body-sm text-fg-muted"
          aria-live="polite"
        >
          <span>{t("price.totalLabel")}:</span>
          <Money
            amount={total}
            currency={currency}
            maximumFractionDigits={0}
            className="font-semibold text-fg"
          />
        </p>
      ) : null}

      <div className="flex flex-col gap-[13px]">
        <AddToCartButton
          product={{
            id: productId,
            slug: productSlug,
            name: productName,
            companyId,
            currency,
            ...(numericAmount !== null ? { price: numericAmount } : { price: null }),
            ...(primaryImage
              ? { images: [{ id: "primary", url: primaryImage, is_primary: true }] }
              : {}),
          }}
          {...(companyName !== undefined ? { companyName } : {})}
          quantity={quantity}
          size="md"
          variant="primary"
          label={t("cta.addToCart")}
          className="h-[47px] rounded-2xl"
        />
        <StartChatButton
          variant="secondary"
          sellerCompanyId={companyId}
          productId={productId}
          className="h-[47px] rounded-2xl border border-catalog-control-border bg-bg-elevated text-fg hover:bg-bg-muted"
        >
          {t("cta.contactSeller")}
        </StartChatButton>
        {sellerPhone ? (
          <Button
            variant="secondary"
            asChild
            className="h-[47px] rounded-2xl border border-catalog-control-border bg-bg-elevated text-fg hover:bg-bg-muted"
          >
            <a href={`tel:${sellerPhone.replace(/\s+/g, "")}`}>
              <Phone aria-hidden="true" />
              {sellerPhone}
            </a>
          </Button>
        ) : null}
        <Button
          variant="secondary"
          onClick={onAddToFavorites}
          className="h-[47px] rounded-2xl border border-catalog-control-border bg-bg-elevated text-fg hover:bg-bg-muted"
        >
          <Heart aria-hidden="true" />
          {t("cta.addToFavorites")}
        </Button>
        <Button
          variant="outline"
          onClick={onShare}
          className="h-[47px] rounded-2xl border border-catalog-control-border bg-bg-elevated text-fg hover:bg-bg-muted"
        >
          <Share2 aria-hidden="true" />
          {tShare("share")}
        </Button>
      </div>
    </Card>
  );
}
