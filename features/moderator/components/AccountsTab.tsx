"use client";

import { ArrowDownWideNarrow, MoreHorizontal, Users } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { ErrorState } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api/errors";
import type { GeneralStatus, Roles } from "@/lib/api/schemas/enums";
import type { UsersResponse } from "@/lib/api/schemas/user";
import { cn } from "@/lib/utils/cn";

import { useBlockUser, useUnblockUser } from "../api/moderator.client";
import { useAccountsList } from "../api/queries.client";

const GRID = "grid grid-cols-[repeat(6,minmax(0,1fr))_52px]";

export function AccountsTab() {
  const t = useTranslations("moderator.accounts");
  const tLoad = useTranslations("moderator.loadError");
  const { data, isPending, isError, error } = useAccountsList({});

  return (
    <section className="rounded-mod border border-mod-border bg-bg-elevated px-4 py-5">
      <h2 className="mb-5 text-[22px] font-bold text-chrome-strong">
        {t("title")}
      </h2>
      {isPending ? (
        <div className="flex flex-col gap-5">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-[65px] w-full rounded-mod" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          title={tLoad("title")}
          description={tLoad("description")}
          correlationId={
            (error as { correlationId?: string } | null)?.correlationId
          }
          correlationIdLabel={tLoad("correlationLabel")}
          action={
            <Button onClick={() => location.reload()}>{tLoad("retry")}</Button>
          }
        />
      ) : (data?.content.length ?? 0) === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-12 text-center text-fg-muted">
          <span className="flex size-12 items-center justify-center rounded-full bg-bg-muted text-fg-muted">
            <Users className="size-5" aria-hidden="true" />
          </span>
          <p className="text-body font-medium text-fg">{t("empty.title")}</p>
          <p className="text-body-sm">{t("empty.description")}</p>
        </div>
      ) : (
        <AccountsTable rows={data!.content} />
      )}
    </section>
  );
}

function AccountsTable({ rows }: { rows: UsersResponse[] }) {
  const t = useTranslations("moderator.accounts");
  const columns = [
    { key: "user", sortable: true },
    { key: "role", sortable: false },
    { key: "email", sortable: true },
    { key: "createdDate", sortable: true },
    { key: "warnings", sortable: true },
    { key: "status", sortable: true },
  ] as const;

  return (
    <div className="overflow-x-auto">
      <div role="table" className="min-w-[720px]">
        <div role="rowgroup">
          <div role="row" className={cn(GRID, "items-center")}>
            {columns.map((col, i) => (
              <HeaderCell
                key={col.key}
                divider={i > 0}
                sortable={col.sortable}
              >
                {t(`columns.${col.key}`)}
              </HeaderCell>
            ))}
            <span role="columnheader" aria-label={t("columns.actions")} />
          </div>
        </div>

        <div role="rowgroup" className="mt-3 flex flex-col gap-5">
          {rows.map((row) => (
            <AccountRow key={row.id} row={row} />
          ))}
        </div>
      </div>
    </div>
  );
}

function HeaderCell({
  children,
  divider,
  sortable,
}: {
  children: React.ReactNode;
  divider: boolean;
  sortable: boolean;
}) {
  return (
    <div
      role="columnheader"
      className={cn(
        "relative flex items-center gap-2 px-4 py-2 text-body-sm text-fg",
        divider &&
          "before:absolute before:left-0 before:top-1/2 before:h-[18px] before:w-px before:-translate-y-1/2 before:bg-border before:content-['']",
      )}
    >
      <span className="truncate">{children}</span>
      {sortable ? (
        <ArrowDownWideNarrow
          className="size-4 shrink-0 text-mod-th"
          aria-hidden="true"
        />
      ) : null}
    </div>
  );
}

