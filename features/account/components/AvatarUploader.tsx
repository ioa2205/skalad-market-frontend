"use client";

import { Camera } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState } from "react";

import { LoadingButton } from "@/components/feedback/loading-button";
import { UserAvatar } from "@/components/media";
import { toast } from "@/components/ui/sonner";

import { useReplaceAvatar } from "../api/account.client";

const ACCEPT = ["image/png", "image/jpeg"] as const;
const MAX_BYTES = 5 * 1024 * 1024;

export interface AvatarUploaderProps {
  /** Resolved photo URL (already proxied). */
  currentUrl?: string | null;
  /** Display name for fallback initials. */
  name?: string | null;
}

/**
 * Two-step upload: POST /attach/upload, then PUT /users/update/photo.
 * Keeps a local preview while the network round-trip is in flight; rolls back
 * if either step fails so the avatar matches the source of truth.
 */
export function AvatarUploader({ currentUrl, name }: AvatarUploaderProps) {
  const t = useTranslations("account.avatar");
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const replace = useReplaceAvatar();

  const [preview, setPreview] = useState<string | null>(null);

  // Revoke object URLs we created so we don't leak blob memory.
  useEffect(
    () => () => {
      if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  const visibleUrl = preview ?? currentUrl ?? null;

  const handlePick = () => {
    inputRef.current?.click();
  };

  const handleFile = (file: File) => {
    if (!ACCEPT.some((mime) => mime === file.type)) {
      toast.error(t("validation.type"));
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error(t("validation.size"));
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const previousPreview = preview;
    setPreview(objectUrl);

    replace.mutate(file, {
      onSuccess: () => {
        toast.success(t("replacedToast"));
        // Keep preview until the parent re-fetches and the resolved URL lands.
        // The server URL will replace the preview on the next render once the
        // /users/photo query is invalidated upstream.
      },
      onError: (error) => {
        URL.revokeObjectURL(objectUrl);
        setPreview(previousPreview);
        toast.error(t("errorToast"), {
          ...(error.correlationId
            ? { description: t("errorWithId", { id: error.correlationId }) }
            : {}),
        });
      },
    });
  };

  return (
    <div className="flex items-start gap-5">
      <div className="relative">
        <UserAvatar
          name={name ?? undefined}
          src={visibleUrl ?? undefined}
          alt={preview ? t("previewAlt") : t("currentAlt")}
          size="lg"
        />
        {replace.isPending ? (
          <span
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center rounded-full bg-bg/60"
          >
            <span className="size-3 animate-pulse rounded-full bg-fg-muted" />
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3">
        <div>
          <p className="text-body font-semibold text-fg">{t("title")}</p>
          <p className="text-body-sm text-fg-muted">{t("subtitle")}</p>
        </div>
        <div>
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept={ACCEPT.join(",")}
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) handleFile(file);
            }}
            aria-label={t("choose")}
          />
          <LoadingButton
            type="button"
            variant="secondary"
            size="sm"
            onClick={handlePick}
            pending={replace.isPending}
            pendingLabel={t("uploading")}
          >
            <Camera aria-hidden="true" />
            {currentUrl || preview ? t("replace") : t("choose")}
          </LoadingButton>
        </div>
      </div>
    </div>
  );
}
