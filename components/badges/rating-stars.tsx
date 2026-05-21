import { Star } from "lucide-react";

import { cn } from "@/lib/utils/cn";

export interface RatingStarsProps {
  /** 0..5. Pass `null` or `undefined` to render an unrated state. */
  value: number | null | undefined;
  /** Localized aria label for the rated state, e.g. "Рейтинг {value} из 5". */
  ariaLabel: string;
  /** Localized aria label when value is missing, e.g. "Рейтинг отсутствует". */
  noRatingAriaLabel: string;
  /** Visual size — default fits inline next to a name. */
  size?: "sm" | "md";
  /** Show the numeric value next to the stars. */
  showValue?: boolean;
  className?: string;
}

const SIZES = {
  sm: "size-3.5",
  md: "size-4",
} as const;

/**
 * Display-only rating widget — no input, no half-star math (we render
 * five stars and fill them up to `Math.round(value)`). Reviews are not
 * yet a backend feature, so callers always pass stub values.
 */
export function RatingStars({
  value,
  ariaLabel,
  noRatingAriaLabel,
  size = "sm",
  showValue = false,
  className,
}: RatingStarsProps) {
  const hasValue = typeof value === "number" && Number.isFinite(value);
  const filled = hasValue
    ? Math.max(0, Math.min(5, Math.round(value)))
    : 0;

  return (
    <span
      role="img"
      aria-label={hasValue ? ariaLabel : noRatingAriaLabel}
      className={cn(
        "inline-flex items-center gap-1 text-warning",
        className,
      )}
    >
      <span aria-hidden="true" className="inline-flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              SIZES[size],
              i < filled
                ? "fill-current"
                : "fill-transparent text-fg-subtle/40",
            )}
          />
        ))}
      </span>
      {showValue ? (
        <span className="text-body-sm font-medium text-fg">
          {hasValue ? value.toFixed(1) : "—"}
        </span>
      ) : null}
    </span>
  );
}
