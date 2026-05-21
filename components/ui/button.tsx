import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium",
    "transition-colors duration-fast ease-standard",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        primary:
          "bg-primary-600 !text-white shadow-sm hover:bg-primary-700 hover:shadow-md active:bg-primary-800",
        secondary:
          "bg-bg-elevated text-fg ring-1 ring-inset ring-border hover:bg-bg-muted",
        outline:
          "border border-border bg-transparent text-fg hover:bg-bg-muted",
        ghost: "bg-transparent text-fg hover:bg-bg-muted",
        danger: "bg-danger text-danger-foreground hover:bg-danger/90",
        "danger-soft":
          "bg-danger-soft text-danger-soft-foreground hover:bg-danger-soft/80",
        link: "rounded-none text-primary-600 underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 px-3 text-body-sm [&_svg]:size-4",
        md: "h-10 px-4 text-body [&_svg]:size-4",
        lg: "h-12 px-6 text-body-lg [&_svg]:size-5",
        icon: "size-10 [&_svg]:size-5",
        "icon-sm": "size-8 [&_svg]:size-4",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, type, ...rest }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : (type ?? "button")}
        className={cn(buttonVariants({ variant, size }), className)}
        {...rest}
      />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
