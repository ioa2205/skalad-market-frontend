import { getTranslations } from "next-intl/server";

import { fetchLeads } from "@/features/lead/api/leads.server";
import { LeadsView } from "@/features/lead/components/LeadsView";
import { LeadStatusEnum, type LeadStatus } from "@/lib/api/schemas/enums";

export const dynamic = "force-dynamic";

const PER_PAGE = 20;

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const t = await getTranslations("leads");

  const page = clampPage(numberParam(sp.page) ?? 1);
  const status = parseStatus(stringParam(sp.status));
  const selectedId = numberParam(sp.selected) ?? null;

  const result = await fetchLeads({ page, perPage: PER_PAGE, ...(status ? { status } : {}) });

  return (
    <div className="mx-auto flex w-full max-w-screen-xl flex-col gap-6 px-4 py-6 md:px-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-h1 font-bold text-fg">{t("title")}</h1>
        <p className="text-body-sm text-fg-muted">
          {t("count", { count: result.meta.total })}
        </p>
      </header>

      <LeadsView
        items={result.items}
        meta={result.meta}
        {...(status ? { status } : {})}
        selectedId={selectedId}
        {...(result.error ? { error: result.error } : {})}
      />
    </div>
  );
}

function stringParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function numberParam(value: string | string[] | undefined): number | undefined {
  const raw = stringParam(value);
  if (!raw) return undefined;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function clampPage(page: number): number {
  return Math.max(1, Math.floor(page));
}

function parseStatus(value: string | undefined): LeadStatus | undefined {
  if (!value) return undefined;
  const result = LeadStatusEnum.safeParse(value);
  return result.success ? result.data : undefined;
}
