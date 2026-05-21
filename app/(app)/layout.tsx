import type { ReactNode } from "react";

import { AppShell } from "@/components/layout";
import { AiAgentMount } from "@/features/ai-agent";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell>
      {children}
      <AiAgentMount />
    </AppShell>
  );
}
