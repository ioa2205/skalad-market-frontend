"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

import { AuthStatus } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { log } from "@/lib/log";

export default function VerifyError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("auth.verify");
  const tCommon = useTranslations("common");
  const tCorrelation = useTranslations("auth");

  useEffect(() => {
    log.error("auth.verify.boundary", {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <AuthCard>
      <AuthStatus
        variant="error"
        title={t("errorTitle")}
        body={t("errorBody")}
        correlationId={
          error.digest
            ? tCorrelation("correlationId", { id: error.digest })
            : undefined
        }
        footer={
          <div className="flex gap-2">
            <Button variant="outline" onClick={reset}>
              {tCommon("tryAgain")}
            </Button>
            <Button asChild>
              <Link href="/login">{t("backToLogin")}</Link>
            </Button>
          </div>
        }
      />
    </AuthCard>
  );
}
