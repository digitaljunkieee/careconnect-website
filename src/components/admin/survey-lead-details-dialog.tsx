"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import type { AdminSurveyLeadDetail } from "@/lib/survey-leads";
import {
  SURVEY_LEAD_STATUSES,
  type SurveyLeadStatus,
  type SurveyUserType
} from "@/lib/validators/survey";

const userTypeLabels: Record<SurveyUserType, string> = {
  CARE_WORKER: "Care Worker",
  CARE_FACILITY: "Care Facility",
  INTERESTED_PARTNER: "Interested Partner"
};

const statusLabels: Record<SurveyLeadStatus, string> = {
  WAITLISTED: "Waitlisted",
  CONTACTED: "Contacted",
  APPROVED: "Approved",
  REJECTED: "Rejected"
};

const questionLabels: Record<string, string> = {
  currentShiftSources: "How do you currently find care shifts?",
  otherShiftSource: "Other way of finding shifts",
  shiftsPerWeek: "How many shifts do you typically work per week?",
  currentShiftSatisfaction: "How satisfied are you with how you currently get shifts?",
  paymentSpeed: "How quickly do you usually get paid after a shift?",
  agencyFrustrations: "What frustrates you most about agencies or platforms?",
  complianceReuploadFrequency: "How often do you re-upload compliance documents?",
  experienceValuation: "How much do agencies value your training and experience?",
  verifiedProfileUsefulness: "How useful would a reusable verified worker profile be?",
  platformChoiceFactors: "What would make you choose one platform over another?",
  agencyChange: "What would you change about working through agencies?",
  organizationName: "Facility or organisation name",
  interestGoals: "What are you most interested in?",
  additionalFeedback: "Anything else you would like us to know?"
};

