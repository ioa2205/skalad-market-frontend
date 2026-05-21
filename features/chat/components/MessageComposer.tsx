"use client";

import { Paperclip, Send, Smile, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState, type FormEvent, type KeyboardEvent } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import { cn } from "@/lib/utils/cn";

import { uploadAttachment } from "../api/chat.client";

export interface MessageComposerProps {
  threadId: number;
  /** True while the rate limit is saturated; composer is disabled. */
  rateLimited?: boolean;
  /** Disable when the WS isn't open (offline / reconnecting). */
  disabled?: boolean;
  onSend: (input: { body?: string; attachmentKey?: string; attachmentUrl?: string }) => void;
  onTyping?: () => void;
}

const MAX_BYTES = 10 * 1024 * 1024;

export function MessageComposer({
  threadId,
  rateLimited = false,
  disabled = false,
  onSend,
  onTyping,
}: MessageComposerProps) {
  const t = useTranslations("chats.composer");
  const [body, setBody] = useState("");
  const [pendingAttachment, setPendingAttachment] = useState<{
    key: string;
    url: string;
    file: File;
  } | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const lastTypingRef = useRef(0);

  const isDisabled = disabled || rateLimited || uploading;

  const submit = () => {
    const trimmed = body.trim();
    if (!trimmed && !pendingAttachment) return;
    if (rateLimited) {
      toast.error(t("rateLimitedToast"));
      return;
    }
    onSend({
      ...(trimmed ? { body: trimmed } : {}),
      ...(pendingAttachment
        ? {
            attachmentKey: pendingAttachment.key,
            attachmentUrl: pendingAttachment.url,
          }
        : {}),
    });
    setBody("");
    setPendingAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    } else if (onTyping) {
      const now = Date.now();
      if (now - lastTypingRef.current > 1_500) {
        lastTypingRef.current = now;
        onTyping();
      }
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit();
  };

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error(t("wrongTypeToast"));
      event.target.value = "";
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error(t("tooLargeToast"));
      event.target.value = "";
      return;
    }
    setUploading(true);
    try {
      const result = await uploadAttachment(threadId, file);
      const localUrl = URL.createObjectURL(file);
      setPendingAttachment({
        key: result.attachment_key,
        url: result.attachment_url || localUrl,
        file,
      });
    } catch (error) {
      const correlationId = (error as { correlationId?: string }).correlationId;
      toast.error(t("uploadFailed"), {
        ...(correlationId ? { description: t("errorWithId", { id: correlationId }) } : {}),
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2 border-t border-border bg-bg-elevated px-4 py-3"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleFile}
        aria-label={t("attachAria")}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={t("emojiAria")}
        disabled
      >
        <Smile />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={t("attachAria")}
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || rateLimited || uploading}
      >
        <Paperclip />
      </Button>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {pendingAttachment ? (
          <AttachmentChip
            label={pendingAttachment.file.name}
            onRemove={() => setPendingAttachment(null)}
            uploading={uploading}
            uploadingLabel={t("uploadInProgress")}
          />
        ) : null}
        <Textarea
          rows={1}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("placeholder")}
          aria-label={t("placeholder")}
          disabled={isDisabled}
          className={cn("min-h-11 resize-none rounded-full px-4 py-2.5")}
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="icon"
        aria-label={t("sendAria")}
        disabled={isDisabled || (!body.trim() && !pendingAttachment)}
      >
        <Send />
      </Button>
    </form>
  );
}

interface ChipProps {
  label: string;
  uploading: boolean;
  uploadingLabel: string;
  onRemove: () => void;
}

function AttachmentChip({ label, uploading, uploadingLabel, onRemove }: ChipProps) {
  return (
    <div className="flex w-fit items-center gap-2 rounded-full border border-border bg-bg-muted px-3 py-1 text-caption text-fg">
      <Paperclip className="size-3.5" aria-hidden="true" />
      <span className="max-w-48 truncate">{uploading ? uploadingLabel : label}</span>
      <button
        type="button"
        onClick={onRemove}
        className="rounded-full p-0.5 text-fg-muted hover:bg-bg-elevated"
        aria-label="×"
      >
        <X className="size-3" />
      </button>
    </div>
  );
}
