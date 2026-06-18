import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import WorkerProfile from "@/models/WorkerProfile";
import Shift from "@/models/Shift";
import Application from "@/models/Application";
import Assignment from "@/models/Assignment";
import VerificationLog from "@/models/VerificationLog";
import { createNotification } from "@/lib/notifications";
import { recordAuditLog } from "@/lib/audit";
import { enqueueEmail } from "@/lib/integrations/email-queue";
import { getAppBaseUrl } from "@/lib/app-url";

export async function updateAdminProfile(
  adminId: string,
  input: {
    firstName: string;
    lastName: string;
    phone?: string;
    notificationPreferences: {
      email: boolean;
      inApp: boolean;
      sms: boolean;
      weeklyDigest: boolean;
    };
  }
) {
  await connectDB();

  const admin = await User.findById(adminId);

  if (!admin || admin.role !== "ADMIN") {
    throw new Error("Admin profile not found.");
  }

  admin.firstName = input.firstName.trim();
  admin.lastName = input.lastName.trim();
  admin.phone = input.phone?.trim() ?? "";
  admin.notificationPreferences = {
    email: input.notificationPreferences.email,
    inApp: input.notificationPreferences.inApp,
    sms: input.notificationPreferences.sms,
    weeklyDigest: input.notificationPreferences.weeklyDigest
  };

  await admin.save();

  await recordAuditLog({
    adminId,
    action: "SETTINGS_UPDATED",
    entityType: "SETTING",
    entityId: adminId,
    metadata: {
      section: "profile"
    }
  });

  return admin.toObject();
}

export async function updateAdminPassword(
  adminId: string,
  currentPassword: string,
  newPassword: string
) {
  await connectDB();

  const admin = await User.findById(adminId);

  if (!admin || admin.role !== "ADMIN") {
    throw new Error("Admin profile not found.");
  }

  const isValid = await bcrypt.compare(currentPassword, admin.password);

  if (!isValid) {
    const error = new Error("Current password is incorrect.");
    (error as Error & { statusCode?: number }).statusCode = 400;
    throw error;
  }

  admin.password = await bcrypt.hash(newPassword, 12);
  await admin.save();

  await recordAuditLog({
    adminId,
    action: "SETTINGS_UPDATED",
    entityType: "SETTING",
    entityId: adminId,
    metadata: {
      section: "password"
    }
  });

  return { updated: true };
}

export async function setWorkerActivationStatus(
  adminId: string,
  workerUserId: string,
  isActive: boolean
) {
  await connectDB();

  const worker = await User.findOne({ _id: workerUserId, role: "WORKER" });

  if (!worker) {
    throw new Error("Worker account not found.");
  }

  worker.isActive = isActive;
  await worker.save();

  await recordAuditLog({
    adminId,
    action: isActive ? "WORKER_ENABLED" : "WORKER_DISABLED",
    entityType: "WORKER",
    entityId: workerUserId,
    metadata: {
      isActive
    }
  });

  return worker.toObject();
}

export async function setFacilityActivationStatus(
  adminId: string,
  facilityUserId: string,
  isActive: boolean
) {
  await connectDB();

  const facility = await User.findOne({ _id: facilityUserId, role: "FACILITY" });

  if (!facility) {
    throw new Error("Facility account not found.");
  }

  facility.isActive = isActive;
  await facility.save();

  await recordAuditLog({
    adminId,
    action: isActive ? "FACILITY_ENABLED" : "FACILITY_DISABLED",
    entityType: "FACILITY",
    entityId: facilityUserId,
    metadata: {
      isActive
    }
  });

  return facility.toObject();
}

