"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";

import { VerifiedBadge } from "@/components/badges";
import { Money } from "@/components/locale";
import { MinioImage } from "@/components/media";
import { Card } from "@/components/ui/card";
import { AddToCartButton } from "@/features/cart";
import { FavoriteButton } from "@/features/favorites";
import type { ProductResponse } from "@/lib/api/schemas";
import { cn } from "@/lib/utils/cn";

export interface ProductCardProps {
  product: ProductResponse;
  /** Override company name (homepage doesn't return one — fall back to id). */
  companyName?: string;
  /** Whether the seller is a verified company. */
  verified?: boolean;
  className?: string;
}

/**
 * Used on home, catalog, favorites, similar-products, seller products list,
 * and the public company profile. Favorite + add-to-cart actions are wired
 * to the real Phase-4 features (optimistic /favorites toggle + Zustand
 * cart).
 */
export function ProductCard({
  product,
  companyName,
  verified,
  className,
}: ProductCardProps) {
  const t = useTranslations("productCard");

  const href = `/product/${product.slug}`;
  const numericPrice =
    typeof product.price === "string" ? Number(product.price) : product.price;

  return (
    <Card
      className={cn(
        "group relative flex min-h-[353px] flex-col gap-[18px] overflow-hidden rounded-[12px] border-chrome-input-border bg-bg-elevated p-[18px] shadow-none transition-colors duration-fast ease-standard",
        "hover:border-border-strong focus-within:border-border-strong",
        className,
      )}
    >
      <Link
        href={href}
        aria-label={t("openLabel", { name: product.name })}
        className="absolute inset-0 z-0 rounded-[12px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
      />
      <div className="relative aspect-[246/220] w-full overflow-hidden rounded-[12px] bg-chrome-shortcut">
        {product.images && product.images.length > 0 ? (
          <MinioImage
            src={product.images[0]!.url}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover"
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex h-full w-full items-center justify-center text-fg-subtle"
          >
            <ProductPlaceholder />
          </div>
        )}
        <FavoriteButton
          productId={product.id}
          className="absolute right-[10px] top-[10px] z-10 size-[34px] rounded-lg border border-chrome-input-border bg-bg-elevated shadow-none"
        />
      </div>

      <div className="relative flex flex-1 flex-col gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-start justify-between gap-[5px]">
            <h3 className="text-body font-medium leading-[140%] text-fg line-clamp-2">
              {product.name}
            </h3>
            {verified ? (
              <VerifiedBadge
                label={t("verified")}
                ariaLabel={t("verifiedLabel")}
                className="shrink-0 rounded-sm px-1 py-0.5 text-xs font-normal"
              />
            ) : null}
          </div>
          <p className="text-caption text-fg-muted">
            {companyName ?? `#${product.companyId}`}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3">
          <PriceLabel
            priceType={product.priceType}
            amount={numericPrice ?? null}
            currency={product.currency}
          />
          <AddToCartButton
            product={product}
            {...(companyName !== undefined ? { companyName } : {})}
            size="sm"
            variant="primary"
            className="h-[27px] shrink-0 rounded-full px-3 text-xs"
          />
        </div>
      </div>
    </Card>
  );
}

function PriceLabel({
  priceType,
  amount,
  currency,
}: {
  priceType: ProductResponse["priceType"];
  amount: number | null;
  currency: ProductResponse["currency"];
}) {
  const t = useTranslations("productCard.price");

  if (priceType === "NEGOTIABLE" || amount === null || Number.isNaN(amount)) {
    return <span className="text-caption text-fg-muted">{t("negotiable")}</span>;
  }
  return (
    <span className="flex items-baseline gap-1 text-caption text-fg-muted">
      {priceType === "FROM_PRICE" ? <span>{t("fromPrefix")}</span> : null}
      <Money
        amount={amount}
        currency={currency}
        maximumFractionDigits={0}
        className="text-caption text-fg-muted"
      />
    </span>
  );
}

function ProductPlaceholder() {
  return (
    <svg
      className="size-12"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="22" cy="34" r="8" stroke="currentColor" strokeWidth="2" />
      <path d="M30 42L40 26L50 42H30Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <rect x="14" y="14" width="14" height="14" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
