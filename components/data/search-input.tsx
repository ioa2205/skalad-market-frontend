"use client";

import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { forwardRef, useEffect, useRef, useState, type InputHTMLAttributes } from "react";

import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import { cn } from "@/lib/utils/cn";

export interface SearchInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "defaultValue"> {
  value?: string;
  defaultValue?: string;
  /** Debounced change handler — fires after the user stops typing. */
  onSearchChange?: (value: string) => void;
  debounceMs?: number;
  clearLabel?: string;
  inputClassName?: string;
  iconClassName?: string;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      value,
      defaultValue = "",
      onSearchChange,
      debounceMs = 250,
      clearLabel,
      placeholder,
      className,
      inputClassName,
      iconClassName,
      type = "search",
      ...rest
    },
    ref,
  ) => {
    const t = useTranslations("search");
    const isControlled = value !== undefined;
    const [internal, setInternal] = useState(defaultValue);
    const current = isControlled ? value : internal;
    const debounced = useDebouncedValue(current, debounceMs);
    const lastEmitted = useRef<string | null>(null);

    useEffect(() => {
      if (!onSearchChange) return;
      if (lastEmitted.current === debounced) return;
      lastEmitted.current = debounced;
      onSearchChange(debounced);
    }, [debounced, onSearchChange]);

    return (
      <div className={cn("relative w-full", className)}>
        <Search
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-subtle",
            iconClassName,
          )}
        />
        <input
          ref={ref}
          type={type}
          value={current}
          placeholder={placeholder ?? t("placeholder")}
          onChange={(event) => {
            const next = event.target.value;
            if (!isControlled) setInternal(next);
            else onSearchChange?.(next);
          }}
          className={cn(
            "flex h-11 w-full rounded-full border border-border bg-bg-elevated px-9 text-body text-fg",
            "placeholder:text-fg-subtle",
            "transition-colors duration-fast ease-standard",
            "focus-visible:border-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
            inputClassName,
          )}
          {...rest}
        />
        {current ? (
          <button
            type="button"
            onClick={() => {
              if (!isControlled) setInternal("");
              onSearchChange?.("");
            }}
            aria-label={clearLabel ?? t("clear")}
            className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-fg-muted hover:bg-bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            <X className="size-3.5" />
          </button>
        ) : null}
      </div>
    );
  },
);
SearchInput.displayName = "SearchInput";
