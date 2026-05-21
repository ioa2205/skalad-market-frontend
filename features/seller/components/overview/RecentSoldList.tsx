import { Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import type { ProductResponse } from "@/lib/api/schemas/product";

export interface RecentSoldListProps {
  products: ProductResponse[];
  /** Seller's company name — every product on this dashboard belongs to it. */
  companyName?: string;
}

/**
 * Renders the last few items from `/products/my` styled to match the
 * "Последние проданые товары" Figma list (seller_dashboard_1.svg). We don't
 * have a real "sold" timestamp from backend — the list is just the most
 * recently created items. The "Продано" badge is decorative until backend
 * exposes status.
 */
export function RecentSoldList({ products, companyName }: RecentSoldListProps) {
  const t = useTranslations("seller.dashboard.overview.recent");

  return (
    <section
      aria-labelledby="seller-recent-title"
      className="flex flex-col gap-4 rounded-lg border border-chrome-border bg-bg-elevated p-4"
    >
      <header className="flex items-center justify-between gap-3">
        <h2 id="seller-recent-title" className="text-h3 font-bold text-fg">
          {t("title")}
        </h2>
        <Link
          href="/seller/products"
          className="text-body-sm font-medium text-primary-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {t("seeAll")}
        </Link>
      </header>

      {products.length === 0 ? (
        <p className="text-body-sm text-fg-muted">{t("empty")}</p>
      ) : (
        <ul className="flex flex-col gap-5">
          {products.slice(0, 5).map((product) => {
            const primaryImage =
              product.images?.find((image) => image.is_primary) ??
              product.images?.[0];

            return (
              <li
                key={product.id}
                className="flex h-[108px] items-start gap-4 rounded-lg border border-chrome-border bg-bg-elevated p-5"
              >
                <span
                  aria-hidden={primaryImage ? undefined : "true"}
                  className="flex h-[66px] w-[127px] shrink-0 items-center justify-center overflow-hidden rounded-sm bg-bg-muted text-fg-subtle"
                >
                  {primaryImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={primaryImage.url}
                      alt={product.name}
                      className="size-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="size-5" />
                  )}
                </span>

                <div className="flex flex-1 flex-col gap-0.5">
                  <Link
                    href={`/product/${product.slug}`}
                    className="text-body font-semibold text-fg hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {product.name}
                  </Link>
                  {companyName ? (
                    <p className="text-caption text-fg-muted">{companyName}</p>
                  ) : null}
                  <p className="text-caption text-fg-subtle">
                    {product.price !== null && product.price !== undefined
                      ? `${product.price} ${product.currency}`
                      : t("priceNegotiable")}
                  </p>
                </div>

                <Badge variant="success" className="rounded-sm px-2 py-1">
                  {t("badge")}
                </Badge>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
