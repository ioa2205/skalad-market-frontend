"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";

import { ErrorState } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/errors";
import { log } from "@/lib/log";

export default function AccountProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("account.profile");
  const correlationId =
    error instanceof ApiError ? error.correlationId : (error.digest ?? undefined);

  useEffect(() => {
    log.error("account.profile.route.boundary", {
      message: error.message,
      digest: error.digest,
      correlationId,
    });
  }, [error, correlationId]);

  return (
    <div className="mx-auto flex w-full max-w-3xl px-4 py-12">
      <ErrorState
        title={t("loadError.title")}
        description={t("loadError.body")}
        correlationId={correlationId}
        correlationIdLabel={t("loadError.correlationLabel")}
        action={<Button onClick={reset}>{t("loadError.retry")}</Button>}
        className="w-full"
      />
    </div>
  );
}
