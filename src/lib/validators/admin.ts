import { z } from "zod";
import {
  APPLICATION_STATUSES,
  NOTIFICATION_TYPES,
  PAYMENT_STATUSES,
  VERIFICATION_STATUSES
} from "@/lib/constants";

const paginationSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(50).optional().default(10)
});

export const adminWorkerListQuerySchema = paginationSchema.extend({
  search: z.string().trim().optional().default(""),
  verificationStatus: z
    .enum([...VERIFICATION_STATUSES, "ALL"])
    .optional()
    .catch(undefined),
  activityStatus: z.enum(["ACTIVE", "INACTIVE", "ALL"]).optional().catch(undefined)
});

export type AdminWorkerListQueryInput = z.infer<typeof adminWorkerListQuerySchema>;

export const adminWorkerDetailQuerySchema = z.object({
  tab: z.enum(["overview", "verification", "assignments", "applications"]).optional().catch("overview")
});

export type AdminWorkerDetailQueryInput = z.infer<typeof adminWorkerDetailQuerySchema>;

export const adminVerificationQueueQuerySchema = paginationSchema.extend({
  search: z.string().trim().optional().default(""),
  status: z
    .enum([...VERIFICATION_STATUSES, "ALL"])
    .optional()
    .catch(undefined),
  sort: z.enum(["oldest", "newest"]).optional().catch("oldest")
});

export type AdminVerificationQueueQueryInput = z.infer<
  typeof adminVerificationQueueQuerySchema
>;

export const adminVerificationDecisionSchema = z.object({
  decision: z.enum(["APPROVE", "REJECT"]),
  notes: z.string().trim().max(1000).optional().default("")
});

export type AdminVerificationDecisionInput = z.infer<
  typeof adminVerificationDecisionSchema
>;

export const adminFacilityListQuerySchema = paginationSchema.extend({
  search: z.string().trim().optional().default(""),
  activityStatus: z.enum(["ACTIVE", "INACTIVE", "ALL"]).optional().catch(undefined)
});

export type AdminFacilityListQueryInput = z.infer<typeof adminFacilityListQuerySchema>;

export const adminShiftListQuerySchema = paginationSchema.extend({
  search: z.string().trim().optional().default(""),
  status: z.enum(["OPEN", "FILLED", "CLOSED", "ALL"]).optional().catch(undefined)
});

export type AdminShiftListQueryInput = z.infer<typeof adminShiftListQuerySchema>;

export const adminShiftActionSchema = z.object({
  action: z.enum(["CANCEL", "REASSIGN"]),
  workerId: z.string().trim().optional().default(""),
  notes: z.string().trim().max(1000).optional().default("")
});

export type AdminShiftActionInput = z.infer<typeof adminShiftActionSchema>;

export const adminApplicationListQuerySchema = paginationSchema.extend({
  search: z.string().trim().optional().default(""),
  status: z.enum([...APPLICATION_STATUSES, "ALL"]).optional().catch(undefined)
});

export type AdminApplicationListQueryInput = z.infer<
  typeof adminApplicationListQuerySchema
>;

export const adminPaymentListQuerySchema = paginationSchema.extend({
  search: z.string().trim().optional().default(""),
  status: z.enum([...PAYMENT_STATUSES, "ALL"]).optional().catch(undefined),
  dateFrom: z.string().trim().optional().default(""),
  dateTo: z.string().trim().optional().default("")
});

export type AdminPaymentListQueryInput = z.infer<typeof adminPaymentListQuerySchema>;

export const adminNotificationListQuerySchema = paginationSchema.extend({
  search: z.string().trim().optional().default(""),
  type: z.enum([...NOTIFICATION_TYPES, "ALL"]).optional().catch(undefined),
  readStatus: z.enum(["READ", "UNREAD", "ALL"]).optional().catch(undefined)
});

export type AdminNotificationListQueryInput = z.infer<
  typeof adminNotificationListQuerySchema
>;

export const adminComplianceReportQuerySchema = z.object({
  dateFrom: z.string().trim().optional().default(""),
  dateTo: z.string().trim().optional().default("")
});

export type AdminComplianceReportQueryInput = z.infer<
  typeof adminComplianceReportQuerySchema
>;

export const adminAnalyticsQuerySchema = z.object({
  dateFrom: z.string().trim().optional().default(""),
  dateTo: z.string().trim().optional().default("")
});

export type AdminAnalyticsQueryInput = z.infer<typeof adminAnalyticsQuerySchema>;

export const adminSearchQuerySchema = paginationSchema.extend({
  q: z.string().trim().optional().default(""),
  entityType: z.enum(["ALL", "WORKER", "FACILITY", "SHIFT", "APPLICATION"]).optional().catch("ALL")
});

export type AdminSearchQueryInput = z.infer<typeof adminSearchQuerySchema>;

export const adminSettingsProfileSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required.").max(80),
  lastName: z.string().trim().min(1, "Last name is required.").max(80),
  phone: z.string().trim().max(30).optional().default(""),
  notificationPreferences: z.object({
    email: z.boolean().default(true),
    inApp: z.boolean().default(true),
    sms: z.boolean().default(false),
    weeklyDigest: z.boolean().default(true)
  })
});

export type AdminSettingsProfileInput = z.infer<typeof adminSettingsProfileSchema>;

export const adminSettingsPasswordSchema = z
  .object({
    currentPassword: z.string().trim().min(8, "Current password is required."),
    newPassword: z.string().trim().min(8, "New password must be at least 8 characters."),
    confirmPassword: z.string().trim().min(8, "Please confirm the new password.")
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"]
  });

export type AdminSettingsPasswordInput = z.infer<typeof adminSettingsPasswordSchema>;

export const adminWorkerStatusSchema = z.object({
  isActive: z.boolean()
});

export type AdminWorkerStatusInput = z.infer<typeof adminWorkerStatusSchema>;

export const adminFacilityStatusSchema = z.object({
  isActive: z.boolean()
});

export type AdminFacilityStatusInput = z.infer<typeof adminFacilityStatusSchema>;

export const adminNotificationIdsSchema = z.object({
  ids: z.array(z.string().trim().min(1)).min(1)
});

export type AdminNotificationIdsInput = z.infer<typeof adminNotificationIdsSchema>;

export const adminShiftReassignSchema = z.object({
  workerId: z.string().trim().min(1, "Worker ID is required."),
  notes: z.string().trim().max(1000).optional().default("")
});

export type AdminShiftReassignInput = z.infer<typeof adminShiftReassignSchema>;
