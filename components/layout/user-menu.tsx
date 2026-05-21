"use client";

import {
  Building2,
  ChevronDown,
  Globe,
  Languages,
  LayoutGrid,
  LayoutPanelTop,
  LogOut,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";

import { UserAvatar } from "@/components/media";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/sonner";
import { setLocaleCookie, usePhoto } from "@/features/account/api/account.client";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { useSession } from "@/features/auth/hooks/useSession";
import { ApiError } from "@/lib/api/errors";
import { locales, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils/cn";

type RoleLabelKey = "admin" | "moderator" | "seller" | "buyer";

const ROLE_KEY = {
  SUPER_ADMIN: "admin",
  ADMIN: "admin",
  MODERATOR: "moderator",
  SELLER: "seller",
  BUYER: "buyer",
} as const satisfies Record<string, RoleLabelKey>;

const MODERATOR_ROLES = new Set(["ADMIN", "SUPER_ADMIN", "MODERATOR"]);

function useLocaleSwitcher() {
  const t = useTranslations("account.language");
  const current = useLocale() as Locale;
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const choose = (next: Locale) => {
    if (next === current || pending) return;
    startTransition(async () => {
      try {
        await setLocaleCookie(next);
        router.refresh();
        toast.success(t("savedToast"));
      } catch (error) {
        const apiError = error instanceof ApiError ? error : null;
        toast.error(t("errorToast"), {
          ...(apiError?.correlationId
            ? { description: t("errorWithId", { id: apiError.correlationId }) }
            : {}),
        });
      }
    });
  };

  return { current, choose, pending };
}

export function UserMenu() {
  const t = useTranslations("shell.userMenu");
  const tLang = useTranslations("account.language");
  const session = useSession();
  const logout = useLogout();
  const photo = usePhoto({ enabled: Boolean(session.data) });
  const { current: currentLocale, choose: chooseLocale, pending: localePending } =
    useLocaleSwitcher();

  if (session.isPending && !session.data) {
    return <Skeleton className="h-10 w-32 rounded-full" />;
  }

  const data = session.data;
  const photoUrl = photo.data?.photoId
    ? `/api/proxy/api/v1/attach/open/${encodeURIComponent(photo.data.photoId)}`
    : undefined;
  if (!data) {
    return (
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger
            disabled={localePending}
            aria-label={tLang("title")}
            className="inline-flex h-[38px] items-center gap-1.5 rounded-full border border-chrome-input-border bg-bg-elevated px-3 text-[13px] font-semibold tracking-[-0.01em] text-chrome-strong transition-colors duration-fast ease-standard hover:bg-bg-muted hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-60"
          >
            <Globe className="size-4 text-chrome-icon" aria-hidden="true" />
            <span>{currentLocale.toUpperCase()}</span>
            <ChevronDown className="size-3 text-chrome-icon" aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-44 p-1.5">
            <DropdownMenuLabel className="px-3 py-1.5 text-caption font-semibold text-fg-subtle">
              {tLang("title")}
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-1" />
            <div className="flex flex-col gap-0.5">
              {locales.map((locale) => (
                <DropdownMenuItem
                  key={locale}
                  disabled={localePending}
                  onSelect={() => chooseLocale(locale as Locale)}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-md px-3 py-2 text-[13px] font-medium transition-colors cursor-pointer",
                    currentLocale === locale
                      ? "bg-primary-50 text-primary-700 font-semibold focus:bg-primary-50 focus:text-primary-700"
                      : "text-fg hover:bg-bg-muted focus:bg-bg-muted"
                  )}
                >
                  <span>{tLang(`options.${locale}`)}</span>
                  <span
                    className={cn(
                      "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider",
                      currentLocale === locale
                        ? "bg-primary-100 text-primary-800"
                        : "bg-bg-muted text-fg-subtle"
                    )}
                  >
                    {locale}
                  </span>
                </DropdownMenuItem>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        <Link
          href="/register"
          className="rounded-sm px-2 text-body-sm font-medium text-fg transition-colors duration-fast ease-standard hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        >
          {t("register")}
        </Link>
      </div>
    );
  }

  const primaryRole = data.roles.find(
    (role): role is keyof typeof ROLE_KEY => role in ROLE_KEY,
  );
  const roleKey: RoleLabelKey = primaryRole ? ROLE_KEY[primaryRole] : "buyer";
  const displayName = data.username ?? "—";
  const roleSet = new Set(data.roles);
  const canSee = {
    sellerPanel: roleSet.has("SELLER"),
    moderatorPanel: data.roles.some((role) => MODERATOR_ROLES.has(role)),
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex h-12 items-center gap-3 rounded-full border border-chrome-input-border bg-bg-elevated px-4 text-chrome-strong transition-colors duration-fast ease-standard hover:bg-bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        aria-label={t("openLabel", { name: displayName })}
      >
        <div className="flex items-center gap-2">
          <span className="inline-flex size-10 items-center justify-center overflow-hidden rounded-full border border-chrome-avatar-ring text-chrome-avatar-fg">
            <UserAvatar name={displayName} src={photoUrl} size="sm" />
          </span>
          <div className="hidden flex-col items-start gap-[3px] text-left md:flex">
            <span className="text-[14px] font-semibold leading-none tracking-[-0.01em] text-chrome-strong">
              {displayName}
            </span>
            <span className="text-[13px] font-medium leading-none tracking-[-0.02em] text-chrome-meta">
              {t(`role.${roleKey}` as const)}
            </span>
          </div>
        </div>
        <ChevronDown
          className="size-4 text-chrome-icon"
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-64">
        <DropdownMenuLabel className="flex items-center gap-3 py-2">
          <UserAvatar name={displayName} src={photoUrl} size="sm" />
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate font-medium text-fg">{displayName}</span>
            <span className="truncate text-caption font-normal text-fg-muted">
              {t(`role.${roleKey}` as const)}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {canSee.sellerPanel ? (
          <DropdownMenuItem asChild>
            <Link href="/seller/overview">
              <LayoutGrid className="size-4" />
              {t("sellerPanel")}
            </Link>
          </DropdownMenuItem>
        ) : null}
        {canSee.moderatorPanel ? (
          <DropdownMenuItem asChild>
            <Link href="/moderator">
              <LayoutPanelTop className="size-4" />
              {t("moderatorPanel")}
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem asChild>
          <Link href="/account">
            <Building2 className="size-4" />
            {t("companyProfile")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account/notifications">
            <Settings className="size-4" />
            {t("settings")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="cursor-pointer">
            <Languages className="size-4" />
            {tLang("title")}
            <span className="ml-auto pl-3 text-caption text-fg-muted">
              {currentLocale.toUpperCase()}
            </span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent className="min-w-44 p-1.5">
              <div className="flex flex-col gap-0.5">
                {locales.map((locale) => (
                  <DropdownMenuItem
                    key={locale}
                    disabled={localePending}
                    onSelect={() => chooseLocale(locale as Locale)}
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-md px-3 py-2 text-[13px] font-medium transition-colors cursor-pointer",
                      currentLocale === locale
                        ? "bg-primary-50 text-primary-700 font-semibold focus:bg-primary-50 focus:text-primary-700"
                        : "text-fg hover:bg-bg-muted focus:bg-bg-muted"
                    )}
                  >
                    <span>{tLang(`options.${locale}`)}</span>
                    <span
                      className={cn(
                        "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider",
                        currentLocale === locale
                          ? "bg-primary-100 text-primary-800"
                          : "bg-bg-muted text-fg-subtle"
                      )}
                    >
                      {locale}
                    </span>
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={logout.isPending}
          onSelect={() => logout.mutate()}
          className={cn(
            "text-danger focus:bg-danger-soft focus:text-danger",
            "data-[disabled]:opacity-60",
          )}
        >
          <LogOut className="size-4" />
          {logout.isPending ? t("logoutPending") : t("logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
