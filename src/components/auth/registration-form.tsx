"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Building2, Check, Loader2, UserRound } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { getBackendBaseUrl } from "@/lib/backend-url";
import {
  facilityRegistrationSchema,
  workerRegistrationSchema,
  type FacilityRegistrationInput,
  type WorkerRegistrationInput
} from "@/lib/validators/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";

type RegistrationRole = "WORKER" | "FACILITY";
type RegistrationStep = 1 | 2;
type RegistrationValues = WorkerRegistrationInput | FacilityRegistrationInput;

type RegistrationFormProps = {
  initialRole?: RegistrationRole;
};

const registrationFlow = [
  "Choose Role",
  "Account Details",
  "Professional Information",
  "Verification Documents",
  "Review & Submit"
] as const;

function getDefaultValues(role: RegistrationRole): RegistrationValues {
  if (role === "FACILITY") {
    return {
      role: "FACILITY",
      companyName: "",
      firstName: "",
      lastName: "",
      email: "",
      password: ""
    };
  }

  return {
    role: "WORKER",
    firstName: "",
    lastName: "",
    email: "",
    password: ""
  };
}

function getRoleMeta(role: RegistrationRole) {
  return role === "FACILITY"
    ? {
        label: "Care Facility",
        description: "Post shifts and connect with verified professionals.",
        icon: Building2
      }
    : {
        label: "Care Worker",
        description: "Find shifts and manage applications.",
        icon: UserRound
      };
}

function RegistrationProgress({
  currentStep
}: {
  currentStep: RegistrationStep;
}) {
  const progressWidth = `${(currentStep / registrationFlow.length) * 100}%`;

  return (
    <div className="space-y-3">
      <div className="hidden grid-cols-5 gap-1 text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-slate-400 2xl:grid">
        {registrationFlow.map((label, index) => (
          <span
            key={label}
            className={`whitespace-nowrap text-center leading-none ${
              index + 1 <= currentStep ? "text-primary" : "text-slate-400"
            }`}
            title={label}
          >
            {label}
          </span>
        ))}
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: progressWidth }}
        />
      </div>
    </div>
  );
}

function RegistrationDetailsForm({
  role,
  onBack
}: {
  role: RegistrationRole;
  onBack: () => void;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const meta = getRoleMeta(role);
  const schema =
    role === "FACILITY" ? facilityRegistrationSchema : workerRegistrationSchema;
  const form = useForm<RegistrationValues>({
    resolver: zodResolver(schema as never),
    defaultValues: getDefaultValues(role)
  });

  async function onSubmit(values: RegistrationValues) {
    setIsSubmitting(true);

    try {
      const response = await fetch(`${getBackendBaseUrl()}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(values)
      });

      const payload = (await response.json().catch(() => null)) as
        | { message?: string; error?: { message?: string } }
        | null;

      if (!response.ok) {
        throw new Error(
          payload?.error?.message ??
            payload?.message ??
            "Registration failed. Please try again."
        );
      }

      toast.success("Registration complete. You can sign in now.");
      router.push("/login?registered=1");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-7 text-slate-900">
      <div className="space-y-4">
        <RegistrationProgress currentStep={2} />
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="soft" className="rounded-full px-3 py-1 text-[0.72rem] font-semibold tracking-wide">
            Step 2 of 5
          </Badge>
          <Badge variant="secondary" className="rounded-full px-3 py-1 text-[0.72rem] font-semibold tracking-wide">
            {meta.label}
          </Badge>
        </div>
        <div className="space-y-2">
          <h2 className="font-display text-[clamp(2.1rem,4vw,3rem)] font-semibold leading-tight text-slate-950">
            Account details
          </h2>
          <p className="max-w-md text-sm leading-7 text-slate-600 sm:text-base">
            Create your secure CareConnect account.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => <input type="hidden" {...field} value={role} />}
          />

          {role === "FACILITY" ? (
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-slate-700">
                    Company name
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="h-14 rounded-2xl sm:h-12"
                      placeholder="Bright Care Ltd"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-slate-700">
                    First name
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="h-14 rounded-2xl sm:h-12"
                      placeholder="Amina"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-slate-700">
                    Last name
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="h-14 rounded-2xl sm:h-12"
                      placeholder="Johnson"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-slate-700">
                  Email
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="h-14 rounded-2xl sm:h-12"
                    placeholder="you@example.com"
                    type="email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-slate-700">
                  Password
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="h-14 rounded-2xl sm:h-12"
                    placeholder="Create a password"
                    type="password"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              className="h-14 flex-1 rounded-2xl sm:h-12"
              disabled={isSubmitting}
              type="button"
              variant="outline"
              onClick={onBack}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              className="h-14 flex-1 rounded-2xl sm:h-12"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

function RoleOption({
  role,
  selected,
  onSelect
}: {
  role: RegistrationRole;
  selected: boolean;
  onSelect: (role: RegistrationRole) => void;
}) {
  const meta = getRoleMeta(role);
  const Icon = meta.icon;

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect(role)}
      className={[
        "flex min-h-[11.5rem] w-full flex-col justify-between rounded-[1.5rem] border p-5 text-left transition-all duration-200",
        selected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-slate-200 bg-white hover:border-sky-200 hover:bg-slate-50"
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <span
          className={[
            "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border",
            selected
              ? "border-primary bg-primary text-primary-foreground"
              : "border-slate-200 text-transparent"
          ].join(" ")}
        >
          <Check className="h-3.5 w-3.5" />
        </span>
      </div>

      <div className="space-y-2 pt-4">
        <h3 className="text-lg font-semibold text-slate-950">{meta.label}</h3>
        <p className="text-sm leading-6 text-slate-600">{meta.description}</p>
      </div>
    </button>
  );
}

export function RegistrationForm({ initialRole }: RegistrationFormProps) {
  const [step, setStep] = React.useState<RegistrationStep>(1);
  const [selectedRole, setSelectedRole] = React.useState<RegistrationRole | "">(
    initialRole ?? ""
  );

  if (step === 2 && selectedRole) {
    return (
      <RegistrationDetailsForm
        key={selectedRole}
        role={selectedRole}
        onBack={() => setStep(1)}
      />
    );
  }

  return (
    <div className="space-y-7 text-slate-900">
      <div className="space-y-4">
        <RegistrationProgress currentStep={1} />
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="soft" className="rounded-full px-3 py-1 text-[0.72rem] font-semibold tracking-wide">
            Step 1 of 5
          </Badge>
          <Badge variant="secondary" className="rounded-full px-3 py-1 text-[0.72rem] font-semibold tracking-wide">
            Choose Role
          </Badge>
        </div>
        <div className="space-y-2">
          <h2 className="font-display text-[clamp(2.1rem,4vw,3rem)] font-semibold leading-tight text-slate-950">
            Choose your role
          </h2>
          <p className="max-w-md text-sm leading-7 text-slate-600 sm:text-base">
            Select the account type that matches how you&apos;ll use CareConnect.
          </p>
        </div>
      </div>

      <div role="radiogroup" aria-label="Registration role" className="grid gap-4 sm:grid-cols-2">
        <RoleOption
          role="WORKER"
          selected={selectedRole === "WORKER"}
          onSelect={(role) => setSelectedRole(role)}
        />
        <RoleOption
          role="FACILITY"
          selected={selectedRole === "FACILITY"}
          onSelect={(role) => setSelectedRole(role)}
        />
      </div>

      <Button
        className="h-14 w-full rounded-2xl sm:h-12"
        disabled={!selectedRole}
        type="button"
        onClick={() => setStep(2)}
      >
        Continue
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
