import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import WorkerProfile from "@/models/WorkerProfile";
import FacilityProfile from "@/models/FacilityProfile";
import Shift from "@/models/Shift";
import Application from "@/models/Application";
import Assignment from "@/models/Assignment";
import VerificationLog from "@/models/VerificationLog";
import PaymentLog from "@/models/PaymentLog";
import Notification from "@/models/Notification";
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

  const workerUser = await User.findById(workerUserId).lean();

  if (workerUser) {
    try {
      await createNotification({
        recipient: String(workerUser._id),
        recipientRole: "worker",
        title: isActive ? "Account activated" : "Account paused",
        message: isActive
          ? "Your account is active again."
          : "Your account has been paused.",
        type: "system",
        actionUrl: "/dashboard/worker/profile"
      });
    } catch (error) {
      console.warn("Failed to notify worker about activation status:", error);
    }
  }

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

  const facilityUser = await User.findById(facilityUserId).lean();

  if (facilityUser) {
    try {
      await createNotification({
        recipient: String(facilityUser._id),
        recipientRole: "facility",
        title: isActive ? "Account activated" : "Account paused",
        message: isActive
          ? "Your facility account is active again."
          : "Your facility account has been paused.",
        type: "system",
        actionUrl: "/dashboard/facility/profile"
      });
    } catch (error) {
      console.warn("Failed to notify facility about activation status:", error);
    }
  }

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

export async function deleteWorkerAccount(adminId: string, workerUserId: string) {
  await connectDB();

  const session = await mongoose.startSession();

  try {
    let deleted = false;

    await session.withTransaction(async () => {
      const worker = await User.findOne({ _id: workerUserId, role: "WORKER" }).session(session);

      if (!worker) {
        throw new Error("Worker account not found.");
      }

      const profile = await WorkerProfile.findOne({ userId: worker._id }).session(session);

      if (!profile) {
        throw new Error("Worker profile not found.");
      }

      await Assignment.deleteMany({ workerId: profile._id }).session(session);
      await Application.deleteMany({ workerId: profile._id }).session(session);
      await VerificationLog.deleteMany({ workerId: profile._id }).session(session);
      await Notification.deleteMany({
        $or: [{ recipient: worker._id }, { userId: worker._id }]
      }).session(session);
      await WorkerProfile.deleteOne({ _id: profile._id }).session(session);
      await User.deleteOne({ _id: worker._id }).session(session);

      await recordAuditLog(
        {
          adminId,
          action: "WORKER_DELETED",
          entityType: "WORKER",
          entityId: workerUserId,
          metadata: {
            workerProfileId: String(profile._id)
          }
        },
        session
      );

      deleted = true;
    });

    return { deleted };
  } finally {
    await session.endSession();
  }
}

export async function deleteFacilityAccount(adminId: string, facilityUserId: string) {
  await connectDB();

  const session = await mongoose.startSession();

  try {
    let deleted = false;

    await session.withTransaction(async () => {
      const facility = await User.findOne({ _id: facilityUserId, role: "FACILITY" }).session(
        session
      );

      if (!facility) {
        throw new Error("Facility account not found.");
      }

      const profile = await FacilityProfile.findOne({ userId: facility._id }).session(session);

      if (!profile) {
        throw new Error("Facility profile not found.");
      }

      const shifts = await Shift.find({ facilityId: profile._id }).select("_id").session(session);
      const shiftIds = shifts.map((shift) => shift._id);

      if (shiftIds.length) {
        await Assignment.deleteMany({ shiftId: { $in: shiftIds } }).session(session);
        await Application.deleteMany({ shiftId: { $in: shiftIds } }).session(session);
        await PaymentLog.deleteMany({ shiftId: { $in: shiftIds } }).session(session);
        await Shift.deleteMany({ _id: { $in: shiftIds } }).session(session);
      }

      await Notification.deleteMany({
        $or: [{ recipient: facility._id }, { userId: facility._id }]
      }).session(session);
      await FacilityProfile.deleteOne({ _id: profile._id }).session(session);
      await User.deleteOne({ _id: facility._id }).session(session);

      await recordAuditLog(
        {
          adminId,
          action: "FACILITY_DELETED",
          entityType: "FACILITY",
          entityId: facilityUserId,
          metadata: {
            facilityProfileId: String(profile._id),
            shiftCount: shiftIds.length
          }
        },
        session
      );

      deleted = true;
    });

    return { deleted };
  } finally {
    await session.endSession();
  }
}

