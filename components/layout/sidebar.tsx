"use client";

import {
  Box,
  Building2,
  ChevronsLeft,
  ChevronsRight,
  CircleDollarSign,
  House,
  PackagePlus,
  ShieldCheck,
  UserSquare,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

import { Logo } from "@/components/brand";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils/cn";
import { useSidebarStore } from "@/stores/sidebar";

interface NavItem {
  key:
    | "home"
    | "catalog"
    | "products"
    | "profile"
    | "companies"
    | "seller"
    | "tariffs";
  icon: LucideIcon;
  href: string;
  /** Phase 2 stubs — rendered as disabled buttons with a "Coming soon" tooltip. */
  comingSoon?: boolean;
}

// Figma navbar_1: vuesax/outline icons. Lucide equivalents:
//   home-2 → House, box-add → PackagePlus, 3d-cube-scan → Box,
//   user-square → UserSquare, buildings → Building2,
//   security-user → ShieldCheck, dollar-circle → CircleDollarSign.
const ITEMS: NavItem[] = [
  { key: "home", icon: House, href: "/" },
  { key: "catalog", icon: PackagePlus, href: "/catalog" },
  { key: "products", icon: Box, href: "/seller/products" },
  { key: "profile", icon: UserSquare, href: "/account", comingSoon: true },
  { key: "companies", icon: Building2, href: "/companies" },
  { key: "seller", icon: ShieldCheck, href: "/seller/overview" },
  { key: "tariffs", icon: CircleDollarSign, href: "/tariffs", comingSoon: true },
];

export function Sidebar() {
  const t = useTranslations("shell.sidebar");
  const pathname = usePathname();
  const collapsed = useSidebarStore((s) => s.collapsed);
  const hasHydrated = useSidebarStore((s) => s.hasHydrated);
  const toggle = useSidebarStore((s) => s.toggle);

  // Hold the server default until the persisted state hydrates so SSR
  // doesn't render the wrong width and snap on mount.
  const effectiveCollapsed = hasHydrated ? collapsed : false;

  return (
    <aside
      aria-label={t("label")}
      data-state={effectiveCollapsed ? "collapsed" : "expanded"}
      className={cn(
        "sticky top-0 flex h-screen shrink-0 flex-col border-r border-chrome-border",
        "transition-[width,background-color] duration-normal ease-standard",
        effectiveCollapsed
          ? "w-[64px] bg-bg-elevated"
          : "w-[280px] bg-chrome-sidebar",
      )}
    >
      <div
        className={cn(
          "flex h-16 shrink-0 items-center gap-[10px]",
          effectiveCollapsed ? "justify-center px-0" : "px-6",
        )}
      >
        <Link
          href="/"
          aria-label={t("goHome")}
          className="inline-flex items-center gap-[10px] rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        >
          <Logo variant={effectiveCollapsed ? "mark" : "full"} size="md" />
        </Link>
      </div>

      <div className="flex flex-1 flex-col gap-4 px-3 pb-4">
        <hr className="self-stretch border-t-[0.5px] border-chrome-divider" />

        <nav aria-label={t("navLabel")} className="flex flex-col gap-1">
          {ITEMS.map((item) => {
            const label = t(`items.${item.key}`);
            const active = isActive(pathname, item.href);
            return (
              <SidebarItem
                key={item.key}
                item={item}
                label={label}
                collapsed={effectiveCollapsed}
                active={active}
                comingSoonLabel={t("comingSoon")}
              />
            );
          })}
        </nav>

        <button
          type="button"
          onClick={toggle}
          aria-pressed={effectiveCollapsed}
          aria-label={effectiveCollapsed ? t("expand") : t("collapse")}
          className={cn(
            "mt-auto inline-flex size-10 items-center justify-center rounded-xl bg-bg-elevated text-chrome-icon",
            "transition-colors duration-fast ease-standard hover:bg-bg-muted",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
            effectiveCollapsed ? "self-center" : "self-end",
          )}
        >
          {effectiveCollapsed ? (
            <ChevronsRight className="size-5" />
          ) : (
            <ChevronsLeft className="size-5" />
          )}
        </button>
      </div>
    </aside>
  );
}

function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarItem({
  item,
  label,
  collapsed,
  active,
  comingSoonLabel,
}: {
  item: NavItem;
  label: string;
  collapsed: boolean;
  active: boolean;
  comingSoonLabel: string;
}) {
  const Icon = item.icon;

  const rowClass = cn(
    "group flex h-10 w-full items-center gap-3 rounded-xl",
    "text-[14px] font-normal leading-[18px] text-chrome-strong",
    "transition-colors duration-fast ease-standard",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
    item.comingSoon && "cursor-not-allowed opacity-60",
  );

  // Icon tile — 40×40, rounded-xl, white. Active gets a primary fill to
  // signal current page without breaking the Figma "white tile on FAFAFA"
  // language.
  const iconBoxClass = cn(
    "flex size-10 shrink-0 items-center justify-center rounded-xl",
    "transition-colors duration-fast ease-standard",
    active
      ? "bg-primary-600 text-fg-on-primary"
      : "bg-bg-elevated text-chrome-icon",
    !item.comingSoon &&
      !active &&
      "group-hover:bg-primary-50 group-hover:text-primary-700",
  );

  const inner = (
    <>
      <span className={iconBoxClass} aria-hidden="true">
        <Icon className="size-5" strokeWidth={1.5} />
      </span>
      {collapsed ? (
        <span className="sr-only">{label}</span>
      ) : (
        <span className="truncate">{label}</span>
      )}
    </>
  );

  if (item.comingSoon) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-disabled="true"
            aria-describedby={`tip-${item.key}`}
            className={rowClass}
            onClick={(event) => event.preventDefault()}
          >
            {inner}
          </button>
        </TooltipTrigger>
        <TooltipContent id={`tip-${item.key}`} side="right">
          {comingSoonLabel}
        </TooltipContent>
      </Tooltip>
    );
  }

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={rowClass}
          >
            {inner}
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={rowClass}
    >
      {inner}
    </Link>
  );
}
