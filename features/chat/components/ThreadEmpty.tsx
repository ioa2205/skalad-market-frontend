"use client";

import { MessageSquare } from "lucide-react";
import { useTranslations } from "next-intl";

import { EmptyState } from "@/components/feedback";

export function ThreadEmpty() {
  const t = useTranslations("chats.thread.empty");
  return (
    <div className="flex h-full items-center justify-center p-6">
      <EmptyState
        icon={MessageSquare}
        title={t("title")}
        description={t("body")}
        className="w-full max-w-md"
      />
    </div>
  );
}
