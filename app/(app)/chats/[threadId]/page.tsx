import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { EmptyState } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import { ChatThreadView } from "@/features/chat";
import {
  fetchMessagesServer,
  fetchThreadsServer,
} from "@/features/chat/api/chat.server";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const THREADS_PER_PAGE = 30;
const MESSAGES_PER_PAGE = 30;

interface PageProps {
  params: Promise<{ threadId: string }>;
}

export default async function ChatThreadPage({ params }: PageProps) {
  const { threadId: threadIdRaw } = await params;
  const threadId = Number(threadIdRaw);
  if (!Number.isFinite(threadId)) notFound();

  const [threadsResult, messagesResult, session, t] = await Promise.all([
    fetchThreadsServer({ page: 1, perPage: THREADS_PER_PAGE }),
    fetchMessagesServer({ threadId, page: 1, perPage: MESSAGES_PER_PAGE }),
    getSession(),
    getTranslations("chats.thread"),
  ]);

  const thread = threadsResult.items.find((t) => t.thread_id === threadId);
  if (!thread) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <EmptyState
          title={t("notFound.title")}
          description={t("notFound.body")}
          action={
            <Button asChild variant="primary" size="sm">
              <Link href="/chats">{t("notFound.cta")}</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const currentUserId = session ? Number(session.userId) || 0 : 0;

  return (
    <ChatThreadView
      thread={thread}
      initialMessages={messagesResult.items}
      {...(messagesResult.error ? { initialError: messagesResult.error } : {})}
      currentUserId={currentUserId}
    />
  );
}
