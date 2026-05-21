"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";

import { ErrorState } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/errors";
import { log } from "@/lib/log";

export default function ChatThreadError({
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
    log.error("chats.thread.route.boundary", {
      message: error.message,
      digest: error.digest,
      correlationId,
    });
  }, [error, correlationId]);

  return (
    <div className="flex h-full items-center justify-center p-6">
      <ErrorState
        title={t("chats.messages.error.title")}
        description={t("chats.messages.error.body")}
        correlationId={correlationId}
        correlationIdLabel={t("chats.messages.error.correlationLabel")}
        action={<Button onClick={reset}>{t("common.tryAgain")}</Button>}
        className="w-full max-w-md"
      />
    </div>
  );
}
