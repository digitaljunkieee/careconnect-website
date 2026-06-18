export const ROLES = ["ADMIN", "WORKER", "FACILITY"] as const;

export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrator",
  WORKER: "Care Worker",
  FACILITY: "Care Facility"
};

export const ROLE_HOME: Record<Role, string> = {
  ADMIN: "/dashboard/admin",
  WORKER: "/dashboard/worker",
  FACILITY: "/dashboard/facility"
};

export const VERIFICATION_STATUSES = [
  "PENDING",
  "IN_REVIEW",
  "VERIFIED",
  "REJECTED"
] as const;

export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

export const WORKER_ROLE_TYPES = [
  "CARE_SUPPORT",
  "PERSONAL_CARE",
  "CLEANING"
] as const;

export type WorkerRoleType = (typeof WORKER_ROLE_TYPES)[number];

export const WORKER_ROLE_TYPE_LABELS: Record<WorkerRoleType, string> = {
  CARE_SUPPORT: "Care Support",
  PERSONAL_CARE: "Personal Care",
  CLEANING: "Cleaning"
};

export const VERIFICATION_STATUS_LABELS: Record<VerificationStatus, string> = {
  PENDING: "Pending",
  IN_REVIEW: "In Review",
  VERIFIED: "Verified",
  REJECTED: "Rejected"
};

export const APPLICATION_STATUSES = [
  "PENDING",
  "ACCEPTED",
  "REJECTED",
  "CANCELLED"
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const SHIFT_STATUSES = ["DRAFT", "OPEN", "FILLED", "CLOSED"] as const;

export type ShiftStatus = (typeof SHIFT_STATUSES)[number];

export const SHIFT_STATUS_LABELS: Record<ShiftStatus, string> = {
  DRAFT: "Draft",
  OPEN: "Live",
  FILLED: "Filled",
  CLOSED: "Closed"
};

export const ASSIGNMENT_STATUSES = [
  "UPCOMING",
  "COMPLETED",
  "CANCELLED"
] as const;

export type AssignmentStatus = (typeof ASSIGNMENT_STATUSES)[number];

export const ASSIGNMENT_STATUS_LABELS: Record<AssignmentStatus, string> = {
  UPCOMING: "Upcoming",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled"
};

export const PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED", "REFUNDED"] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: "Pending",
  PAID: "Paid",
  FAILED: "Failed",
  REFUNDED: "Refunded"
};

export const NOTIFICATION_TYPES = [
  "INFO",
  "SUCCESS",
  "WARNING",
  "ALERT"
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const AUDIT_ACTIONS = [
  "VERIFICATION_SUBMITTED",
  "VERIFICATION_APPROVED",
  "VERIFICATION_REJECTED",
  "WORKER_ENABLED",
  "WORKER_DISABLED",
  "FACILITY_ENABLED",
  "FACILITY_DISABLED",
  "SHIFT_CANCELLED",
  "SHIFT_REASSIGNED",
  "PAYMENT_RECEIVED",
  "PAYMENT_FAILED",
  "PAYMENT_REFUNDED",
  "EMAIL_QUEUED",
  "EMAIL_SENT",
  "EMAIL_FAILED",
  "WEBHOOK_RECEIVED",
  "WEBHOOK_PROCESSED",
  "NOTIFICATION_MARKED_READ",
  "NOTIFICATION_MARKED_ALL_READ",
  "NOTIFICATION_DELETED",
  "SETTINGS_UPDATED"
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export const AUDIT_ENTITY_TYPES = [
  "WORKER",
  "FACILITY",
  "SHIFT",
  "APPLICATION",
  "PAYMENT",
  "EMAIL",
  "NOTIFICATION",
  "VERIFICATION",
  "SETTING",
  "WEBHOOK"
] as const;

export type AuditEntityType = (typeof AUDIT_ENTITY_TYPES)[number];
