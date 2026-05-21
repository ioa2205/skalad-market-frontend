import type { ReactNode } from "react";

import { Logo } from "@/components/brand";

/**
 * Centered card layout used by every (public) auth surface. The card itself
 * lives in <AuthCard /> so each page composes only its own content.
 */
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-start gap-8 bg-bg px-4 py-10 sm:py-16">
      <Logo variant="full" size="lg" className="text-fg" />
      <div className="w-full max-w-[600px]">{children}</div>
    </main>
  );
}
