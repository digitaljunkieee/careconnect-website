import VerificationLog from "@/models/VerificationLog";
import WorkerProfile from "@/models/WorkerProfile";
import WebhookEventLog from "@/models/WebhookEventLog";
import { notifyAdmins, createNotification } from "@/lib/notifications";
import { enqueueEmail } from "@/lib/integrations/email-queue";
import { getAppBaseUrl } from "@/lib/app-url";
import { hashSha256 } from "@/lib/signature";
import {
  type EbcWebhookPayloadInput
} from "@/lib/validators/integrations";

export type EbcWebhookResult = {
  eventId: string;
  verificationLogId: string;
  workerProfileId: string;
  status: "PROCESSED" | "IGNORED";
  verificationStatus: "PENDING" | "IN_REVIEW" | "VERIFIED" | "REJECTED";
};

function normalizeVerificationStatus(
  eventType: EbcWebhookPayloadInput["eventType"],
  status?: EbcWebhookPayloadInput["status"]
) {
  const normalized = status?.toUpperCase();

  if (normalized === "VERIFIED" || eventType === "VERIFICATION_COMPLETED") {
    return "VERIFIED" as const;
  }

  if (normalized === "REJECTED" || eventType === "VERIFICATION_FAILED") {
    return "REJECTED" as const;
  }

  if (
    normalized === "IN_REVIEW" ||
    normalized === "PENDING" ||
    eventType === "ADDITIONAL_INFORMATION_REQUESTED" ||
    eventType === "Additional Information Requested"
  ) {
    return "IN_REVIEW" as const;
  }

  return "PENDING" as const;
}

async function findVerificationContext(payload: EbcWebhookPayloadInput) {
  if (payload.applicantId) {
    const log = await VerificationLog.findOne({ ebcApplicantId: payload.applicantId })
      .sort({ createdAt: -1 })
      .lean();

    if (log) {
      const profile = await WorkerProfile.findById(log.workerId).populate({
        path: "userId",
        select: "firstName lastName email"
      });
      return { log, profile };
    }
  }

  if (payload.workerProfileId) {
    const profile = await WorkerProfile.findById(payload.workerProfileId).populate({
      path: "userId",
      select: "firstName lastName email"
    });

    if (profile) {
      const log = await VerificationLog.findOne({ workerId: profile._id })
        .sort({ createdAt: -1 })
        .lean();

      return { log, profile };
    }
  }

  return { log: null, profile: null };
}

