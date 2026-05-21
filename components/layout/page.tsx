import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export interface PageProps extends HTMLAttributes<HTMLElement> {
  as?: "div" | "main" | "section";
}

export function Page({ as = "main", className, ...rest }: PageProps) {
  const Tag = as;
  return (
    <Tag
      className={cn("mx-auto flex w-full max-w-screen-xl flex-col gap-8 px-4 py-6 md:px-6", className)}
      {...rest}
    />
  );
}

export interface PageHeaderProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  eyebrow?: ReactNode;
}

export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
  className,
  ...rest
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 md:flex-row md:items-end md:justify-between",
        className,
      )}
      {...rest}
    >
      <div className="flex flex-col gap-1.5">
        {eyebrow ? (
          <span className="text-overline uppercase text-fg-subtle">{eyebrow}</span>
        ) : null}
        <h1 className="text-h1 font-bold text-fg">{title}</h1>
        {description ? <p className="text-body text-fg-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export function Section({ className, ...rest }: HTMLAttributes<HTMLElement>) {
  return <section className={cn("flex flex-col gap-4", className)} {...rest} />;
}
