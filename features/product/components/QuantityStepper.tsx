"use client";

import { Minus, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, type ChangeEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";

export interface QuantityStepperProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  inputId?: string;
  className?: string;
  inputClassName?: string;
}

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(Math.trunc(value), min), max);
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  // Math.floor(Number.MAX_SAFE_INTEGER / 1e9) keeps multiplications by price safe.
  max = 9_007_199,
  inputId,
  className,
  inputClassName,
}: QuantityStepperProps) {
  const t = useTranslations("productDetail.quantity");

  const setSafe = useCallback(
    (next: number) => {
      onChange(clamp(next, min, max));
    },
    [onChange, min, max],
  );

  const onInput = (event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    if (raw === "") {
      onChange(min);
      return;
    }
    const parsed = Number.parseInt(raw, 10);
    if (Number.isNaN(parsed)) return;
    setSafe(parsed);
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label htmlFor={inputId} className="text-body-sm font-medium text-fg">
        {t("label")}
      </Label>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          size="icon"
          aria-label={t("decrease")}
          onClick={() => setSafe(value - 1)}
          disabled={value <= min}
        >
          <Minus aria-hidden="true" />
        </Button>
        <Input
          id={inputId}
          type="number"
          inputMode="numeric"
          pattern="\d*"
          min={min}
          max={max}
          value={Number.isFinite(value) ? value : min}
          onChange={onInput}
          className={cn("h-10 w-20 text-center", inputClassName)}
        />
        <Button
          type="button"
          variant="secondary"
          size="icon"
          aria-label={t("increase")}
          onClick={() => setSafe(value + 1)}
          disabled={value >= max}
        >
          <Plus aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
