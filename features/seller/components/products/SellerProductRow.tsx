"use client";

import { Image as ImageIcon, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoadingButton } from "@/components/feedback";
import type { ProductResponse } from "@/lib/api/schemas/product";

import { useDeleteProduct } from "../../api/products.client";

export interface SellerProductRowProps {
  product: ProductResponse;
  /**
   * Optional callback invoked after a successful delete. Lets the list
   * remove the row optimistically without a full refetch.
   */
  onDeleted?: (id: number) => void;
}

export function SellerProductRow({ product, onDeleted }: SellerProductRowProps) {
  const t = useTranslations("seller.dashboard.products.row");
  const tCorr = useTranslations();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const deleteMutation = useDeleteProduct();

  const priceLabel =
    product.price !== null && product.price !== undefined
      ? `${t("priceFromPrefix")} ${product.price} ${product.currency}`
      : t("priceNegotiable");

  async function handleConfirmDelete(): Promise<void> {
    try {
      await deleteMutation.mutateAsync({ id: product.id });
      toast.success(t("deleted", { name: product.name }));
      setConfirmOpen(false);
      onDeleted?.(product.id);
    } catch {
      // ApiError surfaces inline below.
    }
  }

  return (
    <li className="flex items-center gap-4 rounded-lg border border-border bg-bg-elevated px-4 py-3">
      <div
        aria-hidden="true"
        className="flex size-16 shrink-0 items-center justify-center rounded-md bg-bg-muted text-fg-subtle"
      >
        <ImageIcon className="size-6" />
      </div>
      <div className="flex flex-1 flex-col">
        <Link
          href={`/product/${product.slug}`}
          className="text-body-sm font-semibold text-fg hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {product.name}
        </Link>
        <p className="text-caption text-fg-muted">{priceLabel}</p>
        <div className="mt-1 flex items-center gap-2">
          <ModerationBadge status={product.status} />
          {product.isActive ? (
            <Badge variant="primary">{t("active")}</Badge>
          ) : (
            <Badge variant="neutral">{t("inactive")}</Badge>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button
          asChild
          variant="ghost"
          size="icon-sm"
          aria-label={t("editAria", { name: product.name })}
        >
          <Link href={`/seller/products/${product.id}/edit`}>
            <Pencil />
          </Link>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={t("deleteAria", { name: product.name })}
          onClick={() => setConfirmOpen(true)}
        >
          <Trash2 />
        </Button>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("confirmTitle", { name: product.name })}</DialogTitle>
            <DialogDescription>{t("confirmDescription")}</DialogDescription>
          </DialogHeader>
          {deleteMutation.isError ? (
            <div
              role="alert"
              className="rounded-md border border-danger/40 bg-danger-soft px-3 py-2 text-body-sm text-danger-soft-foreground"
            >
              {t("deleteError")}
              {deleteMutation.error.correlationId ? (
                <p className="mt-0.5 text-caption text-fg-muted">
                  {tCorr("feedback.errorDefault.correlationId", {
                    id: deleteMutation.error.correlationId,
                  })}
                </p>
              ) : null}
            </div>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setConfirmOpen(false)}
              disabled={deleteMutation.isPending}
            >
              {t("cancel")}
            </Button>
            <LoadingButton
              type="button"
              variant="danger"
              pending={deleteMutation.isPending}
              pendingLabel={t("deleting")}
              onClick={handleConfirmDelete}
            >
              {t("confirm")}
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </li>
  );
}

function ModerationBadge({
  status,
}: {
  status: ProductResponse["status"];
}) {
  const t = useTranslations("seller.dashboard.products.moderation");
  switch (status) {
    case "APPROVED":
      return <Badge variant="success">{t("approved")}</Badge>;
    case "PENDING":
      return <Badge variant="warning">{t("pending")}</Badge>;
    case "REJECTED":
      return <Badge variant="danger">{t("rejected")}</Badge>;
    case "ARCHIVED":
      return <Badge variant="neutral">{t("archived")}</Badge>;
  }
}
