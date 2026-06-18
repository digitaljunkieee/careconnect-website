import { z } from "zod";
import { WORKER_ROLE_TYPES } from "@/lib/constants";

export const workerProfileSchema = z.object({
  phone: z.string().trim().max(30).optional().default(""),
  addressHistory: z.string().trim().max(5000).optional().default(""),
  niNumber: z.string().trim().max(40).optional().default(""),
  shareCode: z.string().trim().max(40).optional().default(""),
  roleType: z.enum(WORKER_ROLE_TYPES)
});

export type WorkerProfileInput = z.infer<typeof workerProfileSchema>;

export const workerDocumentUploadSchema = z.object({
  documentName: z.string().trim().min(1).max(120).optional().default("Document")
});

export const applyToShiftSchema = z.object({
  shiftId: z.string().trim().min(1, "Shift ID is required.")
});

export type ApplyToShiftInput = z.infer<typeof applyToShiftSchema>;

export const workerApplicationQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(25).optional().default(10),
  status: z
    .enum(["PENDING", "ACCEPTED", "REJECTED"])
    .optional()
    .catch(undefined)
});

export type WorkerApplicationQueryInput = z.infer<
  typeof workerApplicationQuerySchema
>;

export const workerShiftBoardQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(20).optional().default(10),
  search: z.string().trim().optional().default(""),
  role: z.string().trim().optional().default(""),
  dateFrom: z.string().trim().optional().default(""),
  dateTo: z.string().trim().optional().default(""),
  minRate: z.coerce.number().optional().catch(undefined),
  maxRate: z.coerce.number().optional().catch(undefined)
});

export type WorkerShiftBoardQueryInput = z.infer<typeof workerShiftBoardQuerySchema>;

export const workerVerificationQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(20).optional().default(10)
});

export type WorkerVerificationQueryInput = z.infer<
  typeof workerVerificationQuerySchema
>;
