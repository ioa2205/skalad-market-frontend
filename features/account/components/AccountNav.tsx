"use client";

import { ListChecks, BellRing, UserRound, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils/cn";

interface NavItem {
  href: string;
  labelKey: "profile" | "notifications" | "leads";
  icon: LucideIcon;
}

const ITEMS: NavItem[] = [
  { href: "/account", labelKey: "profile", icon: UserRound },
  { href: "/account/notifications", labelKey: "notifications", icon: BellRing },
  { href: "/account/leads", labelKey: "leads", icon: ListChecks },
];

function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/account") return pathname === "/account";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AccountNav() {
  const t = useTranslations("account.nav");
  const pathname = usePathname();

  return (
    <nav aria-label={t("label")} className="w-full">
      <ul className="flex flex-row gap-1 overflow-x-auto md:flex-col md:gap-2">
        {ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 whitespace-nowrap rounded-md px-3 py-2 text-body-sm font-medium",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
                  active
                    ? "bg-primary-50 text-primary-600"
                    : "text-fg hover:bg-bg-muted",
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                {t(item.labelKey)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
