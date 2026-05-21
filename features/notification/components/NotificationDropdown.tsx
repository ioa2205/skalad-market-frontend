"use client";

import { Bell, Settings } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { EmptyState, ErrorState, Spinner } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/sonner";
import { cn } from "@/lib/utils/cn";

import {
  useMarkNotificationsRead,
  useNotifications,
} from "../api/notification.client";
import { unreadCount } from "../selectors";

import { NotificationItem } from "./NotificationItem";

export interface NotificationDropdownProps {
  /** Whether the bell badge counts unread items. */
  showBadge?: boolean;
}

export function NotificationDropdown({ showBadge = true }: NotificationDropdownProps) {
  const tInbox = useTranslations("notifications.inbox");
  const tCommon = useTranslations("common");
  const query = useNotifications(
    { isRead: false, page: 1, perPage: 10 },
    { refetchInterval: 60_000 },
  );
  const markRead = useMarkNotificationsRead();

  const items = query.data?.items ?? [];
  const unread = unreadCount(items);

  const handleMarkAll = () => {
    markRead.mutate(
      { markAll: true },
      {
        onError: () => {
          toast.error(tInbox("markAllError"));
        },
      },
    );
  };

  const handleOpen = (id: number) => {
    markRead.mutate({ ids: [id] });
  };

  return (
    <Popover>
      <PopoverTrigger
        aria-label={
          showBadge && unread > 0
            ? tInbox("dropdownLabel") + " — " + unread
            : tInbox("dropdownLabel")
        }
        className="relative inline-flex size-6 items-center justify-center rounded-sm text-chrome-icon transition-colors duration-fast ease-standard hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
      >
        <Bell className="size-6" strokeWidth={1.5} aria-hidden="true" />
        {showBadge && unread > 0 ? (
          <span
            aria-hidden="true"
            className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-600 px-1 text-[10px] font-semibold leading-none text-fg-on-primary"
          >
            {unread > 99 ? "99+" : unread}
          </span>
        ) : null}
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={10} className="w-96 p-0">
        <header className="flex items-center justify-between gap-2 px-4 py-3">
          <p className="text-body font-semibold text-fg">{tInbox("title")}</p>
          <div className="flex items-center gap-1">
            {unread > 0 ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAll}
                disabled={markRead.isPending}
                className="h-7 px-2"
              >
                {markRead.isPending ? <Spinner size="sm" /> : null}
                {markRead.isPending
                  ? tInbox("markAllPending")
                  : tInbox("markAllRead")}
              </Button>
            ) : null}
            <Button asChild variant="ghost" size="icon-sm" aria-label={tInbox("openSettings")}>
              <Link href="/account/notifications">
                <Settings />
              </Link>
            </Button>
          </div>
        </header>
        <Separator />
        <ScrollArea className="max-h-[28rem]">
          <Body
            isLoading={query.isLoading}
            isError={query.isError}
            isEmpty={!query.isLoading && !query.isError && items.length === 0}
            errorCorrelationId={query.error?.correlationId}
            onRetry={() => query.refetch()}
            retryLabel={tCommon("tryAgain")}
            errorTitle={tInbox("error.title")}
            errorBody={tInbox("error.body")}
            errorCorrelationLabel={tInbox("error.correlationLabel")}
            emptyTitle={tInbox("empty.title")}
            emptyBody={tInbox("empty.body")}
          >
            <ul className="flex flex-col p-1">
              {items.map((notification) => (
                <li key={notification.id}>
                  <NotificationItem
                    notification={notification}
                    onOpen={() => handleOpen(notification.id)}
                  />
                </li>
              ))}
            </ul>
          </Body>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

interface BodyProps {
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  errorCorrelationId?: string | undefined;
  onRetry: () => void;
  retryLabel: string;
  errorTitle: string;
  errorBody: string;
  errorCorrelationLabel: string;
  emptyTitle: string;
  emptyBody: string;
  children: React.ReactNode;
}

function Body({
  isLoading,
  isError,
  isEmpty,
  errorCorrelationId,
  onRetry,
  retryLabel,
  errorTitle,
  errorBody,
  errorCorrelationLabel,
  emptyTitle,
  emptyBody,
  children,
}: BodyProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 p-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 px-2 py-2">
            <Skeleton variant="circle" className="size-9" />
            <div className="flex w-full flex-col gap-2">
              <Skeleton variant="text" className="w-1/2" />
              <Skeleton variant="text" className="w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (isError) {
    return (
      <div className={cn("p-3")}>
        <ErrorState
          title={errorTitle}
          description={errorBody}
          correlationId={errorCorrelationId}
          correlationIdLabel={errorCorrelationLabel}
          action={
            <Button onClick={onRetry} variant="secondary" size="sm">
              {retryLabel}
            </Button>
          }
        />
      </div>
    );
  }
  if (isEmpty) {
    return (
      <div className="p-3">
        <EmptyState title={emptyTitle} description={emptyBody} />
      </div>
    );
  }
  return <>{children}</>;
}
