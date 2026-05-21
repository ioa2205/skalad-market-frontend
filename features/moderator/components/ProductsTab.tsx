"use client";

import { Package } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { ErrorState } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils/cn";

import { useProductsQueue } from "../api/queries.client";

import { ProductQueueCard } from "./ProductQueueCard";

type SubTab = "pending" | "my" | "draft";

/**
 * Products tab: top-level switch between Pending review / My products / Drafts.
 *
 * Only "pending" has a real backend list endpoint — `my` and `draft` are
 * placeholders here because the moderator-side "my products / drafts" concept
 * doesn't exist on the backend yet. We render an empty state with a stable
 * copy key so the tabs can be wired without a layout regression once those
 * endpoints arrive.
 */
export function ProductsTab() {
  const t = useTranslations("moderator.products");
  const [sub, setSub] = useState<SubTab>("pending");

  return (
    <div className="flex flex-col gap-10">
      <div
        role="tablist"
        aria-label={t("queueTitle")}
        className="grid w-full grid-cols-3 gap-0 rounded-full border border-mod-border bg-mod-card p-1"
      >
        {(["pending", "my", "draft"] as const).map((key) => {
          const selected = sub === key;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setSub(key)}
              className={cn(
                "inline-flex h-[39px] items-center justify-center whitespace-nowrap rounded-full px-4 text-body-sm",
                "transition-colors duration-fast ease-standard",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
                selected
                  ? "bg-bg-elevated font-semibold text-chrome-strong shadow-sm"
                  : "font-medium text-mod-meta-2 hover:text-fg",
              )}
            >
              {t(`subtabs.${key}`)}
            </button>
          );
        })}
      </div>

      {sub === "pending" ? <PendingList /> : null}
      {sub === "my" ? (
        <EmptyShell title={t("queueTitle")} body={t("myEmpty")} />
      ) : null}
      {sub === "draft" ? (
        <EmptyShell title={t("queueTitle")} body={t("draftEmpty")} />
      ) : null}
    </div>
  );
}

function PendingList() {
  const t = useTranslations("moderator.products");
  const tLoad = useTranslations("moderator.loadError");
  const { data, isPending, isError, error } = useProductsQueue();

  return (
    <section className="rounded-mod border border-mod-border bg-bg-elevated px-4 py-5">
      <h2 className="mb-5 text-[22px] font-bold text-chrome-strong">
        {t("queueTitle")}
      </h2>
      {isPending ? (
        <div className="flex flex-col gap-5">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-[109px] w-full rounded-mod" />
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
      ) : (data?.length ?? 0) === 0 ? (
        <EmptyInline />
      ) : (
        <ul className="flex flex-col gap-5">
          {data!.map((product) => (
            <li key={product.id}>
              <ProductQueueCard product={product} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function EmptyShell({ title, body }: { title: string; body: string }) {
  return (
    <section className="rounded-mod border border-mod-border bg-bg-elevated px-4 py-5">
      <h2 className="mb-2 text-[22px] font-bold text-chrome-strong">{title}</h2>
      <p className="text-body-sm text-fg-muted">{body}</p>
    </section>
  );
}

function EmptyInline() {
  const t = useTranslations("moderator.products.empty");
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center text-fg-muted">
      <span className="flex size-12 items-center justify-center rounded-full bg-bg-muted text-fg-muted">
        <Package className="size-5" aria-hidden="true" />
      </span>
      <p className="text-body font-medium text-fg">{t("title")}</p>
      <p className="text-body-sm">{t("description")}</p>
    </div>
  );
}