export async function reviewVerificationRequest(
  adminId: string,
  workerProfileId: string,
  decision: "APPROVE" | "REJECT",
  notes: string
) {
  await connectDB();

  const session = await mongoose.startSession();
  let workerEmail = "";
  let workerFirstName = "";
  let workerLastName = "";
  let workerDisplayName = "";

  try {
    let result:
      | {
          workerProfileId: string;
          verificationLogId: string;
          status: "VERIFIED" | "REJECTED";
        }
      | null = null;

    await session.withTransaction(async () => {
      const profile = await WorkerProfile.findById(workerProfileId)
        .populate({ path: "userId", select: "firstName lastName email" })
        .session(session);

      if (!profile) {
        throw new Error("Worker profile not found.");
      }

      const latestLog = await VerificationLog.findOne({ workerId: profile._id })
        .sort({ createdAt: -1 })
        .session(session);

      if (!latestLog) {
        throw new Error("Verification request not found.");
      }

      const nextStatus = decision === "APPROVE" ? "VERIFIED" : "REJECTED";
      profile.verificationStatus = nextStatus;
      profile.isVerified = decision === "APPROVE";
      await profile.save({ session });

      latestLog.status = nextStatus;
      latestLog.adminId = new mongoose.Types.ObjectId(adminId);
      latestLog.adminNotes = notes.trim();
      latestLog.decisionAt = new Date();
      await latestLog.save({ session });

      const user = profile.userId as unknown as {
        _id?: mongoose.Types.ObjectId;
        email?: string;
        firstName?: string;
        lastName?: string;
      } | null;

      workerEmail = user?.email ?? "";
      workerFirstName = user?.firstName ?? "";
      workerLastName = user?.lastName ?? "";
      workerDisplayName =
        `${workerFirstName} ${workerLastName}`.trim() || workerEmail || "Worker";

      if (user?._id) {
        await createNotification(
          {
            userId: String(user._id),
            title:
              decision === "APPROVE"
                ? "Verification approved"
                : "Verification rejected",
            message:
              decision === "APPROVE"
                ? "Your worker verification was approved and your account is now active."
                : notes.trim()
                  ? `Your worker verification was rejected. ${notes.trim()}`
                  : "Your worker verification was rejected. Please review the admin notes.",
            type: decision === "APPROVE" ? "SUCCESS" : "WARNING"
          },
          session
        );
      }

      await recordAuditLog(
        {
          adminId,
          action:
            decision === "APPROVE"
              ? "VERIFICATION_APPROVED"
              : "VERIFICATION_REJECTED",
          entityType: "VERIFICATION",
          entityId: String(profile._id),
          metadata: {
            adminNotes: notes.trim(),
            decisionAt: new Date().toISOString(),
            workerUserId: String(user?._id ?? profile.userId)
          }
        },
        session
      );

      result = {
        workerProfileId: String(profile._id),
        verificationLogId: String(latestLog._id),
        status: nextStatus
      };
    });

    if (!result) {
      throw new Error("Unable to process verification decision.");
    }

    if (workerEmail) {
      try {
        await enqueueEmail({
          recipients: [
            {
              email: workerEmail,
              name: workerDisplayName
            }
          ],
          template:
            decision === "APPROVE"
              ? "VERIFICATION_APPROVED"
              : "VERIFICATION_REJECTED",
          payload: {
            firstName: workerFirstName,
            lastName: workerLastName,
            workerDashboardUrl: `${getAppBaseUrl()}/dashboard/worker`,
            notes: notes.trim() || ""
          }
        });
      } catch (error) {
        console.warn("Failed to queue verification decision email:", error);
      }
    }

    return result;
  } finally {
    await session.endSession();
  }
}

export async function cancelAdminShift(
  adminId: string,
  shiftId: string,
  notes?: string
) {
  await connectDB();

  const session = await mongoose.startSession();

  try {
    let updated = false;

    await session.withTransaction(async () => {
      const shift = await Shift.findById(shiftId).session(session);

      if (!shift) {
        throw new Error("Shift not found.");
      }

      shift.status = "CLOSED";
      await shift.save({ session });

      await Assignment.updateMany(
        { shiftId: shift._id },
        { $set: { status: "CANCELLED" } },
        { session }
      );

      await Application.updateMany(
        { shiftId: shift._id, status: { $in: ["PENDING", "ACCEPTED"] } },
        { $set: { status: "CANCELLED" } },
        { session }
      );

      await recordAuditLog(
        {
          adminId,
          action: "SHIFT_CANCELLED",
          entityType: "SHIFT",
          entityId: String(shift._id),
          metadata: {
            notes: notes?.trim() ?? ""
          }
        },
        session
      );

      updated = true;
    });

    return { updated };
  } finally {
    await session.endSession();
  }
}

