import { useTranslations } from "next-intl";
import Link from "next/link";

import { Money } from "@/components/locale";
import { MinioImage } from "@/components/media";
import { Card } from "@/components/ui/card";
import type { SimilarProductResponse } from "@/lib/api/schemas";
import { cn } from "@/lib/utils/cn";

export interface SimilarProductsStripProps {
  products: ReadonlyArray<SimilarProductResponse>;
  className?: string;
}

export function SimilarProductsStrip({
  products,
  className,
}: SimilarProductsStripProps) {
  const t = useTranslations("productDetail.similar");
  const tCard = useTranslations("productCard");

  if (products.length === 0) return null;

  return (
    <section
      aria-label={t("heading")}
      className={cn("flex flex-col gap-4", className)}
    >
      <h2 className="text-h3 font-semibold text-fg">{t("heading")}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <SimilarProductCard
            key={product.id}
            product={product}
            cardLabel={tCard("openLabel", { name: product.name })}
          />
        ))}
      </div>
    </section>
  );
}

function SimilarProductCard({
  product,
  cardLabel,
}: {
  product: SimilarProductResponse;
  cardLabel: string;
}) {
  const numericPrice =
    typeof product.price === "string" ? Number(product.price) : product.price;
  const showPrice =
    numericPrice !== null && numericPrice !== undefined && Number.isFinite(numericPrice);

  return (
    <Card className="group relative flex flex-col gap-3 overflow-hidden p-3 transition-shadow duration-fast ease-standard hover:shadow-md">
      <Link
        href={`/product/${product.slug}`}
        aria-label={cardLabel}
        className={cn(
          "absolute inset-0 z-0 rounded-lg",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        )}
      />
      <div className="relative aspect-square overflow-hidden rounded-md bg-bg-muted">
        {product.primary_image ? (
          <MinioImage
            src={product.primary_image}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover"
          />
        ) : null}
      </div>
      <h3 className="relative line-clamp-2 text-body font-semibold leading-tight text-fg">
        {product.name}
      </h3>
      <div className="relative mt-auto">
        {showPrice && product.currency ? (
          <Money
            amount={numericPrice as number}
            currency={product.currency}
            maximumFractionDigits={0}
            className="text-body font-semibold text-fg"
          />
        ) : (
          <span className="text-body-sm text-fg-muted">—</span>
        )}
      </div>
    </Card>
  );
}
