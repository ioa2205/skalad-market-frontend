"use client";

import { useLocale } from "next-intl";

import { cn } from "@/lib/utils/cn";

export interface MoneyProps {
  amount: number;
  currency: string;
  /** Render as `<span>` (default) or wrap in custom element. */
  className?: string;
  /** Force a particular locale; otherwise the active next-intl locale. */
  locale?: string;
  maximumFractionDigits?: number;
  minimumFractionDigits?: number;
}

export function Money({
  amount,
  currency,
  className,
  locale,
  maximumFractionDigits,
  minimumFractionDigits,
}: MoneyProps) {
  const activeLocale = useLocale();
  const formatter = new Intl.NumberFormat(locale ?? activeLocale, {
    style: "currency",
    currency,
    maximumFractionDigits,
    minimumFractionDigits,
  });
  return (
    <span className={cn("tabular-nums", className)} data-currency={currency}>
      {formatter.format(amount)}
    </span>
  );
}
