import { z } from "zod";

import { ReasonCodeEnum, ReportStatusEnum, TargetTypeEnum } from "./enums";

// Report DTOs are camelCase on the wire — the backend has no @JsonProperty
// overrides on any report DTO (verified against build-plan §5 phase 10 and
// project-documentation/backend_summary.md §3.9).

export const ReportCreateRequest = z.object({
  targetType: TargetTypeEnum,
  targetId: z.number().int().positive(),
  reasonCode: ReasonCodeEnum,
  comment: z.string().max(500).optional(),
});
export type ReportCreateRequest = z.infer<typeof ReportCreateRequest>;

export const ReportShortResponse = z.object({
  reportId: z.number().int(),
  reportStatus: ReportStatusEnum,
});
export type ReportShortResponse = z.infer<typeof ReportShortResponse>;

// Admin-side schemas — kept for parity with backend_summary §3.9 even though
// the admin UI is out of scope; the typed shape protects future work.
export const ReportInfoResponse = z.object({
  id: z.number().int(),
  reportUserId: z.number().int(),
  targetType: TargetTypeEnum,
  targetId: z.number().int(),
  reasonCode: ReasonCodeEnum,
  comment: z.string().nullish(),
  status: ReportStatusEnum,
  resolvedBy: z.number().int().nullish(),
  resolvedAt: z.string().nullish(),
  resolutionNote: z.string().nullish(),
  createdDate: z.string(),
});
export type ReportInfoResponse = z.infer<typeof ReportInfoResponse>;

export const ReportListItem = z.object({
  id: z.number().int(),
  status: ReportStatusEnum,
  targetType: TargetTypeEnum,
  targetId: z.number().int(),
  reasonCode: ReasonCodeEnum,
  createdDate: z.string(),
});
export type ReportListItem = z.infer<typeof ReportListItem>;

export const ReportResolveRequest = z.object({
  resolutionNote: z.string().min(1),
});
export type ReportResolveRequest = z.infer<typeof ReportResolveRequest>;

export const ReportResolveResponse = z.object({
  id: z.number().int(),
  status: ReportStatusEnum,
  resolvedBy: z.number().int(),
  resolvedAt: z.string(),
  resolutionNote: z.string(),
});
export type ReportResolveResponse = z.infer<typeof ReportResolveResponse>;
