"use client";

import { Heart, MessageCircle, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { useCartItemCount } from "@/features/cart";
import { useUnreadCount } from "@/features/chat";
import { useFavoritedIds } from "@/features/favorites";
import { NotificationDropdown } from "@/features/notification";
import { cn } from "@/lib/utils/cn";

import { AiAgentButton } from "./ai-agent-button";
import { UserMenu } from "./user-menu";

const ICON_LINK_CLASS = cn(
  "relative inline-flex size-6 items-center justify-center rounded-sm text-chrome-icon",
  "transition-colors duration-fast ease-standard hover:text-primary-600",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
);

export function TopBar() {
  const t = useTranslations("shell.topbar");

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center gap-6 border-b border-chrome-border bg-bg-elevated",
        "px-4 md:px-10",
      )}
    >
      <h1 className="flex-1 truncate text-[24px] font-bold leading-[29px] text-chrome-strong">
        {t("brand")}
      </h1>

      <div className="hidden md:flex">
        <AiAgentButton />
      </div>

      <div className="flex items-center gap-6">
        <NotificationDropdown />
        <FavoritesButton />
        <MessagesButton />
        <CartButton />
        <UserMenu />
      </div>
    </header>
  );
}

function FavoritesButton() {
  const t = useTranslations("shell.topbar.favorites");
  const { data: ids } = useFavoritedIds();
  const count = ids?.size ?? 0;
  return (
    <Link
      href="/favorites"
      aria-label={count > 0 ? t("countAria", { count }) : t("label")}
      className={ICON_LINK_CLASS}
    >
      <Heart className="size-6" strokeWidth={1.5} aria-hidden="true" />
      {count > 0 ? <CountBadge count={count} /> : null}
    </Link>
  );
}

function MessagesButton() {
  const t = useTranslations("shell.topbar.messages");
  const { data: count } = useUnreadCount({ refetchInterval: 30_000 });
  const unread = count ?? 0;
  return (
    <Link
      href="/chats"
      aria-label={unread > 0 ? t("countAria", { count: unread }) : t("label")}
      className={ICON_LINK_CLASS}
    >
      <MessageCircle className="size-6" strokeWidth={1.5} aria-hidden="true" />
      {unread > 0 ? <CountBadge count={unread} /> : null}
    </Link>
  );
}

function CartButton() {
  const t = useTranslations("shell.topbar.cart");
  const count = useCartItemCount();
  return (
    <Link
      href="/cart"
      aria-label={count > 0 ? t("countAria", { count }) : t("label")}
      className={ICON_LINK_CLASS}
    >
      <ShoppingCart className="size-6" strokeWidth={1.5} aria-hidden="true" />
      {count > 0 ? <CountBadge count={count} /> : null}
    </Link>
  );
}

function CountBadge({ count }: { count: number }) {
  return (
    <span
      aria-hidden="true"
      className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-600 px-1 text-[10px] font-semibold leading-none text-fg-on-primary"
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
