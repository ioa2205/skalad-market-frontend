"use client";

import { useTranslations } from "next-intl";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

import { EmptyState } from "@/components/feedback";
import { MinioImage } from "@/components/media";
import { cn } from "@/lib/utils/cn";

export interface ImageGalleryImage {
  id: string;
  url: string;
  isPrimary?: boolean;
  alt?: string;
}

export interface ImageGalleryProps {
  images: ReadonlyArray<ImageGalleryImage>;
  /** Used as fallback alt text. */
  productName: string;
  className?: string;
}

export function ImageGallery({
  images,
  productName,
  className,
}: ImageGalleryProps) {
  const t = useTranslations("productDetail.imageGallery");
  const headingId = useId();

  const sorted = images.length === 0
    ? images
    : [...images].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));

  const [activeIndex, setActiveIndex] = useState(0);
  const thumbsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveIndex(0);
  }, [images.length]);

  const total = sorted.length;
  const goTo = useCallback(
    (next: number) => {
      if (total === 0) return;
      const wrapped = ((next % total) + total) % total;
      setActiveIndex(wrapped);
    },
    [total],
  );

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(activeIndex + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(activeIndex - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      goTo(0);
    } else if (event.key === "End") {
      event.preventDefault();
      goTo(total - 1);
    }
  };

  if (total === 0) {
    return (
      <div className={cn("flex flex-col gap-4", className)}>
        <EmptyState title={t("placeholder")} />
      </div>
    );
  }

  const active = sorted[activeIndex] ?? sorted[0]!;

  return (
    <section
      aria-labelledby={headingId}
      className={cn("flex flex-col gap-4", className)}
    >
      <h2 id={headingId} className="sr-only">
        {t("label")}
      </h2>
      <div
        role="group"
        aria-roledescription="carousel"
        onKeyDown={onKeyDown}
        tabIndex={0}
        className={cn(
          "relative aspect-video overflow-hidden rounded-lg bg-bg-muted outline-none",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        )}
        style={{ touchAction: "pinch-zoom" }}
      >
        <MinioImage
          key={active.id}
          src={active.url}
          alt={active.alt ?? productName}
          fill
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="object-cover"
          priority
        />
        <span className="sr-only" aria-live="polite">
          {t("thumbnailLabel", { index: activeIndex + 1, total })}
        </span>
      </div>
      {total > 1 ? (
        <div
          ref={thumbsRef}
          role="tablist"
          aria-label={t("label")}
          className="flex gap-[19px] overflow-x-auto pb-1"
        >
          {sorted.map((image, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={image.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={t("thumbnailLabel", { index: index + 1, total })}
                tabIndex={isActive ? 0 : -1}
                onClick={() => goTo(index)}
                className={cn(
                  "relative h-[90px] w-[101px] shrink-0 overflow-hidden rounded-md bg-bg-muted ring-1 ring-inset ring-border",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
                  isActive && "ring-2 ring-primary-500",
                )}
              >
                <MinioImage
                  src={image.url}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
