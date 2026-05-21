import { Loader2 } from "lucide-react";
import { forwardRef } from "react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export interface LoadingButtonProps extends ButtonProps {
  pending?: boolean;
  pendingLabel?: string;
}

export const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ pending, pendingLabel, disabled, children, className, ...rest }, ref) => (
    <Button
      ref={ref}
      disabled={disabled ?? pending}
      aria-busy={pending || undefined}
      className={cn(className)}
      {...rest}
    >
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          {pendingLabel ?? children}
        </>
      ) : (
        children
      )}
    </Button>
  ),
);
LoadingButton.displayName = "LoadingButton";