export async function processEbcWebhookPayload(
  payload: EbcWebhookPayloadInput
): Promise<EbcWebhookResult> {
  const eventId =
    payload.eventId?.trim() || payload.applicantId || hashSha256(JSON.stringify(payload));
  const existingEvent = await WebhookEventLog.findOne({
    provider: "EBC",
    eventId
  });

  if (existingEvent?.status === "PROCESSED") {
    return {
      eventId,
      verificationLogId: "",
      workerProfileId: "",
      status: "IGNORED",
      verificationStatus: normalizeVerificationStatus(payload.eventType, payload.status)
    };
  }

  const eventLog =
    existingEvent ??
    (await WebhookEventLog.create({
      provider: "EBC",
      eventId,
      eventType: payload.eventType,
      status: "RECEIVED",
      payload: payload as Record<string, unknown>,
      lastError: "",
      processedAt: null
    }));

  try {
    const context = await findVerificationContext(payload);
    const log = context.log;
    const profile = context.profile;

    if (!log || !profile) {
      throw new Error("Verification log not found for EBC webhook payload.");
    }

    const nextStatus = normalizeVerificationStatus(payload.eventType, payload.status);
    const payloadData = (payload.payload ?? {}) as Record<string, unknown>;
    const reportUrl =
      String(payloadData.reportUrl ?? payloadData.report_url ?? "") ||
      log.reportUrl ||
      "";

    const updatedLog = await VerificationLog.findById(log._id);
    if (!updatedLog) {
      throw new Error("Verification log disappeared before webhook processing.");
    }

    updatedLog.status = nextStatus;
    updatedLog.reportUrl = reportUrl;
    updatedLog.payload = {
      ...(updatedLog.payload as Record<string, unknown>),
      ...payloadData,
      ebcWebhook: payload
    };
    if (payload.applicantId) {
      updatedLog.ebcApplicantId = payload.applicantId;
    }
    if (nextStatus === "VERIFIED" || nextStatus === "REJECTED") {
      updatedLog.decisionAt = new Date();
    }
    await updatedLog.save();

    const workerProfile = await WorkerProfile.findById(profile._id).populate({
      path: "userId",
      select: "firstName lastName email"
    });
    if (!workerProfile) {
      throw new Error("Worker profile not found for webhook update.");
    }

    workerProfile.verificationStatus = nextStatus;
    workerProfile.isVerified = nextStatus === "VERIFIED";
    await workerProfile.save();

    const workerUser = workerProfile.userId as unknown as {
      _id?: unknown;
      email?: string;
      firstName?: string;
      lastName?: string;
    } | null;
    const workerName = `${workerUser?.firstName ?? ""} ${workerUser?.lastName ?? ""}`.trim() ||
      workerUser?.email ||
      "Worker";

    if (workerUser?.email) {
      const template =
        nextStatus === "VERIFIED"
          ? "VERIFICATION_APPROVED"
          : nextStatus === "REJECTED"
            ? "VERIFICATION_REJECTED"
            : "VERIFICATION_SUBMITTED";

      try {
        await enqueueEmail({
          recipients: [{ email: workerUser.email, name: workerName }],
          template,
          payload: {
            firstName: workerUser.firstName ?? "",
            lastName: workerUser.lastName ?? "",
            workerDashboardUrl: `${getAppBaseUrl()}/dashboard/worker`,
            notes:
              nextStatus === "REJECTED"
                ? payload.notes || "The verification team requested additional attention."
                : payload.notes || "",
            shiftTitle: "Verification review"
          }
        });
      } catch (error) {
        console.warn("Failed to queue EBC verification email:", error);
      }
    }

    await notifyAdmins(
      {
        title: "EBC verification update",
        message: `${workerName} verification moved to ${nextStatus}.`,
        type: nextStatus === "VERIFIED" ? "SUCCESS" : "INFO"
      }
    );

    await createNotification(
      {
        userId: String(workerUser?._id ?? workerProfile.userId),
        title:
          nextStatus === "VERIFIED"
            ? "Verification approved"
            : nextStatus === "REJECTED"
              ? "Verification rejected"
              : "Verification update received",
        message:
          nextStatus === "VERIFIED"
            ? "Your verification was approved by EBC."
            : nextStatus === "REJECTED"
              ? payload.notes || "Your verification was rejected. Please review the latest update."
              : "EBC has requested additional information or your verification is still in review.",
        type: nextStatus === "VERIFIED" ? "SUCCESS" : "WARNING"
      }
    );

    eventLog.status = "PROCESSED";
    eventLog.processedAt = new Date();
    eventLog.eventType = payload.eventType;
    eventLog.payload = {
      ...(eventLog.payload as Record<string, unknown>),
      webhook: payload
    };
    eventLog.lastError = "";
    await eventLog.save();

    return {
      eventId,
      verificationLogId: String(updatedLog._id),
      workerProfileId: String(workerProfile._id),
      status: "PROCESSED",
      verificationStatus: nextStatus
    };
  } catch (error) {
    eventLog.status = "FAILED";
    eventLog.lastError = error instanceof Error ? error.message : "Unable to process EBC webhook.";
    eventLog.payload = {
      ...(eventLog.payload as Record<string, unknown>),
      webhook: payload
    };
    await eventLog.save();
    throw error;
  }
}
