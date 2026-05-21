"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

/**
 * Two pagination shapes feed this component:
 *
 *  - "1-indexed": `{ page, perPage, totalItems }` — used by `/catalog`,
 *    `/favorites`, etc. Pages are 1-based.
 *  - "spring": `{ number, size, totalPages, totalElements }` — Spring's
 *    `Page<T>`. `number` is **0-based** so we normalize on the way in.
 *
 * Use the helper `paginatorFromSpring(page)` to convert in one shot.
 */

export interface PaginatorState {
  page: number;
  totalPages: number;
}

export type PaginationInput =
  | { kind: "manual"; page: number; perPage: number; totalItems: number }
  | { kind: "spring"; number: number; size: number; totalPages: number; totalElements: number };

export function paginatorFromInput(input: PaginationInput): PaginatorState {
  if (input.kind === "spring") {
    return { page: input.number + 1, totalPages: Math.max(input.totalPages, 1) };
  }
  const totalPages = Math.max(Math.ceil(input.totalItems / Math.max(input.perPage, 1)), 1);
  return { page: Math.min(Math.max(input.page, 1), totalPages), totalPages };
}

export interface PaginationProps {
  paginator: PaginationInput;
  onPageChange: (page: number) => void;
  className?: string;
  /** Render up to N page buttons in addition to first/last. Default 5. */
  maxPageButtons?: number;
}

export function Pagination({
  paginator,
  onPageChange,
  className,
  maxPageButtons = 5,
}: PaginationProps) {
  const t = useTranslations("pagination");
  const { page, totalPages } = paginatorFromInput(paginator);

  const pages = useMemo(() => buildRange(page, totalPages, maxPageButtons), [
    page,
    totalPages,
    maxPageButtons,
  ]);

  if (totalPages <= 1) return null;

  return (
    <nav aria-label={t("label")} className={cn("flex items-center gap-1", className)}>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={t("previous")}
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft />
      </Button>
      <ol className="flex items-center gap-1">
        {pages.map((entry, index) =>
          entry === "ellipsis" ? (
            <li
              key={`ellipsis-${index}`}
              aria-hidden="true"
              className="px-1 text-fg-subtle"
            >
              …
            </li>
          ) : (
            <li key={entry}>
              <Button
                variant={entry === page ? "primary" : "ghost"}
                size="icon-sm"
                aria-label={t("pageLabel", { page: entry })}
                aria-current={entry === page ? "page" : undefined}
                onClick={() => onPageChange(entry)}
              >
                {entry}
              </Button>
            </li>
          ),
        )}
      </ol>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={t("next")}
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRight />
      </Button>
      <span className="ml-2 text-caption text-fg-muted">
        {t("of", { current: page, total: totalPages })}
      </span>
    </nav>
  );
}

type RangeEntry = number | "ellipsis";

function buildRange(page: number, totalPages: number, max: number): RangeEntry[] {
  if (totalPages <= max + 2) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const half = Math.floor(max / 2);
  let start = Math.max(2, page - half);
  let end = Math.min(totalPages - 1, page + half);
  if (page - 1 <= half) end = Math.min(totalPages - 1, max);
  if (totalPages - page <= half) start = Math.max(2, totalPages - max + 1);

  const range: RangeEntry[] = [1];
  if (start > 2) range.push("ellipsis");
  for (let i = start; i <= end; i++) range.push(i);
  if (end < totalPages - 1) range.push("ellipsis");
  range.push(totalPages);
  return range;
}
