import { Star } from "lucide-react";
import { useTranslations } from "next-intl";

import { EmptyState } from "@/components/feedback";

export function ReviewsPanel() {
  const t = useTranslations("productDetail.reviews");
  return <EmptyState title={t("emptyTitle")} description={t("emptyBody")} icon={Star} />;
}
