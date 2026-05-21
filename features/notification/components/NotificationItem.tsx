"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import type { NotificationResponse } from "@/lib/api/schemas/notification";
import { cn } from "@/lib/utils/cn";

import { describeNotification } from "./notificationCopy";

export interface NotificationItemProps {
  notification: NotificationResponse;
  /** Called when the user opens the notification (Enter/Space/click). */
  onOpen?: (notification: NotificationResponse) => void;
}

export function NotificationItem({ notification, onOpen }: NotificationItemProps) {
  const t = useTranslations();
  const tInbox = useTranslations("notifications.inbox");
  const copy = describeNotification(notification);
  const unread = !notification.read_at;
  const title = t(copy.titleKey, copy.values);
  const body = t(copy.bodyKey, copy.values);

  const handleActivate = () => {
    onOpen?.(notification);
  };

  const content = (
    <div
      className={cn(
        "flex w-full items-start gap-3 rounded-md px-3 py-3 text-left transition-colors duration-fast ease-standard",
        "hover:bg-bg-muted/60 focus-visible:bg-bg-muted/80",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
      )}
    >
      <span
        aria-hidden="true"
        className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600"
      >
        <Bell className="size-4" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-baseline gap-2">
          <span className="truncate text-body-sm font-semibold text-fg">{title}</span>
          {unread ? (
            <span
              aria-label={tInbox("unreadDotAria")}
              className="size-2 shrink-0 rounded-full bg-primary-600"
            />
          ) : null}
        </div>
        <p className="text-body-sm text-fg-muted line-clamp-2">{body}</p>
      </div>
    </div>
  );

  return wrap(copy.href, handleActivate, content);
}

function wrap(href: string | undefined, onClick: () => void, content: ReactNode) {
  if (href) {
    return (
      <Link href={href} className="block" onClick={onClick}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" className="block w-full" onClick={onClick}>
      {content}
    </button>
  );
}
