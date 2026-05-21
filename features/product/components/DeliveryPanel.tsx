import { ShieldCheck, Truck, FileBadge } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils/cn";

type Tone = "info" | "success" | "neutral";

const TONE_CLASSES: Record<
  Tone,
  { row: string; iconWrap: string }
> = {
  info: {
    row: "bg-[#DEECFF]",
    iconWrap: "bg-white text-[#155DFC]",
  },
  success: {
    row: "bg-[#F0FDF4]",
    iconWrap: "bg-white text-[#00A63E]",
  },
  neutral: {
    row: "bg-[#F9FAFB]",
    iconWrap: "bg-white text-fg-muted",
  },
};

export function DeliveryPanel() {
  const t = useTranslations("productDetail.delivery");

  const items: Array<{
    key: string;
    Icon: typeof Truck;
    title: string;
    body: string;
    tone: Tone;
  }> = [
    {
      key: "safeDeal",
      Icon: Truck,
      title: t("safeDeal.title"),
      body: t("safeDeal.body"),
      tone: "info",
    },
    {
      key: "verifiedCompany",
      Icon: ShieldCheck,
      title: t("verifiedCompany.title"),
      body: t("verifiedCompany.body"),
      tone: "success",
    },
    {
      key: "originalDocs",
      Icon: FileBadge,
      title: t("originalDocs.title"),
      body: t("originalDocs.body"),
      tone: "neutral",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <p className="text-body text-fg-muted">{t("placeholder")}</p>
      <div className="flex flex-col gap-[18px]">
        {items.map(({ key, Icon, title, body, tone }) => {
          const tc = TONE_CLASSES[tone];
          return (
            <div
              key={key}
              className={cn(
                "flex items-start gap-3 rounded-xl px-4 py-4",
                tc.row,
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full",
                  tc.iconWrap,
                )}
              >
                <Icon className="size-4" />
              </span>
              <div className="flex min-w-0 flex-col gap-1">
                <h4 className="text-body font-semibold text-fg">{title}</h4>
                <p className="text-body-sm text-fg-muted">{body}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
