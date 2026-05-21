import { Globe, Mail, Phone } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Card } from "@/components/ui/card";

export interface CompanyContactsCardProps {
  phonePrimary: string;
  phoneSecondary?: string | null;
  website?: string | null;
}

export function CompanyContactsCard({
  phonePrimary,
  phoneSecondary,
  website,
}: CompanyContactsCardProps) {
  const t = useTranslations("company.profile.contacts");

  return (
    <Card className="flex flex-col gap-3 p-5">
      <h2 className="text-body font-semibold text-fg">{t("title")}</h2>
      <ul className="flex flex-col gap-3">
        <Row
          icon={Phone}
          label={t("phone")}
          value={phonePrimary}
          href={`tel:${phonePrimary}`}
        />
        {phoneSecondary ? (
          <Row
            icon={Phone}
            label={t("phoneSecondary")}
            value={phoneSecondary}
            href={`tel:${phoneSecondary}`}
          />
        ) : null}
        <Row
          icon={Mail}
          label={t("email")}
          value={null}
          fallback={t("emailPending")}
        />
        {website ? (
          <Row
            icon={Globe}
            label={t("website")}
            value={website}
            href={normalizeWebsite(website)}
          />
        ) : null}
      </ul>
    </Card>
  );
}

function normalizeWebsite(value: string): string {
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}

function Row({
  icon: Icon,
  label,
  value,
  href,
  fallback,
}: {
  icon: LucideIcon;
  label: string;
  value: string | null;
  href?: string;
  fallback?: string;
}) {
  const content = (
    <div className="flex min-w-0 flex-col">
      <span className="text-caption text-fg-subtle">{label}</span>
      <span className="truncate text-body-sm text-fg">
        {value ?? fallback ?? "—"}
      </span>
    </div>
  );

  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-bg-muted text-fg-muted">
        <Icon aria-hidden="true" className="size-4" />
      </span>
      {value && href ? (
        <a
          href={href}
          target={href.startsWith("http") ? "_blank" : undefined}
          rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
          className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        >
          {content}
        </a>
      ) : (
        content
      )}
    </li>
  );
}
