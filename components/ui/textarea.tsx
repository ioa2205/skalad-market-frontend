import { forwardRef, type TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...rest }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-24 w-full rounded-md border border-border bg-bg-elevated px-3.5 py-2 text-body text-fg",
        "placeholder:text-fg-subtle",
        "transition-colors duration-fast ease-standard",
        "focus-visible:border-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        "aria-[invalid=true]:border-danger aria-[invalid=true]:focus-visible:ring-danger",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...rest}
    />
  ),
);
Textarea.displayName = "Textarea";
