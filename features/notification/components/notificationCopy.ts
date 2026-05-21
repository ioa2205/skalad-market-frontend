import type { NotificationResponse } from "@/lib/api/schemas/notification";

export interface NotificationCopy {
  /** i18n key under `notifications.types.*` for the title. */
  titleKey: string;
  /** i18n key for the body line. */
  bodyKey: string;
  /** Values passed into `useTranslations(...).rich` for ICU fills. */
  values: Record<string, string | number | undefined>;
  /** Optional in-app link. */
  href?: string;
}

/**
 * Maps the freeform `type` string emitted by notification-service into a copy
 * descriptor. Unknown types fall back to a generic label so a new server type
 * doesn't break the UI — the raw payload remains visible in dev tools. The
 * wire `type` strings ride straight from the backend; the i18n keys are
 * sanitized (camelCase) so `next-intl`'s dot-path resolver keeps working.
 */
export function describeNotification(
  notification: NotificationResponse,
): NotificationCopy {
  const payload = notification.payload as Record<string, unknown>;
  switch (notification.type) {
    case "lead.new": {
      const productName =
        typeof payload.productName === "string" ? payload.productName : undefined;
      const leadId = typeof payload.leadId === "number" ? payload.leadId : undefined;
      return {
        titleKey: "notifications.types.leadNew.title",
        bodyKey: "notifications.types.leadNew.body",
        values: { productName: productName ?? "undefined" },
        ...(leadId ? { href: `/account/leads?selected=${leadId}` } : {}),
      };
    }
    case "lead.status.changed": {
      const leadId = typeof payload.leadId === "number" ? payload.leadId : 0;
      const newStatus =
        typeof payload.newStatus === "string" ? payload.newStatus : "—";
      return {
        titleKey: "notifications.types.leadStatusChanged.title",
        bodyKey: "notifications.types.leadStatusChanged.body",
        values: { leadId, newStatus },
        ...(leadId ? { href: `/account/leads?selected=${leadId}` } : {}),
      };
    }
    case "chat.new_message": {
      const fromName =
        typeof payload.fromName === "string" ? payload.fromName : undefined;
      const threadId =
        typeof payload.threadId === "number" ? payload.threadId : undefined;
      return {
        titleKey: "notifications.types.chatNewMessage.title",
        bodyKey: "notifications.types.chatNewMessage.body",
        values: { fromName: fromName ?? "undefined" },
        ...(threadId ? { href: `/chats/${threadId}` } : {}),
      };
    }
    default:
      return {
        titleKey: "notifications.types.fallback.title",
        bodyKey: "notifications.types.fallback.body",
        values: {},
      };
  }
}
