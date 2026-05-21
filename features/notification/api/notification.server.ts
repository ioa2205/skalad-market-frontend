import "server-only";

import { serverFetch } from "@/lib/api/server";
import {
  NotificationPreferences,
  type NotificationPreferences as NotificationPreferencesT,
} from "@/lib/api/schemas/notification";
import { log } from "@/lib/log";

export interface PreferencesResult {
  preferences?: NotificationPreferencesT;
  error?: { code: string; correlationId?: string | undefined };
}

export async function fetchPreferencesServer(): Promise<PreferencesResult> {
  try {
    const preferences = await serverFetch("/api/v1/notifications/preferences", {
      schema: NotificationPreferences,
      cache: "no-store",
    });
    return { preferences };
  } catch (error) {
    const err = error as { code?: string; correlationId?: string };
    log.warn("notifications.preferences.fetch.failed", {
      code: err.code ?? "unknown.error",
      correlationId: err.correlationId,
    });
    return {
      error: {
        code: err.code ?? "unknown.error",
        correlationId: err.correlationId,
      },
    };
  }
}
