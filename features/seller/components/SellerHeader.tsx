"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import { AddProductDialog } from "./products/AddProductDialog";

export interface SellerHeaderProps {
  /**
   * When false the "Добавить товар" CTA renders as disabled — used while the
   * company is still in onboarding / pending verification.
   */
  canAddProduct?: boolean;
  /** Company info needed by the Add Product modal. */
  companyId?: number;
  companyRegionId?: number;
  companyDistrictId?: number;
}

/**
 * Renders the "Панель продавца" page title row with the primary CTA.
 *
 * The CTA opens the new "Добавить товар" modal in-place (figma:
 * `seller_dashboard_6.svg`). The full page route `/seller/products/new`
 * remains as a fallback so deep links keep working.
 */
export function SellerHeader({
  canAddProduct = true,
  companyId,
  companyRegionId,
  companyDistrictId,
}: SellerHeaderProps) {
  const t = useTranslations("seller.dashboard.header");
  const [dialogOpen, setDialogOpen] = useState(false);

  const canOpenDialog =
    canAddProduct && companyId !== undefined && companyRegionId !== undefined;

  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <h1 className="text-h2 font-bold text-fg">{t("title")}</h1>
      {canOpenDialog ? (
        <>
          <Button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus aria-hidden="true" className="size-5" />
            <span>{t("addProduct")}</span>
          </Button>
          <AddProductDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            companyId={companyId!}
            companyRegionId={companyRegionId!}
            {...(companyDistrictId !== undefined
              ? { companyDistrictId }
              : {})}
          />
        </>
      ) : canAddProduct ? (
        <Button asChild>
          <Link
            href="/seller/products/new"
            aria-label={t("addProductAria")}
            className="flex items-center gap-2"
          >
            <Plus aria-hidden="true" className="size-5" />
            <span>{t("addProduct")}</span>
          </Link>
        </Button>
      ) : (
        <Button
          type="button"
          disabled
          aria-disabled="true"
          title={t("addProductDisabledTooltip")}
          className="flex items-center gap-2"
        >
          <Plus aria-hidden="true" className="size-5" />
          <span>{t("addProduct")}</span>
        </Button>
      )}
    </header>
  );
}