export async function reassignAdminShift(
  adminId: string,
  shiftId: string,
  workerUserId: string,
  notes?: string
) {
  await connectDB();

  const session = await mongoose.startSession();

  try {
    let updated = false;

    await session.withTransaction(async () => {
      const shift = await Shift.findById(shiftId).session(session);

      if (!shift) {
        throw new Error("Shift not found.");
      }

      const workerProfile = await WorkerProfile.findOne({ userId: workerUserId })
        .populate({ path: "userId", select: "firstName lastName email" })
        .session(session);

      if (!workerProfile) {
        throw new Error("Worker profile not found.");
      }

      if (workerProfile.verificationStatus !== "VERIFIED" || !workerProfile.isVerified) {
        const error = new Error("Worker must be verified before reassignment.");
        (error as Error & { statusCode?: number }).statusCode = 400;
        throw error;
      }

      const assignment = await Assignment.findOne({ shiftId: shift._id }).session(session);

      if (assignment) {
        assignment.workerId = workerProfile._id;
        assignment.status = "UPCOMING";
        assignment.assignedAt = new Date();
        await assignment.save({ session });
      } else {
        await Assignment.create(
          [
            {
              workerId: workerProfile._id,
              facilityId: shift.facilityId,
              shiftId: shift._id,
              status: "UPCOMING",
              assignedAt: new Date()
            }
          ],
          { session }
        );
      }

      shift.status = "FILLED";
      await shift.save({ session });

      const workerUser = workerProfile.userId as unknown as {
        _id?: mongoose.Types.ObjectId;
      } | null;

      if (workerUser?._id) {
        await createNotification(
          {
            userId: String(workerUser._id),
            title: "Shift reassigned to you",
            message: notes?.trim()
              ? `You have been reassigned to a shift. ${notes.trim()}`
              : "You have been reassigned to a shift by an administrator.",
            type: "INFO"
          },
          session
        );
      }

      await recordAuditLog(
        {
          adminId,
          action: "SHIFT_REASSIGNED",
          entityType: "SHIFT",
          entityId: String(shift._id),
          metadata: {
            workerUserId,
            notes: notes?.trim() ?? ""
          }
        },
        session
      );

      updated = true;
    });

    return { updated };
  } finally {
    await session.endSession();
  }
}

export async function markNotificationsAsRead(
  adminId: string,
  ids: string[]
) {
  await connectDB();

  await mongoose.connection.collection("notifications").updateMany(
    { _id: { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) } },
    { $set: { isRead: true } }
  );

  await recordAuditLog({
    adminId,
    action: "NOTIFICATION_MARKED_READ",
    entityType: "NOTIFICATION",
    entityId: ids[0] ?? "",
    metadata: {
      ids
    }
  });

  return { updated: ids.length };
}

export async function markAllNotificationsAsRead(adminId: string) {
  await connectDB();

  const result = await mongoose.connection.collection("notifications").updateMany(
    { isRead: false },
    { $set: { isRead: true } }
  );

  await recordAuditLog({
    adminId,
    action: "NOTIFICATION_MARKED_ALL_READ",
    entityType: "NOTIFICATION",
    entityId: adminId,
    metadata: {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount
    }
  });

  return { updated: result.modifiedCount };
}

export async function deleteNotifications(adminId: string, ids: string[]) {
  await connectDB();

  await mongoose.connection.collection("notifications").deleteMany({
    _id: { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) }
  });

  await recordAuditLog({
    adminId,
    action: "NOTIFICATION_DELETED",
    entityType: "NOTIFICATION",
    entityId: ids[0] ?? "",
    metadata: {
      ids
    }
  });

  return { deleted: ids.length };
}
