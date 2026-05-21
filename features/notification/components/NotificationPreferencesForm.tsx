"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { LoadingButton } from "@/components/feedback";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/sonner";
import type { NotificationPreferences } from "@/lib/api/schemas/notification";

import {
  usePreferences,
  useUpdatePreferences,
} from "../api/notification.client";

export interface NotificationPreferencesFormProps {
  /** Server-fetched preferences used as initial data so the form is render-ready. */
  initial: NotificationPreferences;
}

export function NotificationPreferencesForm({
  initial,
}: NotificationPreferencesFormProps) {
  const t = useTranslations("notifications.preferences");
  const query = usePreferences(initial);
  const update = useUpdatePreferences();

  const remote = query.data ?? initial;
  const [local, setLocal] = useState<NotificationPreferences>(remote);
  const [synced, setSynced] = useState<NotificationPreferences>(remote);

  // Re-sync if a refetch lands different values from another tab.
  if (
    remote.in_app !== synced.in_app ||
    remote.push !== synced.push ||
    remote.email !== synced.email
  ) {
    setSynced(remote);
    setLocal(remote);
  }

  const dirty =
    local.in_app !== remote.in_app ||
    local.push !== remote.push ||
    local.email !== remote.email;

  const handleSave = () => {
    update.mutate(local, {
      onSuccess: () => {
        toast.success(t("savedToast"));
      },
      onError: (error) => {
        toast.error(t("errorToast"), {
          ...(error.correlationId
            ? { description: t("errorWithId", { id: error.correlationId }) }
            : {}),
        });
      },
    });
  };

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        if (dirty) handleSave();
      }}
    >
      <ToggleRow
        title={t("inApp.title")}
        body={t("inApp.body")}
        checked={local.in_app}
        onChange={(value) => setLocal((prev) => ({ ...prev, in_app: value }))}
      />
      <ToggleRow
        title={t("push.title")}
        body={t("push.body")}
        checked={local.push}
        onChange={(value) => setLocal((prev) => ({ ...prev, push: value }))}
        helper={t("webPushNote")}
      />
      <ToggleRow
        title={t("email.title")}
        body={t("email.body")}
        checked={local.email}
        onChange={(value) => setLocal((prev) => ({ ...prev, email: value }))}
      />

      <div className="flex justify-end">
        <LoadingButton
          type="submit"
          variant="primary"
          pending={update.isPending}
          pendingLabel={t("savePending")}
          disabled={!dirty || update.isPending}
        >
          {t("save")}
        </LoadingButton>
      </div>
    </form>
  );
}

interface ToggleRowProps {
  title: string;
  body: string;
  helper?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

function ToggleRow({ title, body, helper, checked, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-border bg-bg-elevated px-5 py-4">
      <div className="flex flex-col gap-1">
        <span className="text-body font-semibold text-fg">{title}</span>
        <p className="text-body-sm text-fg-muted">{body}</p>
        {helper ? <p className="text-caption text-fg-muted">{helper}</p> : null}
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        aria-label={title}
        className="mt-1"
      />
    </div>
  );
}
