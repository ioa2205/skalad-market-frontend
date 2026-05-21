import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export interface AuthCardProps {
  children: ReactNode;
  className?: string;
}

/**
 * White card wrapper for every auth surface. Holds the (Войти / Регистрация)
 * tab pair, then the active form.
 */
export function AuthCard({ children, className }: AuthCardProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-chrome-border bg-bg-elevated p-8 sm:p-12",
        className,
      )}
    >
      {children}
    </section>
  );
}
