import { Badge, type BadgeProps } from "@/components/ui/badge";

/**
 * Backend enums consumed here:
 *   - LeadStatus       : NEW | VIEWED | CONTACTED | CLOSED | CANCELED
 *   - ProductStatus    : DRAFT | PENDING | APPROVED | ARCHIVED
 *   - ReportStatus     : NEW | RESOLVED | REJECTED
 *   - VerificationStatus (company): DRAFT | PENDING_VERIFICATION | VERIFIED | REJECTED
 *
 * Verified against project-documentation/backend_summary.md and
 * messages/ru.json (status.{lead,product,report,verification}).
 */

export type LeadStatus = "NEW" | "VIEWED" | "CONTACTED" | "CLOSED" | "CANCELED";
export type ProductStatus = "DRAFT" | "PENDING" | "APPROVED" | "ARCHIVED";
export type ReportStatus = "NEW" | "RESOLVED" | "REJECTED";
export type VerificationStatus =
  | "DRAFT"
  | "PENDING_VERIFICATION"
  | "VERIFIED"
  | "REJECTED";

const LEAD_VARIANT: Record<LeadStatus, BadgeProps["variant"]> = {
  NEW: "info",
  VIEWED: "neutral",
  CONTACTED: "warning",
  CLOSED: "success",
  CANCELED: "danger",
};

const PRODUCT_VARIANT: Record<ProductStatus, BadgeProps["variant"]> = {
  DRAFT: "neutral",
  PENDING: "warning",
  APPROVED: "success",
  ARCHIVED: "outline",
};

const REPORT_VARIANT: Record<ReportStatus, BadgeProps["variant"]> = {
  NEW: "warning",
  RESOLVED: "success",
  REJECTED: "danger",
};

const VERIFICATION_VARIANT: Record<VerificationStatus, BadgeProps["variant"]> = {
  DRAFT: "neutral",
  PENDING_VERIFICATION: "warning",
  VERIFIED: "success",
  REJECTED: "danger",
};

export type StatusBadgeProps =
  | { kind: "lead"; status: LeadStatus; label: string; className?: string }
  | { kind: "product"; status: ProductStatus; label: string; className?: string }
  | { kind: "report"; status: ReportStatus; label: string; className?: string }
  | {
      kind: "verification";
      status: VerificationStatus;
      label: string;
      className?: string;
    };

export function StatusBadge(props: StatusBadgeProps) {
  const variant = pickVariant(props);
  return (
    <Badge variant={variant} className={props.className}>
      {props.label}
    </Badge>
  );
}

function pickVariant(props: StatusBadgeProps): BadgeProps["variant"] {
  switch (props.kind) {
    case "lead":
      return LEAD_VARIANT[props.status];
    case "product":
      return PRODUCT_VARIANT[props.status];
    case "report":
      return REPORT_VARIANT[props.status];
    case "verification":
      return VERIFICATION_VARIANT[props.status];
  }
}
