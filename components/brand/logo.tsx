import Image from "next/image";

import { cn } from "@/lib/utils/cn";

export interface LogoProps {
  variant?: "full" | "wordmark" | "mark";
  className?: string;
  /** Accessible label for the brand. Visual wordmark is the SVG asset. */
  label?: string;
  size?: "sm" | "md" | "lg";
}

// Figma navbar header uses mark 24.62 × 25.29 + wordmark 102.77 × 18,
// 10 px gap between them. We scale proportionally for sm/lg.
const SIZE = {
  sm: { mark: 20, wordW: 84, wordH: 15 },
  md: { mark: 25, wordW: 103, wordH: 18 },
  lg: { mark: 40, wordW: 165, wordH: 29 },
} as const;

export function Logo({
  variant = "full",
  className,
  label = "SkladX",
  size = "md",
}: LogoProps) {
  const { mark, wordW, wordH } = SIZE[size];
  const eager = size === "lg";

  return (
    <span
      className={cn("inline-flex items-center gap-[10px]", className)}
      aria-label={label}
      role="img"
    >
      {variant !== "wordmark" ? (
        <Image
          src="/brand/skladx-mark.svg"
          alt=""
          width={mark}
          height={mark}
          priority={eager}
          className="shrink-0"
        />
      ) : null}
      {variant !== "mark" ? (
        <Image
          src="/brand/skladx-wordmark.svg"
          alt=""
          width={wordW}
          height={wordH}
          priority={eager}
          className="shrink-0"
        />
      ) : null}
    </span>
  );
}
