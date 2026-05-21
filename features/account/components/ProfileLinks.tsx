import { ArrowRight, BellRing, ListChecks } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

interface LinkCardProps {
  href: string;
  title: string;
  body: string;
  cta: string;
  icon: typeof BellRing;
}

function LinkCard({ href, title, body, cta, icon: Icon }: LinkCardProps) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between gap-4 rounded-lg border border-border bg-bg-elevated p-5 text-left transition-colors duration-fast ease-standard hover:bg-bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-10 items-center justify-center rounded-full bg-primary-50 text-primary-600">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div className="flex flex-col">
          <span className="text-body font-semibold text-fg">{title}</span>
          <span className="text-body-sm text-fg-muted">{body}</span>
        </div>
      </div>
      <span className="flex items-center gap-1 text-body-sm font-medium text-primary-600">
        {cta}
        <ArrowRight className="size-4" aria-hidden="true" />
      </span>
    </Link>
  );
}

export async function ProfileLinks() {
  const t = await getTranslations("account.links");
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <LinkCard
        href="/account/leads"
        title={t("leads.title")}
        body={t("leads.body")}
        cta={t("leads.cta")}
        icon={ListChecks}
      />
      <LinkCard
        href="/account/notifications"
        title={t("notifications.title")}
        body={t("notifications.body")}
        cta={t("notifications.cta")}
        icon={BellRing}
      />
    </div>
  );
}
