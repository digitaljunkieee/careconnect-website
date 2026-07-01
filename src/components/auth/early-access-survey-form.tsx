"use client";

import * as React from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type FieldPath, type UseFormRegister } from "react-hook-form";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Handshake,
  Loader2,
  UserRound
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  surveyLeadSchema,
  type SurveyLeadFormInput,
  type SurveyLeadInput,
  type SurveyUserType
} from "@/lib/validators/survey";

type EarlyAccessSurveyFormProps = {
  initialUserType?: SurveyUserType;
};

type Option = { value: string; label: string };

const userTypeOptions = [
  {
    value: "CARE_WORKER" as const,
    label: "Care Worker",
    description: "I find and work care shifts.",
    icon: UserRound
  },
  {
    value: "CARE_FACILITY" as const,
    label: "Care Facility",
    description: "I recruit or manage care staff.",
    icon: Building2
  },
  {
    value: "INTERESTED_PARTNER" as const,
    label: "Other / Interested Partner",
    description: "I am exploring CareConnect or partnership opportunities.",
    icon: Handshake
  }
];

const shiftSourceOptions: Option[] = [
  { value: "AGENCY", label: "Agency / agencies" },
  { value: "APP_PLATFORM", label: "App or platform (e.g. Florence, Patchwork, Lantum)" },
  { value: "DIRECT_BANK", label: "Directly with care homes / bank work" },
  { value: "WORD_OF_MOUTH", label: "Word of mouth" },
  { value: "OTHER", label: "Other" }
];

const shiftsPerWeekOptions: Option[] = [
  { value: "0_2", label: "0–2" },
  { value: "3_5", label: "3–5" },
  { value: "6_10", label: "6–10" },
  { value: "11_PLUS", label: "11+" }
];

const paymentSpeedOptions: Option[] = [
  { value: "SAME_DAY", label: "Same day" },
  { value: "WITHIN_3_DAYS", label: "Within 3 days" },
  { value: "WITHIN_A_WEEK", label: "Within a week" },
  { value: "TWO_PLUS_WEEKS", label: "2+ weeks" },
  { value: "UNPREDICTABLE", label: "Unpredictable" }
];

const frustrationOptions: Option[] = [
  { value: "LOW_PAY_HIGH_CUT", label: "Low pay / high cut taken by agency" },
  { value: "SLOW_UNRELIABLE_PAYMENT", label: "Slow or unreliable payment" },
  { value: "NO_INDUCTION_INFORMATION", label: "Being sent to places with no induction or info" },
  { value: "LAST_MINUTE_CANCELLATIONS", label: "Last-minute cancellations" },
  { value: "REPEATED_DOCUMENT_UPLOADS", label: "Having to re-submit the same documents repeatedly" },
  { value: "POOR_COMMUNICATION", label: "Poor communication / hard to reach anyone" },
  { value: "NOT_ENOUGH_SHIFTS", label: "Not enough shifts offered" },
  { value: "TREATED_LIKE_A_NUMBER", label: "Feeling treated like a number" }
];

const complianceOptions: Option[] = [
  { value: "NEVER", label: "Never" },
  { value: "OCCASIONALLY", label: "Occasionally" },
  { value: "FREQUENTLY", label: "Frequently" },
  { value: "EVERY_SINGLE_TIME", label: "Every single time" }
];

const interestOptions: Option[] = [
  { value: "FIND_VERIFIED_WORKERS", label: "Finding verified care workers" },
  { value: "FILL_SHIFTS_FASTER", label: "Filling shifts faster" },
  { value: "MANAGE_COMPLIANCE", label: "Simplifying compliance" },
  { value: "PARTNERSHIP_OPPORTUNITIES", label: "Partnership opportunities" },
  { value: "PRODUCT_UPDATES", label: "Product and launch updates" }
];

const inputClassName =
  "h-12 rounded-2xl border-slate-200 bg-white text-slate-950 shadow-none focus-visible:ring-primary/20";

function ErrorMessage({ message }: { message?: string }) {
  return message ? <p className="mt-2 text-sm text-red-600">{message}</p> : null;
}

