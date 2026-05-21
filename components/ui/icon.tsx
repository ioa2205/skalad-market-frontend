import { cva, type VariantProps } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";
import { forwardRef, type SVGAttributes } from "react";

import { cn } from "@/lib/utils/cn";

const iconVariants = cva("shrink-0", {
  variants: {
    size: {
      xs: "size-3",
      sm: "size-4",
      md: "size-5",
      lg: "size-6",
      xl: "size-7",
    },
  },
  defaultVariants: { size: "md" },
});

export interface IconProps
  extends Omit<SVGAttributes<SVGSVGElement>, "children">,
    VariantProps<typeof iconVariants> {
  as: LucideIcon;
  /** Hide from assistive tech when the icon is purely decorative. Default true. */
  decorative?: boolean;
  label?: string;
}

export const Icon = forwardRef<SVGSVGElement, IconProps>(
  ({ as: Component, size, className, decorative = true, label, ...rest }, ref) => (
    <Component
      ref={ref}
      className={cn(iconVariants({ size }), className)}
      aria-hidden={decorative ? true : undefined}
      aria-label={!decorative ? label : undefined}
      role={!decorative ? "img" : undefined}
      focusable={false}
      {...rest}
    />
  ),
);
Icon.displayName = "Icon";
