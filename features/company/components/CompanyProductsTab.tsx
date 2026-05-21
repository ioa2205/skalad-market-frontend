import { Box } from "lucide-react";
import { useTranslations } from "next-intl";

import { EmptyState } from "@/components/feedback";

/**
 * Empty state. There is no public endpoint that lists products by company:
 * `/catalog` accepts q/category/regionId/currency only, `/products/my`
 * requires SELLER auth and only returns the caller's own products. We
 * deliberately do NOT fall back to a fuzzy `/catalog?q=<companyName>`
 * search — it'd risk surfacing products from a different company with the
 * same name. Render a clean empty state until backend exposes a filter.
 */
export function CompanyProductsTab() {
  const t = useTranslations("company.profile.products");
  return (
    <EmptyState
      icon={Box}
      title={t("empty.title")}
      description={t("empty.description")}
    />
  );
}
