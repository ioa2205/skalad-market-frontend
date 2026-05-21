"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect } from "react";

import { ThreadList, chatKeys } from "@/features/chat";
import type { ChatThreadResponse } from "@/lib/api/schemas/chat";
import { cn } from "@/lib/utils/cn";

export interface ChatLayoutShellProps {
  threads: ChatThreadResponse[];
  meta: { total: number; page: number; perPage: number; totalPages: number };
  error?: { code: string; correlationId?: string | undefined };
  children: React.ReactNode;
}

const PARAMS = { page: 1, perPage: 30 };

export function ChatLayoutShell({
  threads,
  meta,
  error,
  children,
}: ChatLayoutShellProps) {
  const params = useParams<{ threadId?: string }>();
  const activeThreadId = params?.threadId ? Number(params.threadId) : null;
  const queryClient = useQueryClient();

  // Seed the client cache so opening a thread doesn't re-flicker.
  useEffect(() => {
    queryClient.setQueryData(chatKeys.threads(PARAMS), { items: threads, meta });
  }, [queryClient, threads, meta]);

  return (
    <div className="grid h-[calc(100vh-4rem)] grid-cols-1 md:grid-cols-[320px_minmax(0,1fr)]">
      <div
        className={cn(
          "min-h-0 border-r border-border",
          activeThreadId !== null ? "hidden md:flex md:flex-col" : "flex flex-col",
        )}
      >
        <ThreadList
          threads={threads}
          activeThreadId={activeThreadId}
          isError={!!error}
          {...(error?.correlationId
            ? { errorCorrelationId: error.correlationId }
            : {})}
        />
      </div>
      <div
        className={cn(
          "min-h-0 flex-col bg-bg",
          activeThreadId !== null ? "flex" : "hidden md:flex",
        )}
      >
        {children}
      </div>
    </div>
  );
}
