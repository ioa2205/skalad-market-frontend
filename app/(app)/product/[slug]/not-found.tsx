import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { EmptyState } from "@/components/feedback";
import { Button } from "@/components/ui/button";

export default async function ProductDetailNotFound() {
  const t = await getTranslations("productDetail");
  return (
    <div className="mx-auto flex w-full max-w-2xl px-4 py-12">
      <EmptyState
        title={t("notFoundTitle")}
        description={t("notFoundBody")}
        action={
          <Button asChild>
            <Link href="/catalog">{t("backToCatalog")}</Link>
          </Button>
        }
        className="w-full"
      />
    </div>
  );
}
