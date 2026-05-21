"use client";

import { useTranslations } from "next-intl";

import { ApiError } from "@/lib/api/errors";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations();
  const correlationId =
    error instanceof ApiError ? error.correlationId : (error.digest ?? undefined);

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-h2 font-semibold" role="alert">
        {correlationId ? t("errors.withId", { id: correlationId }) : t("errors.generic")}
      </h1>
      <button
        type="button"
        onClick={reset}
        className="rounded-md border border-border bg-bg-elevated px-4 py-2 text-body-sm font-medium text-fg hover:bg-bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {t("common.tryAgain")}
      </button>
    </main>
  );
}