function AccountRow({ row }: { row: UsersResponse }) {
  const t = useTranslations("moderator.accounts");
  const tCommon = useTranslations("moderator.common");
  const format = useFormatter();
  const block = useBlockUser();
  const unblock = useUnblockUser();
  const [blockOpen, setBlockOpen] = useState(false);
  const [reason, setReason] = useState("");

  const isBlocked = row.status === "BLOCK";
  const created = formatDate(row.createdDate, format);

  const onUnblock = async () => {
    try {
      await unblock.mutateAsync({ userId: row.id });
      toast.success(t("unblockSuccess"));
    } catch (error) {
      reportError(error, tCommon);
    }
  };

  const onConfirmBlock = async () => {
    const trimmed = reason.trim();
    if (!trimmed) return;
    try {
      await block.mutateAsync({ userId: row.id, reason: trimmed });
      setBlockOpen(false);
      setReason("");
      toast.success(t("blockSuccess"));
    } catch (error) {
      reportError(error, tCommon);
    }
  };

  return (
    <>
      <div
        role="row"
        className={cn(
          GRID,
          "h-[65px] items-center rounded-mod border border-mod-border bg-bg-elevated",
        )}
      >
        <RowCell>
          <span className="truncate text-fg">{row.name}</span>
        </RowCell>
        <RowCell divider>
          <span className="truncate text-fg">
            {t(`role.${row.roles as Roles}`)}
          </span>
        </RowCell>
        <RowCell divider>
          <span className="truncate text-fg">{row.username}</span>
        </RowCell>
        <RowCell divider>
          <span className="truncate text-fg">{created}</span>
        </RowCell>
        <RowCell divider>
          <span className="truncate text-fg">{row.warningCount ?? "—"}</span>
        </RowCell>
        <RowCell divider>
          <span
            className={cn(
              "inline-flex h-[22px] items-center rounded-mod-xs px-2 text-caption font-medium",
              statusPillClass(row.status),
            )}
          >
            {t(`status.${row.status}`)}
          </span>
        </RowCell>
        <div role="cell" className="flex items-center justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={t("actions.openMenuAria", { name: row.name })}
              >
                <MoreHorizontal aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-[225px] rounded-mod-lg border-mod-menu-border bg-mod-card p-3"
            >
              {isBlocked ? (
                <DropdownMenuItem
                  onSelect={onUnblock}
                  disabled={unblock.isPending}
                  className="h-[40px] rounded-mod px-3 hover:bg-mod-menu-hover focus:bg-mod-menu-hover"
                >
                  {t("actions.unblock")}
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  className="h-[40px] rounded-mod px-3 hover:bg-mod-menu-hover focus:bg-mod-menu-hover"
                  onSelect={(e) => {
                    e.preventDefault();
                    setBlockOpen(true);
                  }}
                >
                  {t("actions.block")}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Dialog open={blockOpen} onOpenChange={setBlockOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("actions.block")}</DialogTitle>
            <DialogDescription>
              {row.name} ({row.username})
            </DialogDescription>
          </DialogHeader>
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t("actions.blockReasonPlaceholder")}
          />
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setBlockOpen(false)}
              disabled={block.isPending}
            >
              {tCommon("cancel")}
            </Button>
            <Button
              variant="danger"
              onClick={onConfirmBlock}
              disabled={!reason.trim() || block.isPending}
              aria-busy={block.isPending}
            >
              {block.isPending ? tCommon("saving") : t("actions.block")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function RowCell({
  children,
  divider = false,
}: {
  children: React.ReactNode;
  divider?: boolean;
}) {
  return (
    <div
      role="cell"
      className={cn(
        "relative flex h-full items-center px-4 text-body-sm",
        divider &&
          "before:absolute before:left-0 before:top-1/2 before:h-[18px] before:w-px before:-translate-y-1/2 before:bg-border before:content-['']",
      )}
    >
      {children}
    </div>
  );
}

function statusPillClass(status: GeneralStatus): string {
  switch (status) {
    case "ACTIVE":
      return "bg-mod-badge-green/20 text-mod-badge-green";
    case "BLOCK":
      return "bg-mod-badge-red/20 text-mod-badge-red";
    case "IN_REGISTRATION":
    default:
      return "bg-mod-badge-amber/20 text-mod-btn-orange";
  }
}

function reportError(
  error: unknown,
  tCommon: ReturnType<typeof useTranslations>,
) {
  const apiError = error instanceof ApiError ? error : null;
  toast.error(tCommon("actionError"), {
    ...(apiError?.correlationId ? { description: apiError.correlationId } : {}),
  });
}

function formatDate(
  iso: string,
  format: ReturnType<typeof useFormatter>,
): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return format.dateTime(d, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
