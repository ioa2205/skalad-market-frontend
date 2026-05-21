"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { EmptyState } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import type { ProductResponse } from "@/lib/api/schemas/product";

import { SellerProductRow } from "./SellerProductRow";

export interface SellerProductsListProps {
  initialItems: ProductResponse[];
}

/**
 * Client wrapper around the seller-products list. Holds the optimistic
 * "removed ids" set so deletes vanish from the rendered list immediately
 * without waiting for the server-component refetch to come back.
 */
export function SellerProductsList({ initialItems }: SellerProductsListProps) {
  const t = useTranslations("seller.dashboard.products");
  const [removedIds, setRemovedIds] = useState<Set<number>>(new Set());

  const visible = initialItems.filter((item) => !removedIds.has(item.id));

  if (visible.length === 0) {
    return (
      <EmptyState
        title={t("emptyTitle")}
        description={t("emptyDescription")}
        action={
          <Button asChild>
            <Link href="/seller/products/new" className="flex items-center gap-2">
              <Plus aria-hidden="true" className="size-4" />
              <span>{t("emptyCta")}</span>
            </Link>
          </Button>
        }
      />
    );
  }

  return (
    <section
      aria-labelledby="seller-products-title"
      className="rounded-lg border border-border bg-bg-elevated p-5"
    >
      <h2 id="seller-products-title" className="text-h4 font-semibold text-fg">
        {t("listTitle")}
      </h2>
      <ul className="mt-4 flex flex-col gap-3">
        {visible.map((product) => (
          <SellerProductRow
            key={product.id}
            product={product}
            onDeleted={(id) =>
              setRemovedIds((prev) => {
                const next = new Set(prev);
                next.add(id);
                return next;
              })
            }
          />
        ))}
      </ul>
    </section>
  );
}
