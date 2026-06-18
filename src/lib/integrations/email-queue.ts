import EmailLog from "@/models/EmailLog";
import EmailQueueJob from "@/models/EmailQueueJob";
import { hashSha256 } from "@/lib/signature";
import {
  type BrevoRecipient,
  type BrevoTemplateName,
  renderBrevoTemplate,
  sendBrevoEmail
} from "@/lib/integrations/brevo";
import { createHttpError } from "@/lib/http-error";

export type EmailQueuePayload = {
  recipients: BrevoRecipient[];
  template: BrevoTemplateName | string;
  payload?: Record<string, unknown>;
  subject?: string;
  dedupeKey?: string;
};

export type EnqueueEmailResult = {
  jobId: string;
  created: boolean;
  dedupeKey: string;
};

export type ProcessedEmailResult = {
  processed: number;
  sent: number;
  failed: number;
};

function normalizeRecipients(recipients: BrevoRecipient[]) {
  return recipients
    .map((recipient) => ({
      email: recipient.email.trim().toLowerCase(),
      name: recipient.name?.trim() ?? ""
    }))
    .filter((recipient) => Boolean(recipient.email));
}

function buildDedupeKey(payload: EmailQueuePayload) {
  return payload.dedupeKey?.trim() || hashSha256(
    JSON.stringify({
      recipients: normalizeRecipients(payload.recipients),
      template: payload.template,
      payload: payload.payload ?? {},
      subject: payload.subject ?? ""
    })
  );
}

function getNextAttemptAt(attempts: number) {
  const delayMinutes = Math.min(Math.pow(2, attempts) * 5, 180);
  return new Date(Date.now() + delayMinutes * 60 * 1000);
}

export async function enqueueEmail(payload: EmailQueuePayload): Promise<EnqueueEmailResult> {
  const dedupeKey = buildDedupeKey(payload);
  const recipients = normalizeRecipients(payload.recipients);

  if (recipients.length === 0) {
    throw createHttpError(400, "At least one recipient email is required.");
  }

  const existing = await EmailQueueJob.findOne({ dedupeKey });
  if (existing) {
    return {
      jobId: String(existing._id),
      created: false,
      dedupeKey
    };
  }

  const rendered = renderBrevoTemplate(payload.template as BrevoTemplateName, payload.payload ?? {});
  const subject = payload.subject || rendered.subject;

  const job = await EmailQueueJob.create({
    dedupeKey,
    recipients,
    template: payload.template,
    subject,
    payload: payload.payload ?? {},
    status: "PENDING",
    attempts: 0,
    maxAttempts: 5,
    nextRunAt: new Date(),
    lastError: "",
    providerMessageId: ""
  });

  await EmailLog.create({
    provider: "BREVO",
    recipientEmail: recipients[0]?.email ?? "",
    recipientName: recipients[0]?.name ?? "",
    template: payload.template,
    subject,
    dedupeKey,
    providerMessageId: "",
    status: "QUEUED",
    attempts: 0,
    payload: payload.payload ?? {},
    errorMessage: "",
    sentAt: null
  });

  return {
    jobId: String(job._id),
    created: true,
    dedupeKey
  };
}

async function logEmailAttempt(
  job: {
    template: string;
    recipients: BrevoRecipient[];
    subject: string;
    dedupeKey: string;
    payload: Record<string, unknown>;
  },
  status: "SENT" | "FAILED",
  attemptNumber: number,
  providerMessageId = "",
  errorMessage = ""
) {
  await EmailLog.create({
    provider: "BREVO",
    recipientEmail: job.recipients[0]?.email ?? "",
    recipientName: job.recipients[0]?.name ?? "",
    template: job.template,
    subject: job.subject,
    dedupeKey: job.dedupeKey,
    providerMessageId,
    status,
    attempts: attemptNumber,
    payload: job.payload,
    errorMessage,
    sentAt: status === "SENT" ? new Date() : null
  });
}

export async function processEmailQueue(batchSize = 10): Promise<ProcessedEmailResult> {
  const jobs = await EmailQueueJob.find({
    status: { $in: ["PENDING", "FAILED"] },
    nextRunAt: { $lte: new Date() },
    attempts: { $lt: 5 }
  })
    .sort({ nextRunAt: 1, createdAt: 1 })
    .limit(batchSize);

  let sent = 0;
  let failed = 0;

  for (const job of jobs) {
    const currentAttempt = job.attempts + 1;

    job.status = "PROCESSING";
    await job.save();

    try {
      const result = await sendBrevoEmail({
        to: job.recipients,
        template: job.template as BrevoTemplateName,
        context: job.payload,
        subject: job.subject
      });

      job.status = "SENT";
      job.providerMessageId = result.messageId;
      job.attempts = currentAttempt;
      job.lastError = "";
      job.nextRunAt = getNextAttemptAt(currentAttempt);
      await job.save();

      await logEmailAttempt(
        {
          template: job.template,
          recipients: job.recipients,
          subject: job.subject,
          dedupeKey: job.dedupeKey,
          payload: job.payload
        },
        "SENT",
        currentAttempt,
        result.messageId
      );

      sent += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to send email.";

      job.attempts = currentAttempt;
      job.lastError = message;
      job.status = currentAttempt >= job.maxAttempts ? "FAILED" : "FAILED";
      job.nextRunAt = getNextAttemptAt(currentAttempt);
      await job.save();

      await logEmailAttempt(
        {
          template: job.template,
          recipients: job.recipients,
          subject: job.subject,
          dedupeKey: job.dedupeKey,
          payload: job.payload
        },
        "FAILED",
        currentAttempt,
        "",
        message
      );

      failed += 1;
    }
  }

  return {
    processed: jobs.length,
    sent,
    failed
  };
}

export async function sendEmailImmediately(payload: EmailQueuePayload) {
  const rendered = renderBrevoTemplate(payload.template as BrevoTemplateName, payload.payload ?? {});
  const subject = payload.subject || rendered.subject;
  const result = await sendBrevoEmail({
    to: payload.recipients,
    template: payload.template as BrevoTemplateName,
    context: payload.payload,
    subject
  });

  await EmailLog.create({
    provider: "BREVO",
    recipientEmail: payload.recipients[0]?.email ?? "",
    recipientName: payload.recipients[0]?.name ?? "",
    template: payload.template,
    subject,
    dedupeKey: hashSha256(
      JSON.stringify({
        recipients: normalizeRecipients(payload.recipients),
        template: payload.template,
        payload: payload.payload ?? {},
        subject
      })
    ),
    providerMessageId: result.messageId,
    status: "SENT",
    attempts: 1,
    payload: payload.payload ?? {},
    errorMessage: "",
    sentAt: new Date()
  });

  return result;
}

export async function enqueueOrThrow(payload: EmailQueuePayload) {
  const result = await enqueueEmail(payload);
  if (!result.created) {
    return result;
  }

  return result;
}
