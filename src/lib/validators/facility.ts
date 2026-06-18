import { z } from "zod";

export const facilityProfileSchema = z.object({
  companyName: z.string().trim().min(2, "Company name is required.").max(120),
  address: z.string().trim().max(300).optional().default(""),
  contactNumber: z.string().trim().max(30).optional().default("")
});

export type FacilityProfileInput = z.infer<typeof facilityProfileSchema>;

export const shiftFormSchema = z.object({
  date: z.string().trim().min(1, "Shift date is required."),
  startTime: z
    .string()
    .trim()
    .regex(/^\d{2}:\d{2}$/, "Use HH:MM format."),
  endTime: z.string().trim().regex(/^\d{2}:\d{2}$/, "Use HH:MM format."),
  hourlyRate: z.coerce.number().positive("Hourly rate must be greater than zero."),
  roleRequired: z.string().trim().min(2, "Role required is needed.").max(120),
  notes: z.string().trim().max(2000).optional().default("")
});

export type ShiftFormInput = z.infer<typeof shiftFormSchema>;

export const shiftUpdateSchema = shiftFormSchema.extend({
  status: z.enum(["OPEN", "CLOSED", "FILLED"]).optional()
});

export type ShiftUpdateInput = z.infer<typeof shiftUpdateSchema>;

export const shiftStatusSchema = z.object({
  status: z.enum(["OPEN", "CLOSED", "FILLED"])
});

export type ShiftStatusInput = z.infer<typeof shiftStatusSchema>;

export const shiftListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(20).optional().default(10),
  status: z.enum(["OPEN", "FILLED", "CLOSED"]).optional().catch(undefined),
  search: z.string().trim().optional().default("")
});

export type ShiftListQueryInput = z.infer<typeof shiftListQuerySchema>;

export const applicantQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(20).optional().default(10),
  applicationStatus: z
    .enum(["PENDING", "ACCEPTED", "REJECTED"])
    .optional()
    .catch(undefined),
  verificationStatus: z
    .enum(["PENDING", "IN_REVIEW", "VERIFIED", "REJECTED"])
    .optional()
    .catch(undefined)
});

export type ApplicantQueryInput = z.infer<typeof applicantQuerySchema>;

export const applicationDecisionSchema = z.object({
  action: z.enum(["ACCEPT", "REJECT"])
});

export type ApplicationDecisionInput = z.infer<
  typeof applicationDecisionSchema
>;
