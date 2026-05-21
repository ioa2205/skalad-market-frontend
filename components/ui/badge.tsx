import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type HTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-caption font-medium",
  {
    variants: {
      variant: {
        neutral: "bg-bg-muted text-fg-muted",
        primary: "bg-primary-50 text-primary-600 dark:bg-primary-950 dark:text-primary-200",
        success: "bg-success-soft text-success-soft-foreground",
        warning: "bg-warning-soft text-warning-soft-foreground",
        danger: "bg-danger-soft text-danger-soft-foreground",
        info: "bg-info-soft text-info-soft-foreground",
        outline: "border border-border bg-transparent text-fg",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, ...rest }, ref) => (
    <span ref={ref} className={cn(badgeVariants({ variant }), className)} {...rest} />
  ),
);
Badge.displayName = "Badge";

export { badgeVariants };
