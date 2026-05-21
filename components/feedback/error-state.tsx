import { AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export interface ErrorStateProps {
  title: string;
  description?: ReactNode;
  /** Backend correlation id; rendered so users can quote it in support. */
  correlationId?: string | undefined | null;
  correlationIdLabel?: string;
  action?: ReactNode;
  className?: string;
}

export function ErrorState({
  title,
  description,
  correlationId,
  correlationIdLabel,
  action,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-danger/40 bg-danger-soft px-6 py-12 text-center text-danger-soft-foreground",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="flex size-12 items-center justify-center rounded-full bg-danger/15 text-danger"
      >
        <AlertTriangle className="size-6" />
      </span>
      <h3 className="text-h4 font-semibold">{title}</h3>
      {description ? <p className="max-w-md text-body-sm">{description}</p> : null}
      {correlationId ? (
        <p className="font-mono text-caption text-danger-soft-foreground/80">
          {correlationIdLabel ? `${correlationIdLabel} ` : ""}
          {correlationId}
        </p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