export async function deleteShiftRecord(adminId: string, shiftId: string) {
  await connectDB();

  const session = await mongoose.startSession();

  try {
    let deleted = false;

    await session.withTransaction(async () => {
      const shift = await Shift.findById(shiftId).session(session);

      if (!shift) {
        throw new Error("Shift not found.");
      }

      await Assignment.deleteMany({ shiftId: shift._id }).session(session);
      await Application.deleteMany({ shiftId: shift._id }).session(session);
      await PaymentLog.deleteMany({ shiftId: shift._id }).session(session);
      await Shift.deleteOne({ _id: shift._id }).session(session);

      await recordAuditLog(
        {
          adminId,
          action: "SHIFT_DELETED",
          entityType: "SHIFT",
          entityId: shiftId,
          metadata: {
            roleRequired: shift.roleRequired,
            date: shift.date?.toISOString?.() ?? ""
          }
        },
        session
      );

      deleted = true;
    });

    return { deleted };
  } finally {
    await session.endSession();
  }
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
        try {
          await createNotification(
            {
              recipient: String(user._id),
              recipientRole: "worker",
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
              type: "verification",
              actionUrl: "/dashboard/worker/verification"
            },
            session
          );
        } catch (error) {
          console.warn("Failed to notify worker about verification decision:", error);
        }
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

      const facilityProfile = await FacilityProfile.findById(shift.facilityId)
        .populate({ path: "userId", select: "firstName lastName email" })
        .session(session);

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
        try {
          await createNotification(
            {
              recipient: String(workerUser._id),
              recipientRole: "worker",
              title: "Shift reassigned to you",
              message: notes?.trim()
                ? `You have been reassigned to a shift. ${notes.trim()}`
                : "You have been reassigned to a shift by an administrator.",
              type: "shift",
              actionUrl: "/dashboard/worker/assignments"
            },
            session
          );
        } catch (error) {
          console.warn("Failed to notify worker about reassigned shift:", error);
        }
      }

      const facilityUser = facilityProfile?.userId as unknown as {
        _id?: mongoose.Types.ObjectId;
      } | null;

      if (facilityUser?._id) {
        try {
          await createNotification(
            {
              recipient: String(facilityUser._id),
              recipientRole: "facility",
              title: "Shift filled",
              message: notes?.trim()
                ? `A verified worker was assigned to ${shift.roleRequired ?? "the shift"}. ${notes.trim()}`
                : `A verified worker was assigned to ${shift.roleRequired ?? "the shift"}.`,
              type: "shift",
              actionUrl: "/dashboard/facility/shifts"
            },
            session
          );
        } catch (error) {
          console.warn("Failed to notify facility about reassigned shift:", error);
        }
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

export async function reviewAdminApplication(
  adminId: string,
  applicationId: string,
  action: "ACCEPT" | "REJECT" | "ASSIGN",
  notes?: string
) {
  await connectDB();

  const session = await mongoose.startSession();

  try {
    let updated = false;

    await session.withTransaction(async () => {
      const application = await Application.findById(applicationId)
        .populate({
          path: "workerId",
          select: "userId verificationStatus isVerified roleType",
          populate: {
            path: "userId",
            select: "firstName lastName email"
          }
        })
        .populate({
          path: "shiftId",
          select: "date startTime endTime roleRequired status facilityId",
          populate: {
            path: "facilityId",
            select: "companyName userId",
            populate: {
              path: "userId",
              select: "firstName lastName email"
            }
          }
        })
        .session(session);

      if (!application) {
        throw new Error("Application not found.");
      }

      const workerProfile = application.workerId as unknown as
        | {
            _id?: mongoose.Types.ObjectId;
            userId?: {
              _id?: mongoose.Types.ObjectId;
              firstName?: string;
              lastName?: string;
              email?: string;
            };
            verificationStatus?: string;
            isVerified?: boolean;
          }
        | null;
      const shift = application.shiftId as unknown as
        | {
            _id?: mongoose.Types.ObjectId;
            roleRequired?: string;
            date?: Date;
            status?: string;
            facilityId?: {
              _id?: mongoose.Types.ObjectId;
              companyName?: string;
              userId?: {
                _id?: mongoose.Types.ObjectId;
                firstName?: string;
                lastName?: string;
                email?: string;
              };
            };
          }
        | null;
      const facilityProfile = shift?.facilityId ?? null;
      const workerUser = workerProfile?.userId ?? null;
      const facilityUser = facilityProfile?.userId ?? null;
      const workerDisplayName =
        `${workerUser?.firstName ?? ""} ${workerUser?.lastName ?? ""}`.trim() ||
        workerUser?.email ||
        "Worker";
      const facilityName = facilityProfile?.companyName ?? "Facility";
      const shiftLabel = shift?.roleRequired ?? "Shift";

      if (action === "ASSIGN") {
        if (!workerProfile) {
          throw new Error("Worker profile not found.");
        }

        if (workerProfile.verificationStatus !== "VERIFIED" || !workerProfile.isVerified) {
          const error = new Error("Worker must be verified before assignment.");
          (error as Error & { statusCode?: number }).statusCode = 400;
          throw error;
        }

        if (!shift) {
          throw new Error("Shift not found.");
        }

        if (!facilityProfile) {
          throw new Error("Facility profile not found.");
        }

        const workerProfileId = workerProfile._id as mongoose.Types.ObjectId;
        const shiftObjectId = shift._id as mongoose.Types.ObjectId;
        const facilityId = facilityProfile._id as mongoose.Types.ObjectId;

        const assignment = await Assignment.findOne({ shiftId: shiftObjectId }).session(session);

        if (assignment) {
          assignment.workerId = workerProfileId;
          assignment.facilityId = facilityId;
          assignment.status = "UPCOMING";
          assignment.assignedAt = new Date();
          await assignment.save({ session });
        } else {
          await Assignment.create(
            [
              {
                workerId: workerProfileId,
                facilityId,
                shiftId: shiftObjectId,
                status: "UPCOMING",
                assignedAt: new Date()
              }
            ],
            { session }
          );
        }

        application.status = "ACCEPTED";
        await application.save({ session });

        shift.status = "FILLED";
        await Shift.updateOne(
          { _id: shiftObjectId },
          { $set: { status: "FILLED" } }
        ).session(session);

        if (workerUser?._id) {
          await createNotification(
            {
              recipient: String(workerUser._id),
              recipientRole: "worker",
              title: "Shift assigned",
              message: notes?.trim()
                ? `You have been assigned to ${shiftLabel}. ${notes.trim()}`
                : `You have been assigned to ${shiftLabel}.`,
              type: "shift",
              actionUrl: "/dashboard/worker/assignments"
            },
            session
          );
        }

        if (facilityUser?._id) {
          await createNotification(
            {
              recipient: String(facilityUser._id),
              recipientRole: "facility",
              title: "Worker assigned",
              message: `${workerDisplayName} has been assigned to ${shiftLabel} at ${facilityName}.`,
              type: "shift",
              actionUrl: "/dashboard/facility/shifts"
            },
            session
          );
        }

        await recordAuditLog(
          {
            adminId,
            action: "APPLICATION_ASSIGNED",
            entityType: "APPLICATION",
            entityId: String(application._id),
            metadata: {
              applicationId: String(application._id),
              shiftId: String(shiftObjectId),
              workerUserId: String(workerUser?._id ?? workerProfileId ?? ""),
              facilityId: String(facilityId),
              notes: notes?.trim() ?? ""
            }
          },
          session
        );
      } else if (action === "ACCEPT") {
        application.status = "ACCEPTED";
        await application.save({ session });

        if (workerUser?._id) {
          await createNotification(
            {
              recipient: String(workerUser._id),
              recipientRole: "worker",
              title: "Application accepted",
              message: notes?.trim()
                ? `Your application for ${shiftLabel} was accepted. ${notes.trim()}`
                : `Your application for ${shiftLabel} was accepted.`,
              type: "application",
              actionUrl: "/dashboard/worker/applications"
            },
            session
          );
        }

        if (facilityUser?._id) {
          await createNotification(
            {
              recipient: String(facilityUser._id),
              recipientRole: "facility",
              title: "Application accepted",
              message: `${workerDisplayName}'s application for ${shiftLabel} was accepted.`,
              type: "application",
              actionUrl: "/dashboard/facility/applicants"
            },
            session
          );
        }

        await recordAuditLog(
          {
            adminId,
            action: "APPLICATION_ACCEPTED",
            entityType: "APPLICATION",
            entityId: String(application._id),
            metadata: {
              applicationId: String(application._id),
              shiftId: String(shift?._id ?? ""),
              workerUserId: String(workerUser?._id ?? workerProfile?._id ?? ""),
              notes: notes?.trim() ?? ""
            }
          },
          session
        );
      } else {
        application.status = "REJECTED";
        await application.save({ session });

        if (workerUser?._id) {
          await createNotification(
            {
              recipient: String(workerUser._id),
              recipientRole: "worker",
              title: "Application rejected",
              message: notes?.trim()
                ? `Your application for ${shiftLabel} was rejected. ${notes.trim()}`
                : `Your application for ${shiftLabel} was rejected.`,
              type: "application",
              actionUrl: "/dashboard/worker/applications"
            },
            session
          );
        }

        await recordAuditLog(
          {
            adminId,
            action: "APPLICATION_REJECTED",
            entityType: "APPLICATION",
            entityId: String(application._id),
            metadata: {
              applicationId: String(application._id),
              shiftId: String(shift?._id ?? ""),
              workerUserId: String(workerUser?._id ?? workerProfile?._id ?? ""),
              notes: notes?.trim() ?? ""
            }
          },
          session
        );
      }

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
