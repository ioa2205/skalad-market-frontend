import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils/cn";

export interface SpinnerProps {
  className?: string;
  label?: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap: Record<NonNullable<SpinnerProps["size"]>, string> = {
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
};

export function Spinner({ className, label, size = "md" }: SpinnerProps) {
  return (
    <span role="status" className={cn("inline-flex items-center gap-2 text-fg-muted", className)}>
      <Loader2 className={cn(sizeMap[size], "animate-spin")} aria-hidden="true" />
      {label ? <span>{label}</span> : <span className="sr-only">{label ?? "Loading"}</span>}
    </span>
  );
}
