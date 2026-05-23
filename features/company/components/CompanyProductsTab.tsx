import { Box } from "lucide-react";
import { useTranslations } from "next-intl";

import { EmptyState } from "@/components/feedback";
import { ProductCard } from "@/features/product";
import type { CompanyProductResponse } from "@/lib/api/schemas";

export interface CompanyProductsTabProps {
  products: CompanyProductResponse[];
  companyName: string;
  verified: boolean;
}

export function CompanyProductsTab({
  products,
  companyName,
  verified,
}: CompanyProductsTabProps) {
  const t = useTranslations("company.profile.products");

  if (products.length === 0) {
    return (
      <EmptyState
        icon={Box}
        title={t("empty.title")}
        description={t("empty.description")}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          companyName={companyName}
          verified={verified}
        />
      ))}
    </div>
  );
}
