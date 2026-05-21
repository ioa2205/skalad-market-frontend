"use client";

import { useTranslations } from "next-intl";

import { Pagination } from "@/components/data";
import { EmptyState, ErrorState } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import { ProductCard, ProductCardSkeleton } from "@/features/product";
import type { ProductResponse } from "@/lib/api/schemas";

import { useCatalogParams } from "../hooks/useCatalogParams";
import { CatalogMapStub } from "./CatalogMapStub";

export interface CatalogResultsProps {
  items: ProductResponse[];
  meta: { total: number; page: number; perPage: number; totalPages: number };
  error?: { code: string; correlationId?: string | undefined };
  /** Server hint that we should still show skeletons (e.g. searching). */
  isPending?: boolean;
}

export function CatalogResults({
  items,
  meta,
  error,
  isPending,
}: CatalogResultsProps) {
  const t = useTranslations("catalog");
  const tFeedback = useTranslations("feedback.errorDefault");
  const [params, setParams] = useCatalogParams();

  if (params.mode === "map") return <CatalogMapStub />;

  if (error) {
    return (
      <ErrorState
        title={tFeedback("title")}
        description={tFeedback("description")}
        correlationId={error.correlationId}
        correlationIdLabel={tFeedback("correlationId", {
          id: error.correlationId ?? "—",
        })}
        action={
          <Button
            variant="outline"
            onClick={() => setParams({ page: meta.page })}
          >
            {tFeedback("retry")}
          </Button>
        }
      />
    );
  }

  if (isPending) {
    return (
      <div className="grid grid-cols-1 gap-[13px] sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: meta.perPage }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title={t("empty.title")}
        description={t("empty.description")}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-[13px] sm:grid-cols-2 xl:grid-cols-3">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <Pagination
        paginator={{
          kind: "manual",
          page: meta.page,
          perPage: meta.perPage,
          totalItems: meta.total,
        }}
        onPageChange={(next) => setParams({ page: next })}
      />
    </div>
  );
}
