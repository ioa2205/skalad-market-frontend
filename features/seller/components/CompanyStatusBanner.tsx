import { AlertTriangle, Clock, ShieldOff } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import type { VerificationStatus } from "@/lib/api/schemas/enums";
import { cn } from "@/lib/utils/cn";

export interface CompanyStatusBannerProps {
  status: VerificationStatus;
  isBlocked: boolean;
  rejectReason?: string | null;
  /** Slot for a CTA (e.g. Reapply / Edit profile). */
  action?: ReactNode;
}

type BannerTone = "info" | "warning" | "danger";

interface BannerCopy {
  tone: BannerTone;
  Icon: typeof Clock;
  title: string;
  description: string;
}

/**
 * Renders nothing for VERIFIED + not blocked (the dashboard is fully
 * functional). For PENDING / REJECTED / blocked, surfaces a compact
 * banner with a CTA slot so each tab can hint the right next action.
 */
export function CompanyStatusBanner({
  status,
  isBlocked,
  rejectReason,
  action,
}: CompanyStatusBannerProps) {
  const t = useTranslations("seller.dashboard.statusBanner");

  if (isBlocked) {
    return renderBanner({
      tone: "danger",
      Icon: ShieldOff,
      title: t("blockedTitle"),
      description: t("blockedDescription"),
      action,
    });
  }

  if (status === "PENDING_VERIFICATION") {
    return renderBanner({
      tone: "info",
      Icon: Clock,
      title: t("pendingTitle"),
      description: t("pendingDescription"),
      action,
    });
  }

  if (status === "REJECTED") {
    return renderBanner({
      tone: "warning",
      Icon: AlertTriangle,
      title: t("rejectedTitle"),
      description:
        rejectReason && rejectReason.length > 0
          ? t("rejectedDescriptionWithReason", { reason: rejectReason })
          : t("rejectedDescription"),
      action,
    });
  }

  if (status === "DRAFT") {
    return renderBanner({
      tone: "warning",
      Icon: AlertTriangle,
      title: t("draftTitle"),
      description: t("draftDescription"),
      action,
    });
  }

  return null;
}

function renderBanner({
  tone,
  Icon,
  title,
  description,
  action,
}: BannerCopy & { action?: ReactNode }) {
  return (
    <div
      role="status"
      className={cn(
        "mx-auto mt-4 flex w-full max-w-screen-xl flex-col gap-3 rounded-lg border px-4 py-3 md:mt-6 md:flex-row md:items-center md:justify-between md:px-6",
        tone === "info" &&
          "border-primary-200 bg-primary-50 text-primary-600 dark:border-primary-800 dark:bg-primary-950 dark:text-primary-100",
        tone === "warning" &&
          "border-warning/40 bg-warning-soft text-warning-soft-foreground",
        tone === "danger" &&
          "border-danger/40 bg-danger-soft text-danger-soft-foreground",
      )}
    >
      <div className="flex items-start gap-3">
        <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
        <div className="flex flex-col gap-0.5">
          <p className="text-body-sm font-semibold">{title}</p>
          <p className="text-caption opacity-80">{description}</p>
        </div>
      </div>
      {action ? <div className="md:self-center">{action}</div> : null}
    </div>
  );
}
