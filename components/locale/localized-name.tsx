"use client";

import { useLocale } from "next-intl";
import type { HTMLAttributes } from "react";

/**
 * Some backend DTOs carry localized fields as `{ ru, uz, en }` objects.
 * <LocalizedName> picks the active locale, falling back to ru → en → first
 * non-empty string.
 */
export interface LocalizedNameProps extends HTMLAttributes<HTMLSpanElement> {
  value: string | { ru?: string; uz?: string; en?: string } | null | undefined;
  fallback?: string;
}

export function LocalizedName({ value, fallback = "", ...rest }: LocalizedNameProps) {
  const locale = useLocale();
  const text = pick(value, locale) ?? fallback;
  return <span {...rest}>{text}</span>;
}

function pick(
  value: LocalizedNameProps["value"],
  locale: string,
): string | undefined {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  const order: Array<"ru" | "uz" | "en"> = [
    locale as "ru" | "uz" | "en",
    "ru",
    "en",
    "uz",
  ];
  for (const key of order) {
    const candidate = value[key];
    if (candidate && candidate.length > 0) return candidate;
  }
  return undefined;
}