function Question({
  children,
  description,
  title
}: {
  children: React.ReactNode;
  description?: string;
  title: string;
}) {
  return (
    <fieldset className="space-y-3 rounded-[1.4rem] border border-slate-200/80 bg-slate-50/60 p-4 sm:p-5">
      <legend className="px-1 text-sm font-semibold leading-6 text-slate-950 sm:text-base">
        {title}
      </legend>
      {description ? <p className="text-sm leading-6 text-slate-500">{description}</p> : null}
      {children}
    </fieldset>
  );
}

function ScaleQuestion({
  description,
  error,
  field,
  highLabel,
  lowLabel,
  register,
  title
}: {
  description?: string;
  error?: string;
  field:
    | "surveyAnswers.currentShiftSatisfaction"
    | "surveyAnswers.experienceValuation"
    | "surveyAnswers.verifiedProfileUsefulness";
  highLabel: string;
  lowLabel: string;
  register: UseFormRegister<SurveyLeadFormInput>;
  title: string;
}) {
  return (
    <Question title={title} description={description}>
      <div className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((value) => (
          <label key={value} className="cursor-pointer">
            <input
              className="peer sr-only"
              type="radio"
              value={value}
              {...register(field, { valueAsNumber: true })}
            />
            <span className="flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 transition peer-checked:border-primary peer-checked:bg-primary peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-primary/30">
              {value}
            </span>
          </label>
        ))}
      </div>
      <div className="flex justify-between gap-4 text-xs text-slate-500">
        <span>{lowLabel}</span>
        <span className="text-right">{highLabel}</span>
      </div>
      <ErrorMessage message={error} />
    </Question>
  );
}

