import { MessageSquare } from "lucide-react";
import { useTranslations } from "next-intl";

import { EmptyState } from "@/components/feedback";

/**
 * Reviews are not in scope of the backend (Decision #3 in build-plan §1).
 * Static empty state — read-only — until a review service ships.
 */
export function CompanyReviewsTab() {
  const t = useTranslations("company.profile.reviews");
  return (
    <EmptyState
      icon={MessageSquare}
      title={t("empty.title")}
      description={t("empty.description")}
    />
  );
}
