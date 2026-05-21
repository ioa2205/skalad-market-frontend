import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { ErrorState } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import { NotificationPreferencesForm } from "@/features/notification";
import { fetchPreferencesServer } from "@/features/notification/api/notification.server";

export const dynamic = "force-dynamic";

export default async function NotificationPreferencesPage() {
  const t = await getTranslations("notifications.preferences");
  const result = await fetchPreferencesServer();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-6 md:px-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-h1 font-bold text-fg">{t("title")}</h1>
        <p className="text-body-sm text-fg-muted">{t("subtitle")}</p>
      </header>

      {result.error || !result.preferences ? (
        <ErrorState
          title={t("loadError.title")}
          description={t("loadError.body")}
          {...(result.error?.correlationId
            ? {
                correlationId: result.error.correlationId,
                correlationIdLabel: t("loadError.correlationLabel"),
              }
            : {})}
          action={
            <Button asChild variant="secondary">
              <Link href="/account/notifications">{t("save")}</Link>
            </Button>
          }
        />
      ) : (
        <NotificationPreferencesForm initial={result.preferences} />
      )}
    </div>
  );
}