export function EarlyAccessSurveyForm({ initialUserType }: EarlyAccessSurveyFormProps) {
  const [step, setStep] = React.useState(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const form = useForm<SurveyLeadFormInput, unknown, SurveyLeadInput>({
    resolver: zodResolver(surveyLeadSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      userType: initialUserType ?? "CARE_WORKER",
      location: "",
      surveyAnswers: {
        currentShiftSources: [],
        otherShiftSource: "",
        agencyFrustrations: [],
        platformChoiceFactors: "",
        agencyChange: "",
        organizationName: "",
        interestGoals: [],
        additionalFeedback: ""
      },
      notificationConsent: true
    },
    mode: "onTouched"
  });
  const userType = form.watch("userType");
  const selectedShiftSources = form.watch("surveyAnswers.currentShiftSources") ?? [];
  const selectedFrustrations = form.watch("surveyAnswers.agencyFrustrations") ?? [];
  const isWorker = userType === "CARE_WORKER";
  const totalSteps = isWorker ? 4 : 3;
  const progress = (step / totalSteps) * 100;
  const answerErrors = form.formState.errors.surveyAnswers;

  function getStepFields(): FieldPath<SurveyLeadFormInput>[] {
    if (step === 1) {
      return ["fullName", "email", "phone", "userType", "location"];
    }

    if (!isWorker) {
      return step === 2
        ? ["surveyAnswers.organizationName", "surveyAnswers.interestGoals"]
        : ["surveyAnswers.additionalFeedback", "notificationConsent"];
    }

    if (step === 2) {
      return [
        "surveyAnswers.currentShiftSources",
        "surveyAnswers.otherShiftSource",
        "surveyAnswers.shiftsPerWeek",
        "surveyAnswers.currentShiftSatisfaction"
      ];
    }

    if (step === 3) {
      return [
        "surveyAnswers.paymentSpeed",
        "surveyAnswers.agencyFrustrations",
        "surveyAnswers.complianceReuploadFrequency",
        "surveyAnswers.experienceValuation",
        "surveyAnswers.verifiedProfileUsefulness"
      ];
    }

    return [
      "surveyAnswers.platformChoiceFactors",
      "surveyAnswers.agencyChange",
      "notificationConsent"
    ];
  }

  async function goForward() {
    const valid = await form.trigger(getStepFields(), { shouldFocus: true });

    if (valid) {
      setStep((current) => Math.min(current + 1, totalSteps));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function onSubmit(values: SurveyLeadInput) {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/survey-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });
      const payload = (await response.json().catch(() => null)) as
        | { success?: boolean; error?: { message?: string } }
        | null;

      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error?.message ?? "Unable to submit your response right now.");
      }

      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to submit your response.";
      form.setError("root", { message });
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSubmitted) {
    return (
      <div className="mx-auto max-w-2xl py-8 text-center sm:py-14">
        <span className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="h-8 w-8" />
        </span>
        <Badge variant="soft" className="mx-auto mt-6 w-fit tracking-[0.16em]">
          YOU&apos;RE ON THE WAITLIST
        </Badge>
        <h1 className="mt-5 font-display text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
          Thank you for joining the CareConnect waitlist.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600">
          We&apos;ve received your details and will notify you as soon as the platform goes live.
        </p>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
          In the meantime, our team is reviewing early access responses to improve the launch experience.
        </p>
        <Button asChild className="mt-8 h-12 rounded-full px-6">
          <Link href="/">Return to CareConnect</Link>
        </Button>
      </div>
    );
  }

  return (
    <form className="space-y-7" onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Badge variant="soft" className="tracking-[0.14em]">
            EARLY ACCESS SURVEY
          </Badge>
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Step {step} of {totalSteps}
          </span>
        </div>
        <Progress value={progress} className="h-2 bg-slate-100" />
      </div>

      {step === 1 ? (
        <section className="space-y-6">
          <div>
            <h1 className="font-display text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
              Join the CareConnect waitlist
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Tell us a little about you. Your response will help shape a more useful launch experience.
            </p>
          </div>

          <Question title="Which best describes you?">
            <div className="grid gap-3 md:grid-cols-3">
              {userTypeOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <label key={option.value} className="cursor-pointer">
                    <input
                      className="peer sr-only"
                      type="radio"
                      value={option.value}
                      {...form.register("userType")}
                    />
                    <span className="flex h-full min-h-32 flex-col rounded-2xl border border-slate-200 bg-white p-4 transition peer-checked:border-primary peer-checked:bg-primary/5 peer-focus-visible:ring-2 peer-focus-visible:ring-primary/30">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </span>
                      <strong className="mt-4 text-sm text-slate-950">{option.label}</strong>
                      <span className="mt-1 text-xs leading-5 text-slate-500">{option.description}</span>
                    </span>
                  </label>
                );
              })}
            </div>
            <ErrorMessage message={form.formState.errors.userType?.message} />
          </Question>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700 sm:col-span-2">
              Full name <span className="text-red-500">*</span>
              <Input {...form.register("fullName")} className={inputClassName} autoComplete="name" />
              <ErrorMessage message={form.formState.errors.fullName?.message} />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Email <span className="text-red-500">*</span>
              <Input {...form.register("email")} className={inputClassName} type="email" autoComplete="email" />
              <ErrorMessage message={form.formState.errors.email?.message} />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Phone <span className="font-normal text-slate-400">(optional)</span>
              <Input {...form.register("phone")} className={inputClassName} type="tel" autoComplete="tel" />
              <ErrorMessage message={form.formState.errors.phone?.message} />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700 sm:col-span-2">
              Town, city, or region <span className="text-red-500">*</span>
              <Input {...form.register("location")} className={inputClassName} autoComplete="address-level2" />
              <ErrorMessage message={form.formState.errors.location?.message} />
            </label>
          </div>
        </section>
      ) : null}

      {isWorker && step === 2 ? (
        <section className="space-y-5">
          <div>
            <h2 className="font-display text-2xl font-semibold text-slate-950 sm:text-3xl">Current working patterns</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">A few quick questions about how you currently find and work care shifts.</p>
          </div>

          <Question title="How do you currently find care shifts?" description="Select all that apply.">
            <div className="grid gap-2 sm:grid-cols-2">
              {shiftSourceOptions.map((option) => (
                <label key={option.value} className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                  <input className="mt-0.5 h-4 w-4 accent-primary" type="checkbox" value={option.value} {...form.register("surveyAnswers.currentShiftSources")} />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
            <ErrorMessage message={answerErrors?.currentShiftSources?.message} />
            {selectedShiftSources.includes("OTHER") ? (
              <label className="block space-y-2 text-sm font-medium text-slate-700">
                Please specify
                <Input {...form.register("surveyAnswers.otherShiftSource")} className={inputClassName} />
                <ErrorMessage message={answerErrors?.otherShiftSource?.message} />
              </label>
            ) : null}
          </Question>

          <Question title="How many shifts do you typically work per week?">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {shiftsPerWeekOptions.map((option) => (
                <label key={option.value} className="cursor-pointer">
                  <input className="peer sr-only" type="radio" value={option.value} {...form.register("surveyAnswers.shiftsPerWeek")} />
                  <span className="flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-medium peer-checked:border-primary peer-checked:bg-primary peer-checked:text-white">{option.label}</span>
                </label>
              ))}
            </div>
            <ErrorMessage message={answerErrors?.shiftsPerWeek?.message} />
          </Question>

          <ScaleQuestion
            field="surveyAnswers.currentShiftSatisfaction"
            register={form.register}
            title="How satisfied are you overall with how you currently get shifts?"
            lowLabel="Very dissatisfied"
            highLabel="Very satisfied"
            error={answerErrors?.currentShiftSatisfaction?.message}
          />
        </section>
      ) : null}

      {isWorker && step === 3 ? (
        <section className="space-y-5">
          <div>
            <h2 className="font-display text-2xl font-semibold text-slate-950 sm:text-3xl">Pay, experience, and compliance</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Help us understand where today&apos;s agency and platform experience creates friction.</p>
          </div>

          <Question title="How quickly do you usually get paid after a shift?">
            <div className="grid gap-2 sm:grid-cols-3">
              {paymentSpeedOptions.map((option) => (
                <label key={option.value} className="cursor-pointer">
                  <input className="peer sr-only" type="radio" value={option.value} {...form.register("surveyAnswers.paymentSpeed")} />
                  <span className="flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-center text-sm peer-checked:border-primary peer-checked:bg-primary peer-checked:text-white">{option.label}</span>
                </label>
              ))}
            </div>
            <ErrorMessage message={answerErrors?.paymentSpeed?.message} />
          </Question>

          <Question title="What frustrates you most about working through agencies or platforms?" description="Select up to 3.">
            <div className="grid gap-2 sm:grid-cols-2">
              {frustrationOptions.map((option) => {
                const selected = selectedFrustrations.includes(option.value as never);
                const disabled = selectedFrustrations.length >= 3 && !selected;
                return (
                  <label key={option.value} className={cn("flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 has-[:checked]:border-primary has-[:checked]:bg-primary/5", disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer")}>
                    <input className="mt-0.5 h-4 w-4 accent-primary" disabled={disabled} type="checkbox" value={option.value} {...form.register("surveyAnswers.agencyFrustrations")} />
                    <span>{option.label}</span>
                  </label>
                );
              })}
            </div>
            <ErrorMessage message={answerErrors?.agencyFrustrations?.message} />
          </Question>

          <Question title="How often are you asked to re-upload or re-prove the same compliance documents (DBS, training, right-to-work) for different agencies?">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {complianceOptions.map((option) => (
                <label key={option.value} className="cursor-pointer">
                  <input className="peer sr-only" type="radio" value={option.value} {...form.register("surveyAnswers.complianceReuploadFrequency")} />
                  <span className="flex min-h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-2 text-center text-xs font-medium peer-checked:border-primary peer-checked:bg-primary peer-checked:text-white sm:text-sm">{option.label}</span>
                </label>
              ))}
            </div>
            <ErrorMessage message={answerErrors?.complianceReuploadFrequency?.message} />
          </Question>

          <ScaleQuestion
            field="surveyAnswers.experienceValuation"
            register={form.register}
            title="How much do you feel agencies value your training and experience when matching you to shifts?"
            lowLabel="Not at all"
            highLabel="A great deal"
            error={answerErrors?.experienceValuation?.message}
          />

          <ScaleQuestion
            field="surveyAnswers.verifiedProfileUsefulness"
            register={form.register}
            title={'Would a single "verified worker" profile that proves your compliance once, reusable across bookings, be useful to you?'}
            lowLabel="Not useful"
            highLabel="Extremely useful"
            error={answerErrors?.verifiedProfileUsefulness?.message}
          />
        </section>
      ) : null}

      {!isWorker && step === 2 ? (
        <section className="space-y-5">
          <div>
            <h2 className="font-display text-2xl font-semibold text-slate-950 sm:text-3xl">Your interest in CareConnect</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">We&apos;ll use this to make early access more relevant to you.</p>
          </div>
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            Facility or organisation name {userType === "CARE_FACILITY" ? <span className="text-red-500">*</span> : <span className="font-normal text-slate-400">(optional)</span>}
            <Input {...form.register("surveyAnswers.organizationName")} className={inputClassName} />
            <ErrorMessage message={answerErrors?.organizationName?.message} />
          </label>
          <Question title="What are you most interested in?" description="Select all that apply.">
            <div className="grid gap-2 sm:grid-cols-2">
              {interestOptions.map((option) => (
                <label key={option.value} className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                  <input className="mt-0.5 h-4 w-4 accent-primary" type="checkbox" value={option.value} {...form.register("surveyAnswers.interestGoals")} />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
            <ErrorMessage message={answerErrors?.interestGoals?.message} />
          </Question>
        </section>
      ) : null}

      {(isWorker && step === 4) || (!isWorker && step === 3) ? (
        <section className="space-y-5">
          <div>
            <h2 className="font-display text-2xl font-semibold text-slate-950 sm:text-3xl">Final thoughts</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Your feedback helps us build a launch experience around real care needs.</p>
          </div>

          {isWorker ? (
            <>
              <label className="block space-y-2 text-sm font-semibold leading-6 text-slate-950">
                What would make you choose one platform over another?
                <Textarea {...form.register("surveyAnswers.platformChoiceFactors")} className="min-h-28 bg-white font-normal text-slate-700" placeholder="Share your thoughts…" />
                <ErrorMessage message={answerErrors?.platformChoiceFactors?.message} />
              </label>
              <label className="block space-y-2 text-sm font-semibold leading-6 text-slate-950">
                If you could change one thing about working through agencies, what would it be?
                <Textarea {...form.register("surveyAnswers.agencyChange")} className="min-h-28 bg-white font-normal text-slate-700" placeholder="Share your thoughts…" />
                <ErrorMessage message={answerErrors?.agencyChange?.message} />
              </label>
            </>
          ) : (
            <label className="block space-y-2 text-sm font-semibold leading-6 text-slate-950">
              Is there anything else you&apos;d like us to know?
              <Textarea {...form.register("surveyAnswers.additionalFeedback")} className="min-h-32 bg-white font-normal text-slate-700" placeholder="Share your goals, questions, or launch priorities…" />
              <ErrorMessage message={answerErrors?.additionalFeedback?.message} />
            </label>
          )}

          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-sm leading-6 text-slate-700">
            <input className="mt-1 h-4 w-4 accent-primary" type="checkbox" {...form.register("notificationConsent")} />
            <span>
              <strong className="block text-slate-950">Notify me when CareConnect goes live.</strong>
              We&apos;ll only use this consent for relevant launch and early-access updates.
            </span>
          </label>
        </section>
      ) : null}

      <ErrorMessage message={form.formState.errors.root?.message} />

      <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-between">
        {step > 1 ? (
          <Button className="h-12 rounded-full px-6" type="button" variant="outline" onClick={() => setStep((current) => Math.max(current - 1, 1))}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        ) : (
          <Button asChild className="h-12 rounded-full px-6" variant="ghost">
            <Link href="/">Cancel</Link>
          </Button>
        )}

        {step < totalSteps ? (
          <Button className="h-12 rounded-full px-7" type="button" onClick={goForward}>
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button className="h-12 rounded-full px-7" disabled={isSubmitting} type="submit">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {isSubmitting ? "Joining waitlist…" : "Join the waitlist"}
          </Button>
        )}
      </div>
    </form>
  );
}
