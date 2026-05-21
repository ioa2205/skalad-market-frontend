"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";

import { ErrorState } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import { log } from "@/lib/log";

export default function LoginError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations();

  useEffect(() => {
    log.error("auth.login.boundary", {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <ErrorState
      title={t("errors.generic")}
      description={
        error.digest
          ? t("errors.withId", { id: error.digest })
          : undefined
      }
      action={<Button onClick={reset}>{t("common.tryAgain")}</Button>}
    />
  );
}
