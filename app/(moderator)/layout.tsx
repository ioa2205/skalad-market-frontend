import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { AppShell } from "@/components/layout";
import { getSession } from "@/lib/auth/session";

const MODERATOR_ROLES = new Set(["ADMIN", "SUPER_ADMIN", "MODERATOR"]);

/**
 * Server-side double-check for the moderator panel.
 *
 * Middleware already gates `/moderator` on the same role set, but a layout
 * gate protects against any future client-only routing inside the group and
 * keeps the cookie/role read on the server (so a stale client cache can't
 * leak the dashboard).
 */
export default async function ModeratorLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();
  const allowed =
    session?.roles?.some((role) => MODERATOR_ROLES.has(role)) ?? false;
  if (!allowed) {
    redirect("/");
  }
  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-screen-xl flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
        {children}
      </div>
    </AppShell>
  );
}
