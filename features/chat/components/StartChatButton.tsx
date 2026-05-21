"use client";

import { MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { type ReactNode } from "react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

import { useCreateThread } from "../api/chat.client";

export interface StartChatButtonProps
  extends Omit<ButtonProps, "onClick" | "children"> {
  sellerCompanyId: number;
  productId?: number | undefined;
  /** Whether the current user is a SELLER. The backend rejects seller-initiated threads. */
  isSeller?: boolean;
  children?: ReactNode;
  /** Override navigation (defaults to /chats/[threadId]). */
  onSuccess?: (threadId: number) => void;
}

export function StartChatButton({
  sellerCompanyId,
  productId,
  isSeller = false,
  children,
  onSuccess,
  ...buttonProps
}: StartChatButtonProps) {
  const router = useRouter();
  const t = useTranslations("chats.start");
  const createThread = useCreateThread();

  const handleClick = () => {
    if (isSeller) {
      toast.message(t("sellerOnlyToast"), {
        description: t("sellerOnlyBody"),
      });
      return;
    }
    createThread.mutate(
      { sellerCompanyId, ...(productId !== undefined ? { productId } : {}) },
      {
        onSuccess: ({ thread_id }) => {
          if (onSuccess) onSuccess(thread_id);
          else router.push(`/chats/${thread_id}`);
        },
        onError: (error) => {
          toast.error(t("errorToast"), {
            ...(error.correlationId
              ? { description: t("errorWithId", { id: error.correlationId }) }
              : {}),
          });
        },
      },
    );
  };

  return (
    <Button {...buttonProps} onClick={handleClick} disabled={createThread.isPending}>
      <MessageCircle aria-hidden="true" />
      {children}
    </Button>
  );
}
