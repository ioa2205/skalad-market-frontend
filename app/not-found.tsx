import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations();
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-h2 font-semibold">{t("errors.notFound")}</h1>
      <Link
        href="/"
        className="rounded-md border border-border bg-bg-elevated px-4 py-2 text-body-sm font-medium text-fg hover:bg-bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {t("common.backHome")}
      </Link>
    </main>
  );
}
