"use client";

import { Check } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { toast } from "@/components/ui/sonner";
import { ApiError } from "@/lib/api/errors";
import { locales, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils/cn";

import { setLocaleCookie } from "../api/account.client";

export function LanguageSwitcher() {
  const t = useTranslations("account.language");
  const current = useLocale() as Locale;
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const choose = (next: Locale) => {
    if (next === current || pending) return;
    startTransition(async () => {
      try {
        await setLocaleCookie(next);
        router.refresh();
        toast.success(t("savedToast"));
      } catch (error) {
        const apiError = error instanceof ApiError ? error : null;
        toast.error(t("errorToast"), {
          ...(apiError?.correlationId
            ? { description: t("errorWithId", { id: apiError.correlationId }) }
            : {}),
        });
      }
    });
  };

  return (
    <div
      role="radiogroup"
      aria-label={t("title")}
      className="grid grid-cols-1 gap-2 sm:grid-cols-3"
    >
      {locales.map((locale) => {
        const selected = locale === current;
        return (
          <button
            key={locale}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={pending}
            onClick={() => choose(locale)}
            className={cn(
              "flex items-center justify-between gap-3 rounded-md border px-4 py-3 text-left text-body-sm font-medium transition-colors duration-fast ease-standard",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
              "disabled:cursor-not-allowed disabled:opacity-60",
              selected
                ? "border-primary-200 bg-primary-50 text-primary-600"
                : "border-border bg-bg-elevated text-fg hover:bg-bg-muted",
            )}
          >
            <span>{t(`options.${locale}`)}</span>
            {selected ? (
              <Check className="size-4 text-primary-600" aria-hidden="true" />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
