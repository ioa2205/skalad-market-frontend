import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

type Gap = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;

export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  gap?: Gap;
  align?: "start" | "center" | "end" | "stretch";
}

const gapClass: Record<Gap, string> = {
  0: "gap-0",
  1: "gap-1",
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  5: "gap-5",
  6: "gap-6",
  8: "gap-8",
  10: "gap-10",
  12: "gap-12",
};

const alignClass = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
} as const;

export function Stack({ gap = 4, align = "stretch", className, ...rest }: StackProps) {
  return (
    <div className={cn("flex flex-col", gapClass[gap], alignClass[align], className)} {...rest} />
  );
}

export interface InlineProps extends HTMLAttributes<HTMLDivElement> {
  gap?: Gap;
  align?: "start" | "center" | "end" | "baseline";
  justify?: "start" | "center" | "end" | "between";
  wrap?: boolean;
}

const justifyClass = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
} as const;

const inlineAlignClass = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  baseline: "items-baseline",
} as const;

export function Inline({
  gap = 2,
  align = "center",
  justify = "start",
  wrap,
  className,
  ...rest
}: InlineProps) {
  return (
    <div
      className={cn(
        "flex",
        wrap && "flex-wrap",
        gapClass[gap],
        inlineAlignClass[align],
        justifyClass[justify],
        className,
      )}
      {...rest}
    />
  );
}
