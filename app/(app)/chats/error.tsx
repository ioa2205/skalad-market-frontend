"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";

import { ErrorState } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/errors";
import { log } from "@/lib/log";

export default function ChatsError({
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
    log.error("chats.route.boundary", {
      message: error.message,
      digest: error.digest,
      correlationId,
    });
  }, [error, correlationId]);

  return (
    <div className="mx-auto flex w-full max-w-2xl px-4 py-12">
      <ErrorState
        title={t("chats.list.error.title")}
        description={t("chats.list.error.body")}
        correlationId={correlationId}
        correlationIdLabel={t("chats.list.error.correlationLabel")}
        action={<Button onClick={reset}>{t("common.tryAgain")}</Button>}
        className="w-full"
      />
    </div>
  );
}
