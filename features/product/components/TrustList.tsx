import { CheckCircle2, ShieldCheck, FileCheck2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

export function TrustList({ className }: { className?: string }) {
  const t = useTranslations("productDetail.trust");
  const items: ReadonlyArray<{
    Icon: typeof CheckCircle2;
    text: string;
    color: string;
  }> = [
    { Icon: ShieldCheck, text: t("safeDeal"), color: "text-[#155DFC]" },
    { Icon: CheckCircle2, text: t("verifiedData"), color: "text-[#00C950]" },
    { Icon: FileCheck2, text: t("originalProducts"), color: "text-[#155DFC]" },
  ];
  return (
    <Card className={cn("flex flex-col gap-[10px] rounded-xl p-[18px]", className)}>
      <ul className="flex flex-col gap-[10px]">
        {items.map(({ Icon, text, color }) => (
          <li key={text} className="flex items-start gap-2">
            <Icon
              aria-hidden="true"
              className={cn("mt-0.5 size-4 shrink-0", color)}
            />
            <span className="text-body-sm text-fg">{text}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
