import { Check } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils/cn";

const TARIFFS = [
  {
    id: "basic" as const,
    highlight: false,
    features: ["productsLimit10", "basicSearch"],
  },
  {
    id: "business" as const,
    highlight: false,
    features: ["productsLimit100", "searchPriority", "salesAnalytics"],
  },
  {
    id: "premium" as const,
    highlight: true,
    features: ["productsUnlimited", "topRanking", "advertising", "aiTools"],
  },
];

/**
 * Static marketing cards. There is no billing backend (build-plan §1
 * Decision #6) — selecting a tariff is not wired up. The "Премиум" card
 * is highlighted to match the Figma "current plan" treatment.
 */
export function TariffPlanCards() {
  const t = useTranslations("seller.dashboard.settings.tariffs");
  return (
    <section
      aria-labelledby="seller-tariffs-title"
      className="flex flex-col gap-4 rounded-lg border border-border bg-bg-elevated p-5"
    >
      <h2
        id="seller-tariffs-title"
        className="text-h4 font-semibold text-fg"
      >
        {t("title")}
      </h2>
      <div className="grid gap-4 md:grid-cols-3">
        {TARIFFS.map((plan) => (
          <article
            key={plan.id}
            className={cn(
              "flex flex-col gap-3 rounded-lg border bg-bg p-5 text-center",
              plan.highlight
                ? "border-primary-500 bg-primary-50 dark:bg-primary-950"
                : "border-border",
            )}
          >
            <p className="text-h4 font-semibold text-fg">{t(`plans.${plan.id}.name`)}</p>
            <p className="text-body-sm text-fg-muted">
              {t(`plans.${plan.id}.price`)}
            </p>
            <ul className="flex flex-col gap-2 text-left text-body-sm text-fg">
              {plan.features.map((feat) => (
                <li key={feat} className="flex items-center gap-2">
                  <Check
                    aria-hidden="true"
                    className="size-4 text-primary-600"
                  />
                  <span>{t(`features.${feat}`)}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
