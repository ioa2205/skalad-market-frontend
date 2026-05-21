"use client";

import { Eye, EyeOff } from "lucide-react";
import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";

export interface PasswordInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  showLabel: string;
  hideLabel: string;
  iconLeft?: ReactNode;
  variant?: "default" | "pill";
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    { className, showLabel, hideLabel, iconLeft, variant = "default", ...rest },
    ref,
  ) => {
    const [visible, setVisible] = useState(false);
    const Icon = visible ? EyeOff : Eye;
    const togglePadding = variant === "pill" ? "right-1.5" : "right-0";
    const toggleRadius = variant === "pill" ? "rounded-2xl" : "rounded-r-md";

    return (
      <div className="relative">
        <Input
          ref={ref}
          type={visible ? "text" : "password"}
          iconLeft={iconLeft}
          variant={variant}
          className={cn(variant === "pill" ? "pr-12" : "pr-11", className)}
          {...rest}
        />
        <button
          type="button"
          aria-label={visible ? hideLabel : showLabel}
          aria-pressed={visible}
          onClick={() => setVisible((v) => !v)}
          className={cn(
            "absolute inset-y-0 flex w-11 items-center justify-center text-fg-muted",
            togglePadding,
            toggleRadius,
            "transition-colors duration-fast ease-standard hover:text-fg",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
          )}
        >
          <Icon className="size-4" aria-hidden="true" />
        </button>
      </div>
    );
  },
);
PasswordInput.displayName = "PasswordInput";
