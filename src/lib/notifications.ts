import type { ClientSession } from "mongoose";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Notification from "@/models/Notification";
import type { NotificationType } from "@/lib/constants";

type CreateNotificationInput = {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
};

type BulkNotificationInput = Omit<CreateNotificationInput, "userId">;

async function createNotificationPayloads(
  userIds: string[],
  input: BulkNotificationInput,
  session?: ClientSession
) {
  await connectDB();

  const uniqueUserIds = [...new Set(userIds.filter(Boolean))];
  if (uniqueUserIds.length === 0) {
    return [];
  }

  const payloads = uniqueUserIds.map((userId) => ({
    userId,
    title: input.title,
    message: input.message,
    type: input.type ?? "INFO",
    isRead: false
  }));

  if (session) {
    return Notification.create(payloads, { session });
  }

  return Notification.create(payloads);
}

export async function createNotification(
  input: CreateNotificationInput,
  session?: ClientSession
) {
  return createNotificationPayloads([input.userId], input, session);
}

export async function notifyUsers(
  userIds: string[],
  input: BulkNotificationInput,
  session?: ClientSession
) {
  return createNotificationPayloads(userIds, input, session);
}

export async function notifyAdmins(
  input: BulkNotificationInput,
  session?: ClientSession
) {
  await connectDB();

  const admins = await User.find({ role: "ADMIN", isActive: true })
    .select("_id")
    .lean();

  return createNotificationPayloads(
    admins.map((admin) => String(admin._id)),
    input,
    session
  );
}

export async function notifyWorkerApplicationSubmitted(
  workerUserId: string,
  shiftTitle: string,
  session?: ClientSession
) {
  return createNotification({
    userId: workerUserId,
    title: "Shift application submitted",
    message: `Your application for ${shiftTitle} has been received.`,
    type: "SUCCESS"
  }, session);
}

export async function notifyWorkerApplicationDecision(
  workerUserId: string,
  shiftTitle: string,
  decision: "ACCEPTED" | "REJECTED",
  session?: ClientSession
) {
  return createNotification({
    userId: workerUserId,
    title:
      decision === "ACCEPTED"
        ? "Application accepted"
        : "Application rejected",
    message:
      decision === "ACCEPTED"
        ? `Good news. Your application for ${shiftTitle} was accepted.`
        : `Your application for ${shiftTitle} was not selected.`,
    type: decision === "ACCEPTED" ? "SUCCESS" : "WARNING"
  }, session);
}

export async function notifyFacilityNewApplication(
  facilityUserId: string,
  shiftTitle: string,
  workerName: string,
  session?: ClientSession
) {
  return createNotification({
    userId: facilityUserId,
    title: "New application received",
    message: `${workerName} has applied for ${shiftTitle}.`,
    type: "INFO"
  }, session);
}
