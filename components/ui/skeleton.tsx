import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type HTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

const skeletonVariants = cva("animate-pulse bg-bg-muted", {
  variants: {
    variant: {
      box: "rounded-md",
      text: "h-3.5 rounded-sm",
      circle: "rounded-full",
    },
  },
  defaultVariants: { variant: "box" },
});

export interface SkeletonProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant, role = "status", ...rest }, ref) => (
    <div
      ref={ref}
      role={role}
      aria-hidden={role === "status" ? undefined : true}
      aria-busy="true"
      className={cn(skeletonVariants({ variant }), className)}
      {...rest}
    />
  ),
);
Skeleton.displayName = "Skeleton";

export { skeletonVariants };
