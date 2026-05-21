"use client";

import { ShoppingCart } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button, type ButtonProps } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import type { ProductResponse } from "@/lib/api/schemas";
import { cn } from "@/lib/utils/cn";

import { useCartStore } from "../store";

export interface AddToCartButtonProps extends Omit<ButtonProps, "onClick"> {
  product: Pick<
    ProductResponse,
    "id" | "slug" | "name" | "price" | "currency" | "companyId" | "images"
  >;
  /** Override company name (cart needs it for the per-company group label). */
  companyName?: string;
  /** Quantity to add — defaults to 1 (used by ProductCard); product detail
   * passes the stepper value. */
  quantity?: number;
  /** Hide the inline label, e.g. on cards where space is tight. */
  iconOnly?: boolean;
  label?: string;
}

export function AddToCartButton({
  product,
  companyName,
  quantity = 1,
  iconOnly = false,
  label,
  className,
  ...rest
}: AddToCartButtonProps) {
  const t = useTranslations("productCard.cart");
  const add = useCartStore((s) => s.add);

  const onClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const numericPrice =
      typeof product.price === "string"
        ? Number(product.price)
        : (product.price ?? null);
    const unitPrice =
      numericPrice !== null && Number.isFinite(numericPrice) ? numericPrice : null;
    const primary = product.images?.find((img) => img.is_primary) ?? product.images?.[0];

    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      companyId: product.companyId,
      ...(companyName ? { companyName } : {}),
      ...(primary ? { primaryImage: primary.url } : {}),
      unitPrice,
      currency: product.currency,
      qty: quantity,
    });

    toast.success(t("addedToast", { name: product.name }), {
      description: t("addedToastDescription"),
    });
  };

  return (
    <Button
      onClick={onClick}
      className={cn("relative z-10", className)}
      {...rest}
    >
      <ShoppingCart aria-hidden="true" />
      {!iconOnly ? (
        <span className="hidden sm:inline">{label ?? t("add")}</span>
      ) : null}
    </Button>
  );
}
