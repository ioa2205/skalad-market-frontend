import { ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

export interface VerifiedBadgeProps {
  /** Visible label, defaults to "Verified" via i18n at the call site. */
  label: string;
  ariaLabel?: string;
  className?: string;
  withIcon?: boolean;
}

export function VerifiedBadge({
  label,
  ariaLabel,
  className,
  withIcon = false,
}: VerifiedBadgeProps) {
  return (
    <Badge variant="success" className={cn("font-semibold", className)} aria-label={ariaLabel}>
      {withIcon ? <ShieldCheck className="size-3" aria-hidden="true" /> : null}
      {label}
    </Badge>
  );
}
