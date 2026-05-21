"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";

import { ErrorState } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/errors";
import { log } from "@/lib/log";

export interface SellerRouteErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  /** Stable scope label for the structured log line. */
  scope: string;
}

/**
 * Shared error boundary body for every `app/(seller)/.../error.tsx` route.
 * Each route file is a 2-line wrapper that passes its scope through.
 * Surfaces the correlation id so users can quote it in support.
 */
export function SellerRouteError({
  error,
  reset,
  scope,
}: SellerRouteErrorProps) {
  const t = useTranslations();
  const correlationId =
    error instanceof ApiError ? error.correlationId : (error.digest ?? undefined);

  useEffect(() => {
    log.error("seller.route.boundary", {
      scope,
      message: error.message,
      digest: error.digest,
      correlationId,
    });
  }, [error, correlationId, scope]);

  return (
    <ErrorState
      title={t("feedback.errorDefault.title")}
      description={t("feedback.errorDefault.description")}
      correlationId={correlationId}
      correlationIdLabel={t("feedback.errorDefault.correlationId", {
        id: correlationId ?? "—",
      })}
      action={<Button onClick={reset}>{t("common.tryAgain")}</Button>}
    />
  );
}
