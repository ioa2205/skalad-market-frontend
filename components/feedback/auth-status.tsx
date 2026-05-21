import { CheckCircle2, Loader2, XCircle, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export type AuthStatusVariant = "pending" | "success" | "error";

export interface AuthStatusProps {
  variant: AuthStatusVariant;
  title: ReactNode;
  body?: ReactNode;
  /** Footer slot — typically a link/button back to login. */
  footer?: ReactNode;
  /** Optional correlation id surfaced under the body for support handoff. */
  correlationId?: string;
}

const VARIANT: Record<
  AuthStatusVariant,
  { icon: LucideIcon; iconClass: string; role: "status" | "alert" }
> = {
  pending: { icon: Loader2, iconClass: "text-fg-muted animate-spin", role: "status" },
  success: { icon: CheckCircle2, iconClass: "text-success", role: "status" },
  error: { icon: XCircle, iconClass: "text-danger", role: "alert" },
};

/**
 * Centered status block for the verify and reset surfaces. Renders the three
 * async states (pending / success / error) with a single shape so the user
 * never sees a layout jump as the request resolves.
 */
export function AuthStatus({
  variant,
  title,
  body,
  footer,
  correlationId,
}: AuthStatusProps) {
  const { icon: Icon, iconClass, role } = VARIANT[variant];
  return (
    <div role={role} className="flex flex-col items-center gap-4 text-center">
      <Icon className={cn("size-10", iconClass)} aria-hidden="true" />
      <div className="space-y-1">
        <h2 className="text-h3 text-fg">{title}</h2>
        {body ? <p className="text-body-sm text-fg-muted">{body}</p> : null}
      </div>
      {correlationId ? (
        <p className="text-caption text-fg-subtle">{correlationId}</p>
      ) : null}
      {footer ? <div className="pt-2">{footer}</div> : null}
    </div>
  );
}
