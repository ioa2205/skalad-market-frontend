import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import type { LeadStatus } from "@/lib/api/schemas/enums";

export interface LeadStatusBadgeProps {
  status: LeadStatus;
}

export function LeadStatusBadge({ status }: LeadStatusBadgeProps) {
  const t = useTranslations("seller.dashboard.leads.status");

  switch (status) {
    case "NEW":
      return <Badge variant="success">{t("NEW")}</Badge>;
    case "VIEWED":
      return <Badge variant="info">{t("VIEWED")}</Badge>;
    case "CONTACTED":
      return <Badge variant="warning">{t("CONTACTED")}</Badge>;
    case "CLOSED":
      return <Badge variant="primary">{t("CLOSED")}</Badge>;
    case "CANCELED":
      return <Badge variant="danger">{t("CANCELED")}</Badge>;
  }
}
