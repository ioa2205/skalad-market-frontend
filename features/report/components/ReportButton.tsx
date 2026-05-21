"use client";

import { Flag } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, type ReactNode } from "react";

import { Button, type ButtonProps } from "@/components/ui/button";
import type { TargetType } from "@/lib/api/schemas/enums";

import { ReportModal } from "./ReportModal";

interface ReportButtonProps {
  targetType: TargetType;
  targetId: number;
  targetLabel?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  /** Override the default icon+label trigger. */
  children?: ReactNode;
  className?: string;
}

/**
 * Self-contained trigger + modal for the abuse-report flow. Drop it next to
 * any product / company / chat surface — it handles open state and unmounting
 * the modal on close.
 */
export function ReportButton({
  targetType,
  targetId,
  targetLabel,
  variant = "ghost",
  size = "sm",
  children,
  className,
}: ReportButtonProps) {
  const t = useTranslations("report");
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
      >
        {children ?? (
          <>
            <Flag aria-hidden="true" />
            <span>{t("trigger")}</span>
          </>
        )}
      </Button>
      {open ? (
        <ReportModal
          open={open}
          onOpenChange={setOpen}
          targetType={targetType}
          targetId={targetId}
          {...(targetLabel ? { targetLabel } : {})}
        />
      ) : null}
    </>
  );
}
