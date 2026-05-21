import { useTranslations } from "next-intl";

import { AuthStatus } from "@/components/feedback";
import { AuthCard } from "@/features/auth/components/AuthCard";

export default function VerifyLoading() {
  const t = useTranslations("auth.verify");
  return (
    <AuthCard>
      <AuthStatus variant="pending" title={t("pendingTitle")} />
    </AuthCard>
  );
}
