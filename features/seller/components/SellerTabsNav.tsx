"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils/cn";

const TAB_KEYS = [
  "overview",
  "products",
  "leads",
  "messages",
  "settings",
] as const;

type TabKey = (typeof TAB_KEYS)[number];

const TAB_HREF: Record<TabKey, string> = {
  overview: "/seller/overview",
  products: "/seller/products",
  leads: "/seller/leads",
  messages: "/seller/messages",
  settings: "/seller/settings",
};

function isTabActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export interface SellerTabsNavProps {
  /** Pass `false` to disable every tab (e.g. while company is in onboarding). */
  enabled?: boolean;
}

export function SellerTabsNav({ enabled = true }: SellerTabsNavProps) {
  const pathname = usePathname();
  const t = useTranslations("seller.dashboard.tabs");

  return (
    <nav
      aria-label={t("ariaLabel")}
      className="rounded-lg border border-border bg-bg-elevated"
    >
      <ul className="flex items-center gap-2 px-4 md:px-6">
        {TAB_KEYS.map((key) => {
          const href = TAB_HREF[key];
          const active = isTabActive(pathname, href);
          const label = t(`items.${key}`);
          return (
            <li key={key}>
              {enabled ? (
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative inline-flex h-14 items-center px-3 text-body-sm font-medium",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
                    active
                      ? "text-fg after:absolute after:inset-x-2 after:bottom-0 after:h-[2px] after:rounded-full after:bg-primary-600"
                      : "text-fg-muted hover:text-fg",
                  )}
                >
                  {label}
                </Link>
              ) : (
                <span
                  aria-disabled="true"
                  className="inline-flex h-14 cursor-not-allowed items-center px-3 text-body-sm font-medium text-fg-subtle"
                >
                  {label}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
