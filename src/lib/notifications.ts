import type { ClientSession } from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { paginateItems } from "@/lib/pagination";
import User from "@/models/User";
import Notification from "@/models/Notification";
import { NOTIFICATION_TYPES, type NotificationRecipientRole, type NotificationType } from "@/lib/constants";

type NotificationPayloadInput = {
  recipientRole: NotificationRecipientRole;
  title: string;
  message: string;
  type?: NotificationType;
  actionUrl?: string;
};

export type CreateNotificationInput = NotificationPayloadInput & {
  recipient: string;
};

type BulkNotificationInput = NotificationPayloadInput;

export type NotificationReadStatus = "ALL" | "READ" | "UNREAD";

export type NotificationFeedItem = {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  actionUrl: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
};

export type NotificationListData = {
  rows: NotificationFeedItem[];
  total: number;
  unreadTotal: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

function getRecipientQuery(recipientId: string) {
  return {
    $or: [{ recipient: recipientId }, { userId: recipientId }]
  };
}

function normalizeNotificationType(value?: string): NotificationType {
  return NOTIFICATION_TYPES.includes(value as NotificationType)
    ? (value as NotificationType)
    : "system";
}

function mapNotification(notification: {
  _id: unknown;
  title?: string;
  message?: string;
  type?: NotificationType;
  actionUrl?: string;
  isRead?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}) {
  return {
    id: String(notification._id),
    title: notification.title ?? "",
    message: notification.message ?? "",
    type: normalizeNotificationType(notification.type),
    actionUrl: notification.actionUrl ?? "",
    isRead: Boolean(notification.isRead),
    createdAt: notification.createdAt?.toISOString?.() ?? new Date().toISOString(),
    updatedAt: notification.updatedAt?.toISOString?.() ?? new Date().toISOString()
  };
}

async function createNotificationPayloads(
  recipientIds: string[],
  input: BulkNotificationInput,
  session?: ClientSession
) {
  await connectDB();

  const uniqueRecipientIds = [...new Set(recipientIds.filter(Boolean))];
  if (uniqueRecipientIds.length === 0) {
    return [];
  }

  const payloads = uniqueRecipientIds.map((recipient) => ({
    recipient,
    recipientRole: input.recipientRole,
    userId: recipient,
    title: input.title,
    message: input.message,
    type: input.type ?? "system",
    actionUrl: input.actionUrl?.trim() ?? "",
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
  return createNotificationPayloads([input.recipient], input, session);
}

export async function notifyUsers(
  recipientIds: string[],
  recipientRole: NotificationRecipientRole,
  input: Omit<BulkNotificationInput, "recipientRole">,
  session?: ClientSession
) {
  return createNotificationPayloads(
    recipientIds,
    {
      ...input,
      recipientRole
    },
    session
  );
}

export async function notifyAdmins(
  input: Omit<BulkNotificationInput, "recipientRole">,
  session?: ClientSession
) {
  await connectDB();

  const admins = await User.find({ role: "ADMIN", isActive: true })
    .select("_id")
    .lean();

  return notifyUsers(
    admins.map((admin) => String(admin._id)),
    "admin",
    input,
    session
  );
}

export async function getUserNotificationsData(
  recipientId: string,
  filters: {
    page: number;
    pageSize: number;
    readStatus?: NotificationReadStatus;
  }
): Promise<NotificationListData> {
  await connectDB();

  const notifications = await Notification.find(getRecipientQuery(recipientId))
    .sort({ createdAt: -1 })
    .lean();

  const unreadTotal = notifications.filter((notification) => !notification.isRead).length;

  const mapped = notifications
    .map(mapNotification)
    .filter((notification) => {
      if (filters.readStatus === "READ") {
        return notification.isRead;
      }

      if (filters.readStatus === "UNREAD") {
        return !notification.isRead;
      }

      return true;
    });

  const paginated = paginateItems(mapped, filters.page, filters.pageSize);

  return {
    rows: paginated.rows,
    total: paginated.total,
    unreadTotal,
    page: paginated.page,
    pageSize: filters.pageSize,
    pageCount: paginated.pageCount
  };
}

export async function getUnreadNotificationCount(recipientId: string) {
  await connectDB();

  return Notification.countDocuments({
    ...getRecipientQuery(recipientId),
    isRead: false
  });
}

export async function markNotificationAsRead(
  recipientId: string,
  notificationId: string
) {
  await connectDB();

  const result = await Notification.findOneAndUpdate(
    {
      _id: notificationId,
      ...getRecipientQuery(recipientId)
    },
    {
      $set: {
        isRead: true
      }
    },
    { new: true }
  ).lean();

  return {
    updated: Boolean(result)
  };
}

export async function markAllNotificationsAsRead(recipientId: string) {
  await connectDB();

  const result = await Notification.updateMany(
    {
      ...getRecipientQuery(recipientId),
      isRead: false
    },
    {
      $set: {
        isRead: true
      }
    }
  );

  return {
    updated: result.modifiedCount
  };
}

export async function notifyWorkerApplicationSubmitted(
  workerUserId: string,
  shiftTitle: string,
  session?: ClientSession
) {
  return createNotification(
    {
      recipient: workerUserId,
      recipientRole: "worker",
      title: "Application submitted",
      message: `Your application for ${shiftTitle} is in review.`,
      type: "application",
      actionUrl: "/dashboard/worker/applications"
    },
    session
  );
}

export async function notifyWorkerApplicationDecision(
  workerUserId: string,
  shiftTitle: string,
  decision: "ACCEPTED" | "REJECTED",
  session?: ClientSession
) {
  return createNotification(
    {
      recipient: workerUserId,
      recipientRole: "worker",
      title:
        decision === "ACCEPTED"
          ? "Application accepted"
          : "Application rejected",
      message:
        decision === "ACCEPTED"
          ? `Your application for ${shiftTitle} was accepted.`
          : `Your application for ${shiftTitle} was not selected.`,
      type: "application",
      actionUrl: "/dashboard/worker/applications"
    },
    session
  );
}

export async function notifyFacilityNewApplication(
  facilityUserId: string,
  shiftTitle: string,
  workerName: string,
  session?: ClientSession
) {
  return createNotification(
    {
      recipient: facilityUserId,
      recipientRole: "facility",
      title: "New application",
      message: `${workerName} applied for ${shiftTitle}.`,
      type: "application",
      actionUrl: "/dashboard/facility/applicants"
    },
    session
  );
}

export async function notifyFacilityShiftCreated(
  facilityUserId: string,
  shiftTitle: string,
  session?: ClientSession
) {
  return createNotification(
    {
      recipient: facilityUserId,
      recipientRole: "facility",
      title: "Shift created",
      message: `${shiftTitle} is now live.`,
      type: "shift",
      actionUrl: "/dashboard/facility/shifts"
    },
    session
  );
}

export async function notifyFacilityShiftFilled(
  facilityUserId: string,
  shiftTitle: string,
  session?: ClientSession
) {
  return createNotification(
    {
      recipient: facilityUserId,
      recipientRole: "facility",
      title: "Shift filled",
      message: `${shiftTitle} now has an assigned worker.`,
      type: "shift",
      actionUrl: "/dashboard/facility/shifts"
    },
    session
  );
}

export async function notifyWorkerShiftCompleted(
  workerUserId: string,
  shiftTitle: string,
  session?: ClientSession
) {
  return createNotification(
    {
      recipient: workerUserId,
      recipientRole: "worker",
      title: "Shift completed",
      message: `Your shift for ${shiftTitle} is marked complete.`,
      type: "shift",
      actionUrl: "/dashboard/worker/assignments"
    },
    session
  );
}
