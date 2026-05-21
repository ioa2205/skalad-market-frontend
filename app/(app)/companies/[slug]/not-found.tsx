import { Building2 } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { EmptyState } from "@/components/feedback";
import { Button } from "@/components/ui/button";

export default async function CompanyProfileNotFound() {
  const t = await getTranslations("company.profile.notFound");

  return (
    <div className="mx-auto flex w-full max-w-2xl px-4 py-12">
      <EmptyState
        icon={Building2}
        title={t("title")}
        description={t("description")}
        action={
          <Button asChild variant="primary">
            <Link href="/companies">{t("cta")}</Link>
          </Button>
        }
        className="w-full"
      />
    </div>
  );
}
