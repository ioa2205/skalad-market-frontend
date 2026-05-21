import { useTranslations } from "next-intl";

import { MinioImage } from "@/components/media";
import { cn } from "@/lib/utils/cn";

import type { BannerFetchResult } from "../api/banners.server";

export interface BannerStripProps {
  result: BannerFetchResult;
  /** Visible-text aria-label for the strip; localized at the call site. */
  ariaLabel: string;
  /** Number of placeholder cells when the placement returns no banners. */
  emptyCells?: number;
  className?: string;
}

/**
 * Renders a row of banners. Designed to never collapse layout: when a
 * placement is empty (no banners returned) we show evenly-distributed
 * placeholder cells matching the Figma greybox so the page stays composed.
 */
export function BannerStrip({
  result,
  ariaLabel,
  emptyCells = 4,
  className,
}: BannerStripProps) {
  const t = useTranslations("home.banners");
  const banners = result.banners;
  const slots = banners.length > 0 ? banners.length : emptyCells;

  return (
    <section
      aria-label={ariaLabel}
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4",
        className,
      )}
    >
      {banners.length > 0
        ? banners.map((banner, index) => (
            <a
              key={banner.id}
              href="#"
              className={cn(
                "relative h-[187px] overflow-hidden rounded-lg bg-chrome-shortcut",
                "transition-colors duration-fast ease-standard",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
              )}
              aria-label={t("itemAria", { index: index + 1 })}
            >
              <MinioImage
                src={banner.imageUrl}
                alt=""
                fill
                sizes="(min-width: 768px) 25vw, 50vw"
                className="object-cover"
              />
            </a>
          ))
        : Array.from({ length: slots }).map((_, i) => (
            <div
              key={i}
              role="presentation"
              aria-hidden="true"
              className="h-[187px] rounded-lg bg-chrome-shortcut"
            />
          ))}
    </section>
  );
}
