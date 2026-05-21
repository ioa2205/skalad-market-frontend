"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils/cn";

/**
 * Pill-style segmented switcher between /login and /register. Implemented as
 * router-pushed links (not local state) so the URL is the source of truth and
 * the user can deep-link to either tab.
 */
export function AuthTabs() {
  const t = useTranslations("auth.tabs");
  // usePathname is reliable from any client component depth.
  // useSelectedLayoutSegment returned null when called from inside a page,
  // making both /login and /register render "login" as active.
  const pathname = usePathname();
  const active: "login" | "register" = pathname?.startsWith("/register")
    ? "register"
    : "login";

  return (
    <nav
      aria-label={t("navLabel")}
      className="grid h-[47px] grid-cols-2 gap-1 rounded-full border border-chrome-border bg-bg-muted p-1"
    >
      <TabLink
        href="/login"
        active={active === "login"}
        label={t("login")}
        controls="auth-tab-login"
      />
      <TabLink
        href="/register"
        active={active === "register"}
        label={t("register")}
        controls="auth-tab-register"
      />
    </nav>
  );
}

function TabLink({
  href,
  active,
  label,
  controls,
}: {
  href: string;
  active: boolean;
  label: string;
  controls: string;
}) {
  return (
    <Link
      href={href}
      role="tab"
      aria-selected={active}
      aria-controls={controls}
      className={cn(
        "inline-flex h-full items-center justify-center whitespace-nowrap rounded-full px-4 text-body-sm font-medium",
        "transition-colors duration-fast ease-standard",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        active
          ? "border border-chrome-border bg-bg-elevated text-fg"
          : "text-fg-muted hover:text-fg",
      )}
    >
      {label}
    </Link>
  );
}
