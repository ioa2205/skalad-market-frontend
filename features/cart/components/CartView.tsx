"use client";

import { Plus, ShoppingCart } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState, useTransition } from "react";

import { EmptyState, ErrorState } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { log } from "@/lib/log";

import { submitCart, type CartContactInfo, type CompanySubmissionResult } from "../api/cart.client";
import { useCartItems } from "../hooks/useCartItems";
import { useCartStore } from "../store";

import { CartLineItem } from "./CartLineItem";
import { CartSummary } from "./CartSummary";
import { ContactConfirmDialog } from "./ContactConfirmDialog";

export interface CartViewProps {
  contactDefaults: CartContactInfo;
  /** True if we couldn't prefill contact from the session (signed-out or missing fields). */
  contactNeedsAttention?: boolean;
}

export function CartView({ contactDefaults, contactNeedsAttention }: CartViewProps) {
  const t = useTranslations("cart");
  const items = useCartItems();
  const setQty = useCartStore((s) => s.setQty);
  const remove = useCartStore((s) => s.remove);
  const clear = useCartStore((s) => s.clear);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, startTransition] = useTransition();
  const [results, setResults] = useState<CompanySubmissionResult[] | null>(null);

  const onConfirm = (contact: CartContactInfo) => {
    startTransition(async () => {
      try {
        const next = await submitCart({ items, contact });
        setResults(next);
        const okIds = next.filter((r) => r.ok).flatMap((r) => r.productIds);
        if (okIds.length > 0) {
          okIds.forEach((id) => remove(id));
        }
        const allOk = next.every((r) => r.ok);
        if (allOk) {
          setDialogOpen(false);
          clear();
          toast.success(t("submit.successToast"));
        } else if (next.some((r) => r.ok)) {
          setDialogOpen(false);
          toast.error(t("submit.partialFailureToast"));
        } else {
          toast.error(t("submit.errorToast"));
        }
      } catch (error) {
        log.error("cart.submit.unexpected", {
          message: error instanceof Error ? error.message : "unknown",
        });
        toast.error(t("submit.errorToast"));
      }
    });
  };

  if (items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingCart}
        title={t("empty.title")}
        description={t("empty.description")}
        action={
          <Button asChild variant="primary">
            <Link href="/catalog">{t("empty.cta")}</Link>
          </Button>
        }
      />
    );
  }

  const failed = results?.filter((r) => !r.ok) ?? [];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_337px]">
      <div className="flex flex-col gap-4">
        {failed.length > 0 ? (
          <ErrorState
            title={t("submit.partialFailureTitle")}
            description={t("submit.partialFailureBody", { count: failed.length })}
            correlationId={failed[0]?.error?.correlationId ?? null}
            correlationIdLabel={t("submit.correlationLabel")}
            action={
              <Button variant="primary" onClick={() => setDialogOpen(true)}>
                {t("submit.retryFailed")}
              </Button>
            }
          />
        ) : null}

        {items.map((item) => (
          <CartLineItem
            key={item.productId}
            item={item}
            onChangeQty={setQty}
            onRemove={remove}
          />
        ))}

        <Button asChild variant="ghost" className="self-start text-primary-600">
          <Link href="/catalog">
            <Plus aria-hidden="true" />
            {t("addMore")}
          </Link>
        </Button>
      </div>

      <CartSummary
        items={items}
        submitting={submitting}
        onSubmit={() => setDialogOpen(true)}
      />

      <ContactConfirmDialog
        open={dialogOpen}
        onOpenChange={(next) => {
          if (!submitting) setDialogOpen(next);
        }}
        defaults={contactDefaults}
        submitting={submitting}
        onConfirm={onConfirm}
      />

      {contactNeedsAttention ? (
        <p className="col-span-full text-caption text-fg-muted">
          {t("contact.signedOutHint")}
        </p>
      ) : null}
    </div>
  );
}
