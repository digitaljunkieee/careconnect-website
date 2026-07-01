import { z } from "zod";

export const SURVEY_USER_TYPES = [
  "CARE_WORKER",
  "CARE_FACILITY",
  "INTERESTED_PARTNER"
] as const;

export const SURVEY_LEAD_STATUSES = [
  "WAITLISTED",
  "CONTACTED",
  "APPROVED",
  "REJECTED"
] as const;

export const SHIFT_SOURCE_OPTIONS = [
  "AGENCY",
  "APP_PLATFORM",
  "DIRECT_BANK",
  "WORD_OF_MOUTH",
  "OTHER"
] as const;

export const SHIFTS_PER_WEEK_OPTIONS = ["0_2", "3_5", "6_10", "11_PLUS"] as const;

export const PAYMENT_SPEED_OPTIONS = [
  "SAME_DAY",
  "WITHIN_3_DAYS",
  "WITHIN_A_WEEK",
  "TWO_PLUS_WEEKS",
  "UNPREDICTABLE"
] as const;

export const AGENCY_FRUSTRATION_OPTIONS = [
  "LOW_PAY_HIGH_CUT",
  "SLOW_UNRELIABLE_PAYMENT",
  "NO_INDUCTION_INFORMATION",
  "LAST_MINUTE_CANCELLATIONS",
  "REPEATED_DOCUMENT_UPLOADS",
  "POOR_COMMUNICATION",
  "NOT_ENOUGH_SHIFTS",
  "TREATED_LIKE_A_NUMBER"
] as const;

export const COMPLIANCE_FREQUENCY_OPTIONS = [
  "NEVER",
  "OCCASIONALLY",
  "FREQUENTLY",
  "EVERY_SINGLE_TIME"
] as const;

export const NON_WORKER_INTEREST_OPTIONS = [
  "FIND_VERIFIED_WORKERS",
  "FILL_SHIFTS_FASTER",
  "MANAGE_COMPLIANCE",
  "PARTNERSHIP_OPPORTUNITIES",
  "PRODUCT_UPDATES"
] as const;

const optionalText = (max: number) => z.string().trim().max(max).default("");
const ratingSchema = z.coerce.number().int().min(1).max(5);

export const surveyAnswersSchema = z.object({
  currentShiftSources: z.array(z.enum(SHIFT_SOURCE_OPTIONS)).max(5).default([]),
  otherShiftSource: optionalText(120),
  shiftsPerWeek: z.enum(SHIFTS_PER_WEEK_OPTIONS).optional(),
  currentShiftSatisfaction: ratingSchema.optional(),
  paymentSpeed: z.enum(PAYMENT_SPEED_OPTIONS).optional(),
  agencyFrustrations: z.array(z.enum(AGENCY_FRUSTRATION_OPTIONS)).max(3).default([]),
  complianceReuploadFrequency: z.enum(COMPLIANCE_FREQUENCY_OPTIONS).optional(),
  experienceValuation: ratingSchema.optional(),
  verifiedProfileUsefulness: ratingSchema.optional(),
  platformChoiceFactors: optionalText(1200),
  agencyChange: optionalText(1200),
  organizationName: optionalText(160),
  interestGoals: z.array(z.enum(NON_WORKER_INTEREST_OPTIONS)).max(5).default([]),
  additionalFeedback: optionalText(1200)
});

export const surveyLeadSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name.").max(120),
    email: z
      .string()
      .trim()
      .email("Enter a valid email address.")
      .max(254)
      .transform((value) => value.toLowerCase()),
    phone: optionalText(30),
    userType: z.enum(SURVEY_USER_TYPES),
    location: z.string().trim().min(2, "Enter your town, city, or region.").max(120),
    surveyAnswers: surveyAnswersSchema,
    notificationConsent: z.boolean().default(true)
  })
  .superRefine((data, context) => {
    const answers = data.surveyAnswers;

    if (data.userType === "CARE_WORKER") {
      if (!answers.currentShiftSources.length) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Select at least one way you find shifts.",
          path: ["surveyAnswers", "currentShiftSources"]
        });
      }

      if (answers.currentShiftSources.includes("OTHER") && !answers.otherShiftSource) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Tell us how else you find shifts.",
          path: ["surveyAnswers", "otherShiftSource"]
        });
      }

      const requiredWorkerAnswers: Array<[unknown, string, string]> = [
        [answers.shiftsPerWeek, "shiftsPerWeek", "Select your typical weekly shifts."],
        [answers.currentShiftSatisfaction, "currentShiftSatisfaction", "Choose a satisfaction rating."],
        [answers.paymentSpeed, "paymentSpeed", "Select your usual payment timing."],
        [answers.complianceReuploadFrequency, "complianceReuploadFrequency", "Select how often this happens."],
        [answers.experienceValuation, "experienceValuation", "Choose how valued you feel."],
        [answers.verifiedProfileUsefulness, "verifiedProfileUsefulness", "Choose how useful this would be."]
      ];

      requiredWorkerAnswers.forEach(([value, field, message]) => {
        if (value === undefined) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message,
            path: ["surveyAnswers", field]
          });
        }
      });

      if (!answers.agencyFrustrations.length) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Select at least one frustration.",
          path: ["surveyAnswers", "agencyFrustrations"]
        });
      }
    } else {
      if (data.userType === "CARE_FACILITY" && answers.organizationName.length < 2) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enter your facility or organisation name.",
          path: ["surveyAnswers", "organizationName"]
        });
      }

      if (!answers.interestGoals.length) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Select at least one area of interest.",
          path: ["surveyAnswers", "interestGoals"]
        });
      }
    }
  });

export type SurveyLeadFormInput = z.input<typeof surveyLeadSchema>;
export type SurveyLeadInput = z.output<typeof surveyLeadSchema>;
export type SurveyUserType = (typeof SURVEY_USER_TYPES)[number];
export type SurveyLeadStatus = (typeof SURVEY_LEAD_STATUSES)[number];
