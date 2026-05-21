import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Render an icon inside the input on the leading edge. */
  iconLeft?: ReactNode;
  /**
   * `default` is the rectangular bordered field used by filters/forms;
   * `pill` is the rounded-full soft-gray field used on the auth pages.
   */
  variant?: "default" | "pill";
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", iconLeft, variant = "default", ...rest }, ref) => {
    const base =
      variant === "pill"
        ? "h-[55px] rounded-2xl border border-chrome-border bg-bg-muted"
        : "h-11 rounded-md border border-border bg-bg-elevated";

    const padding = iconLeft
      ? variant === "pill"
        ? "pl-11 pr-4"
        : "pl-10 pr-3.5"
      : variant === "pill"
        ? "px-5"
        : "px-3.5";

    const field = (
      <input
        ref={ref}
        type={type}
        className={cn(
          "flex w-full py-2 text-body text-fg",
          base,
          padding,
          "placeholder:text-fg-subtle",
          "transition-colors duration-fast ease-standard",
          "focus-visible:border-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
          "aria-[invalid=true]:border-danger aria-[invalid=true]:focus-visible:ring-danger",
          "disabled:cursor-not-allowed disabled:opacity-60",
          "file:border-0 file:bg-transparent file:text-body-sm file:font-medium file:text-fg",
          className,
        )}
        {...rest}
      />
    );

    if (!iconLeft) return field;

    return (
      <div className="relative">
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-y-0 flex items-center justify-center text-fg-subtle [&>svg]:size-4",
            variant === "pill" ? "left-4" : "left-3",
          )}
        >
          {iconLeft}
        </span>
        {field}
      </div>
    );
  },
);
Input.displayName = "Input";
