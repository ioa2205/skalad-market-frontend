"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";

import { ErrorState } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/errors";
import { log } from "@/lib/log";

export default function CartError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations();
  const correlationId =
    error instanceof ApiError ? error.correlationId : (error.digest ?? undefined);

  useEffect(() => {
    log.error("cart.route.boundary", {
      message: error.message,
      digest: error.digest,
      correlationId,
    });
  }, [error, correlationId]);

  return (
    <div className="mx-auto flex w-full max-w-2xl px-4 py-12">
      <ErrorState
        title={t("feedback.errorDefault.title")}
        description={t("feedback.errorDefault.description")}
        correlationId={correlationId}
        correlationIdLabel={t("feedback.errorDefault.correlationId", {
          id: correlationId ?? "—",
        })}
        action={<Button onClick={reset}>{t("common.tryAgain")}</Button>}
        className="w-full"
      />
    </div>
  );
}
