import { z } from "zod";

const nameSchema = z
  .string()
  .trim()
  .min(2, "Use at least 2 characters.")
  .max(60, "Keep it under 60 characters.");

const emailSchema = z
  .string()
  .trim()
  .email("Enter a valid email address.")
  .transform((value) => value.toLowerCase());

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(128, "Password is too long.");

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema
});

export const workerRegistrationSchema = z.object({
  role: z.literal("WORKER"),
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  password: passwordSchema
});

export const facilityRegistrationSchema = z.object({
  role: z.literal("FACILITY"),
  companyName: z
    .string()
    .trim()
    .min(2, "Company name is required.")
    .max(120, "Company name is too long."),
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  password: passwordSchema
});

export const registrationSchema = z.discriminatedUnion("role", [
  workerRegistrationSchema,
  facilityRegistrationSchema
]);

export type LoginInput = z.infer<typeof loginSchema>;
export type WorkerRegistrationInput = z.infer<
  typeof workerRegistrationSchema
>;
export type FacilityRegistrationInput = z.infer<
  typeof facilityRegistrationSchema
>;
export type RegistrationInput = z.infer<typeof registrationSchema>;
