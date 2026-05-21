"use client";

import { Building2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { ErrorState } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { useCompaniesQueue } from "../api/queries.client";

import { CompanyQueueCard } from "./CompanyQueueCard";

export function CompaniesTab() {
  const t = useTranslations("moderator.companies");
  const tLoad = useTranslations("moderator.loadError");
  const { data, isPending, isError, error } = useCompaniesQueue();

  return (
    <section className="rounded-mod border border-mod-border bg-bg-elevated px-4 py-5">
      <h2 className="mb-5 text-[22px] font-bold text-chrome-strong">
        {t("queueTitle")}
      </h2>
      {isPending ? (
        <div className="flex flex-col gap-5">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-[115px] w-full rounded-mod" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          title={tLoad("title")}
          description={tLoad("description")}
          correlationId={(error as { correlationId?: string } | null)?.correlationId}
          correlationIdLabel={tLoad("correlationLabel")}
          action={
            <Button onClick={() => location.reload()}>{tLoad("retry")}</Button>
          }
        />
      ) : (data?.length ?? 0) === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-12 text-center text-fg-muted">
          <span className="flex size-12 items-center justify-center rounded-full bg-bg-muted text-fg-muted">
            <Building2 className="size-5" aria-hidden="true" />
          </span>
          <p className="text-body font-medium text-fg">{t("empty.title")}</p>
          <p className="text-body-sm">{t("empty.description")}</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-5">
          {data!.map((company) => (
            <li key={company.id}>
              <CompanyQueueCard company={company} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
