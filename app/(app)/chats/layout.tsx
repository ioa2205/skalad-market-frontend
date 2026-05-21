import type { ReactNode } from "react";

import { fetchThreadsServer } from "@/features/chat/api/chat.server";

import { ChatLayoutShell } from "./ChatLayoutShell";

export const dynamic = "force-dynamic";

const PER_PAGE = 30;

export default async function ChatsLayout({ children }: { children: ReactNode }) {
  const result = await fetchThreadsServer({ page: 1, perPage: PER_PAGE });
  return (
    <ChatLayoutShell
      threads={result.items}
      meta={result.meta}
      {...(result.error ? { error: result.error } : {})}
    >
      {children}
    </ChatLayoutShell>
  );
}
