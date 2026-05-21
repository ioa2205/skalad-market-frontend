import { useTranslations } from "next-intl";

import { Money } from "@/components/locale";
import { cn } from "@/lib/utils/cn";

type PriceType = "FIXED" | "FROM_PRICE" | "NEGOTIABLE";
type Currency = "UZS" | "USD";

export interface PriceBlockProps {
  priceType: PriceType;
  amount: number | null;
  currency: Currency;
  /** Optional unit translation key suffix (e.g. "ton" → "за тонну"). */
  unit?: string | undefined;
  /** Optional minimum-order quantity rendered below the price. */
  minOrder?: number | undefined;
  className?: string;
}

export function PriceBlock({
  priceType,
  amount,
  currency,
  unit,
  minOrder,
  className,
}: PriceBlockProps) {
  const t = useTranslations("productDetail.price");
  const tQty = useTranslations("productDetail.quantity");

  const showAmount =
    priceType !== "NEGOTIABLE" &&
    amount !== null &&
    Number.isFinite(amount);

  return (
    <div
      data-testid="price-block"
      className={cn(
        "flex flex-col gap-1 rounded-lg bg-primary-100 px-4 py-3 text-primary-900",
        "dark:bg-primary-950 dark:text-primary-100",
        className,
      )}
    >
      {showAmount ? (
        <span className="flex items-baseline gap-1">
          {priceType === "FROM_PRICE" ? (
            <span className="text-body-sm text-primary-600 dark:text-primary-300">
              {t("fromPrefix")}
            </span>
          ) : null}
          <Money
            amount={amount as number}
            currency={currency}
            maximumFractionDigits={0}
            className="text-h2 font-bold leading-tight"
          />
        </span>
      ) : (
        <span className="text-h3 font-semibold leading-tight">
          {t("negotiable")}
        </span>
      )}

      {unit ? (
        <span className="text-caption text-primary-600 dark:text-primary-300">
          {t("perUnit", { unit: tQty("unit", { unit }) })}
        </span>
      ) : null}

      {typeof minOrder === "number" && minOrder > 0 ? (
        <span className="text-caption text-primary-600 dark:text-primary-300">
          {unit
            ? t("minOrder", {
                quantity: minOrder,
                unit: tQty("unit", { unit }),
              })
            : t("minOrderNoUnit", { quantity: minOrder })}
        </span>
      ) : null}
    </div>
  );
}
