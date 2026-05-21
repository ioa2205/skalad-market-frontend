"use client";

import { formatDistanceToNow } from "date-fns";
import { enUS, ru, uz } from "date-fns/locale";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";

const LOCALE_MAP = {
  ru,
  uz,
  en: enUS,
} as const;

type SupportedLocale = keyof typeof LOCALE_MAP;

export interface RelativeTimeProps {
  /** ISO date string or Date instance. */
  value: string | Date;
  className?: string;
  /** Re-render cadence in ms. Defaults to 60s. */
  refreshIntervalMs?: number;
  addSuffix?: boolean;
}

export function RelativeTime({
  value,
  className,
  refreshIntervalMs = 60_000,
  addSuffix = true,
}: RelativeTimeProps) {
  const locale = useLocale() as SupportedLocale;
  const dateLocale = LOCALE_MAP[locale] ?? ru;
  const date = typeof value === "string" ? new Date(value) : value;
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), refreshIntervalMs);
    return () => clearInterval(id);
  }, [refreshIntervalMs]);

  return (
    <time
      className={className}
      dateTime={date.toISOString()}
      title={date.toLocaleString(locale)}
    >
      {formatDistanceToNow(date, { addSuffix, locale: dateLocale })}
    </time>
  );
}
