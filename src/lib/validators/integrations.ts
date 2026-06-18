import { z } from "zod";

export const ebcApplicantRequestSchema = z.object({
  workerProfileId: z.string().trim().min(1, "Worker profile ID is required.")
});

export type EbcApplicantRequestInput = z.infer<typeof ebcApplicantRequestSchema>;

export const ebcWebhookPayloadSchema = z.object({
  eventId: z.string().trim().optional().default(""),
  eventType: z
    .enum([
      "VERIFICATION_COMPLETED",
      "VERIFICATION_FAILED",
      "ADDITIONAL_INFORMATION_REQUESTED",
      "Verification Completed",
      "Verification Failed",
      "Additional Information Requested"
    ])
    .catch("VERIFICATION_COMPLETED"),
  applicantId: z.string().trim().min(1, "Applicant ID is required."),
  workerProfileId: z.string().trim().optional().default(""),
  status: z
    .enum(["VERIFIED", "REJECTED", "IN_REVIEW", "PENDING"])
    .optional()
    .catch(undefined),
  notes: z.string().trim().optional().default(""),
  payload: z.record(z.unknown()).optional().default({})
});

export type EbcWebhookPayloadInput = z.infer<typeof ebcWebhookPayloadSchema>;

export const stripeCheckoutRequestSchema = z.object({
  shiftId: z.string().trim().min(1, "Shift ID is required."),
  facilityId: z.string().trim().min(1, "Facility ID is required."),
  successUrl: z.string().url().optional().default(""),
  cancelUrl: z.string().url().optional().default("")
});

export type StripeCheckoutRequestInput = z.infer<
  typeof stripeCheckoutRequestSchema
>;

export const stripeWebhookPayloadSchema = z.object({
  eventId: z.string().trim().optional().default(""),
  type: z.string().trim().min(1),
  data: z.record(z.unknown()).optional().default({})
});

export type StripeWebhookPayloadInput = z.infer<typeof stripeWebhookPayloadSchema>;

export const emailQueueRequestSchema = z.object({
  to: z.array(z.string().email()).min(1, "At least one recipient is required."),
  template: z.string().trim().min(1, "Template is required."),
  payload: z.record(z.unknown()).optional().default({}),
  dedupeKey: z.string().trim().optional().default(""),
  subject: z.string().trim().optional().default("")
});

export type EmailQueueRequestInput = z.infer<typeof emailQueueRequestSchema>;

export const cloudinarySignatureRequestSchema = z.object({
  folder: z.string().trim().min(1, "Folder is required."),
  publicId: z.string().trim().optional().default(""),
  resourceType: z.enum(["image", "video", "raw", "auto"]).optional().default("auto")
});

export type CloudinarySignatureRequestInput = z.infer<
  typeof cloudinarySignatureRequestSchema
>;