const answerLabels: Record<string, string> = {
  AGENCY: "Agency / agencies",
  APP_PLATFORM: "App or platform",
  DIRECT_BANK: "Direct care-home or bank work",
  WORD_OF_MOUTH: "Word of mouth",
  OTHER: "Other",
  "0_2": "0–2",
  "3_5": "3–5",
  "6_10": "6–10",
  "11_PLUS": "11+",
  SAME_DAY: "Same day",
  WITHIN_3_DAYS: "Within 3 days",
  WITHIN_A_WEEK: "Within a week",
  TWO_PLUS_WEEKS: "2+ weeks",
  UNPREDICTABLE: "Unpredictable",
  LOW_PAY_HIGH_CUT: "Low pay / high agency cut",
  SLOW_UNRELIABLE_PAYMENT: "Slow or unreliable payment",
  NO_INDUCTION_INFORMATION: "No induction or placement information",
  LAST_MINUTE_CANCELLATIONS: "Last-minute cancellations",
  REPEATED_DOCUMENT_UPLOADS: "Repeated document uploads",
  POOR_COMMUNICATION: "Poor communication",
  NOT_ENOUGH_SHIFTS: "Not enough shifts",
  TREATED_LIKE_A_NUMBER: "Feeling treated like a number",
  NEVER: "Never",
  OCCASIONALLY: "Occasionally",
  FREQUENTLY: "Frequently",
  EVERY_SINGLE_TIME: "Every single time",
  FIND_VERIFIED_WORKERS: "Finding verified care workers",
  FILL_SHIFTS_FASTER: "Filling shifts faster",
  MANAGE_COMPLIANCE: "Simplifying compliance",
  PARTNERSHIP_OPPORTUNITIES: "Partnership opportunities",
  PRODUCT_UPDATES: "Product and launch updates"
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function formatAnswer(value: unknown) {
  if (Array.isArray(value)) {
    return value.length
      ? value.map((item) => answerLabels[String(item)] ?? String(item)).join(", ")
      : "Not answered";
  }
  if (value === undefined || value === null || value === "") return "Not answered";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return answerLabels[String(value)] ?? String(value);
}

async function parseResponse<T>(response: Response) {
  const payload = (await response.json().catch(() => null)) as
    | { data?: T; error?: { message?: string } }
    | null;
  if (!response.ok || !payload?.data) {
    throw new Error(payload?.error?.message ?? "Unable to load this survey response.");
  }
  return payload.data;
}

export function SurveyLeadDetailsDialog({ leadId }: { leadId: string }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [lead, setLead] = React.useState<AdminSurveyLeadDetail | null>(null);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [status, setStatus] = React.useState<SurveyLeadStatus>("WAITLISTED");

  React.useEffect(() => {
    if (!open || lead) return;
    let cancelled = false;
    setLoading(true);
    setError("");

    fetch(`/api/admin/survey-leads/${leadId}`, { cache: "no-store" })
      .then((response) => parseResponse<AdminSurveyLeadDetail>(response))
      .then((data) => {
        if (!cancelled) {
          setLead(data);
          setStatus(data.status);
        }
      })
      .catch((requestError) => {
        if (!cancelled) {
          setError(requestError instanceof Error ? requestError.message : "Unable to load response.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [lead, leadId, open]);

  async function updateStatus() {
    if (!lead || status === lead.status) return;
    setSaving(true);

    try {
      const response = await fetch(`/api/admin/survey-leads/${leadId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const updated = await parseResponse<AdminSurveyLeadDetail>(response);
      setLead(updated);
      setStatus(updated.status);
      toast.success("Survey lead status updated.");
      router.refresh();
    } catch (requestError) {
      toast.error(
        requestError instanceof Error ? requestError.message : "Unable to update status."
      );
    } finally {
      setSaving(false);
    }
  }

  const answerEntries = lead
    ? Object.entries(lead.surveyAnswers).sort(([first], [second]) => {
        const keys = Object.keys(questionLabels);
        return keys.indexOf(first) - keys.indexOf(second);
      })
    : [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl" size="sm" variant="outline">
          <Eye className="h-4 w-4" />
          View details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto p-5 sm:p-7">
        <DialogHeader>
          <DialogTitle>Survey response</DialogTitle>
          <DialogDescription>Full early-access response and lead management.</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4 py-2" aria-label="Loading survey response">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-20 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : lead ? (
          <div className="space-y-6">
            <section className="grid gap-3 rounded-2xl border border-border/70 bg-muted/30 p-4 sm:grid-cols-2">
              <div><div className="text-xs text-muted-foreground">Name</div><div className="mt-1 font-medium">{lead.fullName}</div></div>
              <div><div className="text-xs text-muted-foreground">User type</div><div className="mt-1"><Badge variant="outline">{userTypeLabels[lead.userType]}</Badge></div></div>
              <div><div className="text-xs text-muted-foreground">Email</div><div className="mt-1 break-all font-medium">{lead.email}</div></div>
              <div><div className="text-xs text-muted-foreground">Phone</div><div className="mt-1 font-medium">{lead.phone || "Not provided"}</div></div>
              <div><div className="text-xs text-muted-foreground">Location</div><div className="mt-1 font-medium">{lead.location}</div></div>
              <div><div className="text-xs text-muted-foreground">Launch notifications</div><div className="mt-1 font-medium">{lead.notificationConsent ? "Consented" : "Not consented"}</div></div>
              <div><div className="text-xs text-muted-foreground">Submitted</div><div className="mt-1 font-medium">{formatDate(lead.submittedAt)}</div></div>
              <div><div className="text-xs text-muted-foreground">Current status</div><div className="mt-1 font-medium">{statusLabels[lead.status]}</div></div>
            </section>

            <section>
              <h3 className="font-display text-lg font-semibold">Survey questions and answers</h3>
              <div className="mt-3 space-y-3">
                {answerEntries.map(([key, value]) => (
                  <div key={key} className="rounded-2xl border border-border/70 p-4">
                    <div className="text-sm font-medium">{questionLabels[key] ?? key.replaceAll(/([A-Z])/g, " $1").trim()}</div>
                    <div className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{formatAnswer(value)}</div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-border/70 p-4">
              <label className="text-sm font-medium" htmlFor={`lead-status-${lead.id}`}>Lead status</label>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                <select
                  id={`lead-status-${lead.id}`}
                  value={status}
                  onChange={(event) => setStatus(event.target.value as SurveyLeadStatus)}
                  className="h-11 flex-1 rounded-2xl border border-border bg-background px-3 text-sm"
                >
                  {SURVEY_LEAD_STATUSES.map((item) => (
                    <option key={item} value={item}>{statusLabels[item]}</option>
                  ))}
                </select>
                <Button disabled={saving || status === lead.status} onClick={updateStatus}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {saving ? "Saving…" : "Update status"}
                </Button>
              </div>
            </section>
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
