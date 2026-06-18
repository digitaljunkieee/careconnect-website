import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import WorkerProfile from "@/models/WorkerProfile";
import FacilityProfile from "@/models/FacilityProfile";
import Shift from "@/models/Shift";
import Application from "@/models/Application";
import Assignment from "@/models/Assignment";
import VerificationLog from "@/models/VerificationLog";
import {
  formatDate,
  formatName
} from "@/lib/format";
import { uploadWorkerDocument } from "@/lib/cloudinary";
import {
  notifyAdmins,
  notifyFacilityNewApplication,
  notifyWorkerApplicationDecision,
  notifyWorkerApplicationSubmitted
} from "@/lib/notifications";
import {
  createEbcApplicant,
  submitEbcWorkerDetails
} from "@/lib/integrations/ebc";
import { enqueueEmail } from "@/lib/integrations/email-queue";
import type { ShiftStatus, WorkerRoleType } from "@/lib/constants";
import { getAppBaseUrl } from "@/lib/app-url";

function splitAddressHistory(value: string) {
  return value
    .split(/\r?\n|,/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function normalizeShiftDate(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid shift date.");
  }
  return date;
}

export async function saveWorkerProfile(
  userId: string,
  input: {
    phone?: string;
    addressHistory?: string;
    niNumber?: string;
    shareCode?: string;
    roleType: WorkerRoleType;
  }
) {
  await connectDB();

  const profile = await WorkerProfile.findOneAndUpdate(
    { userId },
    {
      $setOnInsert: {
        userId
      },
      $set: {
        phone: input.phone?.trim() ?? "",
        addressHistory: splitAddressHistory(input.addressHistory ?? ""),
        niNumber: input.niNumber?.trim() ?? "",
        shareCode: input.shareCode?.trim() ?? "",
        roleType: input.roleType
      }
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();

  return profile;
}

export async function saveFacilityProfile(
  userId: string,
  input: {
    companyName: string;
    address?: string;
    contactNumber?: string;
    website?: string;
    facilityType?: string;
    description?: string;
  }
) {
  await connectDB();

  const profile = await FacilityProfile.findOneAndUpdate(
    { userId },
    {
      $setOnInsert: {
        userId
      },
      $set: {
        companyName: input.companyName.trim(),
        address: input.address?.trim() ?? "",
        contactNumber: input.contactNumber?.trim() ?? "",
        website: input.website?.trim() ?? "",
        facilityType: input.facilityType?.trim() ?? "",
        description: input.description?.trim() ?? ""
      }
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();

  return profile;
}

export async function uploadWorkerVerificationDocument(
  userId: string,
  file: File,
  documentName: string
) {
  await connectDB();

  const profile = await WorkerProfile.findOne({ userId });

  if (!profile) {
    throw new Error("Worker profile not found.");
  }

  const upload = await uploadWorkerDocument(file);
  const uploadedAt = new Date();
  const expiresAt = new Date(uploadedAt);
  expiresAt.setDate(expiresAt.getDate() + 365);

  const documentRecord = {
    publicId: upload.public_id,
    secureUrl: upload.secure_url,
    resourceType: upload.resource_type,
    name: documentName.trim() || file.name,
    uploadedAt,
    expiresAt
  };

  const latestVerificationLog = await VerificationLog.findOne({ workerId: profile._id })
    .sort({ createdAt: -1 })
    .lean();
  const hasActiveVerification =
    latestVerificationLog &&
    ["PENDING", "IN_REVIEW"].includes(latestVerificationLog.status);

  profile.cloudinaryDocuments.push(documentRecord);
  profile.verificationStatus = "PENDING";
  profile.isVerified = false;
  await profile.save();

  let verificationLogId = String(latestVerificationLog?._id ?? "");
  let ebcApplicantId = String(latestVerificationLog?.ebcApplicantId ?? "");

  if (!hasActiveVerification || !verificationLogId || !ebcApplicantId) {
    const [user] = await Promise.all([
      User.findById(userId).lean()
    ]);

    const ebcApplicant = await createEbcApplicant({
      workerProfileId: String(profile._id),
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? profile.phone ?? "",
      niNumber: profile.niNumber ?? "",
      shareCode: profile.shareCode ?? "",
      roleType: profile.roleType ?? "CARE_SUPPORT",
      addressHistory: profile.addressHistory ?? [],
      documents: [
        {
          name: documentRecord.name,
          publicId: documentRecord.publicId ?? "",
          secureUrl: documentRecord.secureUrl ?? "",
          resourceType: documentRecord.resourceType ?? "auto"
        }
      ]
    });

    const ebcSubmission = await submitEbcWorkerDetails(ebcApplicant.applicantId, {
      workerProfileId: String(profile._id),
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? profile.phone ?? "",
      niNumber: profile.niNumber ?? "",
      shareCode: profile.shareCode ?? "",
      roleType: profile.roleType ?? "CARE_SUPPORT",
      addressHistory: profile.addressHistory ?? [],
      documents: [
        {
          name: documentRecord.name,
          publicId: documentRecord.publicId ?? "",
          secureUrl: documentRecord.secureUrl ?? "",
          resourceType: documentRecord.resourceType ?? "auto"
        }
      ]
    });

    const verificationLog = await VerificationLog.create({
      workerId: profile._id,
      ebcApplicantId: ebcApplicant.applicantId,
      status: "PENDING",
      reportUrl: upload.secure_url,
      payload: {
        documentName: documentRecord.name,
        publicId: upload.public_id,
        secureUrl: upload.secure_url,
        resourceType: upload.resource_type,
        fileName: file.name,
        bytes: upload.bytes,
        ebcApplicant,
        ebcSubmission
      }
    });

    verificationLogId = String(verificationLog._id);
    ebcApplicantId = ebcApplicant.applicantId;

    try {
      await enqueueEmail({
        recipients: [
          {
            email: user?.email ?? "",
            name: formatName(user?.firstName, user?.lastName) || user?.email || "Worker"
          }
        ].filter((recipient) => Boolean(recipient.email)),
        template: "VERIFICATION_SUBMITTED",
        payload: {
          firstName: user?.firstName ?? "",
          lastName: user?.lastName ?? "",
          workerDashboardUrl: `${getAppBaseUrl()}/dashboard/worker`
        }
      });
    } catch (error) {
      console.warn("Failed to queue verification submitted email:", error);
    }

    try {
      await notifyAdmins({
        title: "Worker verification submitted",
        message: `A worker submitted verification documents and the request is now pending review.`,
        type: "INFO"
      });
    } catch (error) {
      console.warn("Failed to notify admins about verification submission:", error);
    }
  } else {
    const verificationLog = await VerificationLog.findById(latestVerificationLog._id);
    if (verificationLog) {
      verificationLog.reportUrl = upload.secure_url;
      verificationLog.payload = {
        ...(verificationLog.payload as Record<string, unknown>),
        documentName: documentRecord.name,
        publicId: upload.public_id,
        secureUrl: upload.secure_url,
        resourceType: upload.resource_type,
        fileName: file.name,
        bytes: upload.bytes
      };
      await verificationLog.save();
    }
  }

  return {
    document: documentRecord,
    upload,
    verificationLogId,
    ebcApplicantId,
    duplicateSubmission: hasActiveVerification
  };
}

export async function createShiftForFacility(
  userId: string,
  input: {
    date: string;
    startTime: string;
    endTime: string;
    hourlyRate: number;
    roleRequired: string;
    notes?: string;
  }
) {
  await connectDB();

  const profile = await FacilityProfile.findOne({ userId }).lean();
  if (!profile) {
    throw new Error("Facility profile not found.");
  }

  const shift = await Shift.create({
    facilityId: profile._id,
    date: normalizeShiftDate(input.date),
    startTime: input.startTime,
    endTime: input.endTime,
    hourlyRate: input.hourlyRate,
    roleRequired: input.roleRequired.trim(),
    notes: input.notes?.trim() ?? "",
    status: "OPEN"
  });

  return shift.toObject();
}

export async function updateShiftForFacility(
  userId: string,
  shiftId: string,
  input: {
    date: string;
    startTime: string;
    endTime: string;
    hourlyRate: number;
    roleRequired: string;
    notes?: string;
    status?: ShiftStatus;
  }
) {
  await connectDB();

  const profile = await FacilityProfile.findOne({ userId }).lean();
  if (!profile) {
    throw new Error("Facility profile not found.");
  }

  const shift = await Shift.findOneAndUpdate(
    { _id: shiftId, facilityId: profile._id },
    {
      $set: {
        date: normalizeShiftDate(input.date),
        startTime: input.startTime,
        endTime: input.endTime,
        hourlyRate: input.hourlyRate,
        roleRequired: input.roleRequired.trim(),
        notes: input.notes?.trim() ?? "",
        ...(input.status ? { status: input.status } : {})
      }
    },
    { new: true }
  ).lean();

  if (!shift) {
    throw new Error("Shift not found.");
  }

  return shift;
}

export async function setShiftStatusForFacility(
  userId: string,
  shiftId: string,
  status: Exclude<ShiftStatus, "DRAFT">
) {
  await connectDB();

  const profile = await FacilityProfile.findOne({ userId }).lean();
  if (!profile) {
    throw new Error("Facility profile not found.");
  }

  const shift = await Shift.findOneAndUpdate(
    { _id: shiftId, facilityId: profile._id },
    { $set: { status } },
    { new: true }
  ).lean();

  if (!shift) {
    throw new Error("Shift not found.");
  }

  return shift;
}

export async function deleteShiftForFacility(userId: string, shiftId: string) {
  await connectDB();

  const profile = await FacilityProfile.findOne({ userId }).lean();
  if (!profile) {
    throw new Error("Facility profile not found.");
  }

  const session = await mongoose.startSession();
  try {
    let deleted = false;

    await session.withTransaction(async () => {
      const shift = await Shift.findOneAndDelete({
        _id: shiftId,
        facilityId: profile._id
      }).session(session);

      if (!shift) {
        throw new Error("Shift not found.");
      }

      deleted = true;

      await Application.deleteMany({ shiftId: shift._id }).session(session);
      await Assignment.deleteMany({ shiftId: shift._id }).session(session);
    });

    return { deleted };
  } finally {
    await session.endSession();
  }
}

export async function applyWorkerToShift(userId: string, shiftId: string) {
  await connectDB();

  const workerProfile = await WorkerProfile.findOne({ userId }).lean();
  if (!workerProfile) {
    throw new Error("Worker profile not found.");
  }

  if (workerProfile.verificationStatus !== "VERIFIED" || !workerProfile.isVerified) {
    const error = new Error("Only verified workers can apply to shifts.");
    (error as Error & { statusCode?: number }).statusCode = 403;
    throw error;
  }

  const shift = await Shift.findById(shiftId)
    .populate({ path: "facilityId", select: "companyName userId" })
    .lean();

  if (!shift) {
    throw new Error("Shift not found.");
  }

  if (shift.status !== "OPEN") {
    const error = new Error("This shift is no longer open.");
    (error as Error & { statusCode?: number }).statusCode = 409;
    throw error;
  }

  const duplicate = await Application.findOne({
    workerId: workerProfile._id,
    shiftId: shift._id
  }).lean();

  if (duplicate) {
    const error = new Error("You have already applied to this shift.");
    (error as Error & { statusCode?: number }).statusCode = 409;
    throw error;
  }

  const workerContact = await User.findById(userId).lean();

  const session = await mongoose.startSession();
  const shiftTitle = `${shift.roleRequired} on ${formatDate(shift.date)}`;

  try {
    let applicationId = "";

    await session.withTransaction(async () => {
      const [application] = await Application.create(
        [
          {
            workerId: workerProfile._id,
            shiftId: shift._id,
            status: "PENDING"
          }
        ],
        { session }
      );

      applicationId = String(application._id);

      const facilityUserId = String((shift.facilityId as { userId?: unknown }).userId ?? "");
      const workerName =
        formatName(workerContact?.firstName, workerContact?.lastName) ||
        workerContact?.email ||
        "A worker";

      await notifyWorkerApplicationSubmitted(
        String(workerProfile.userId),
        shiftTitle,
        session
      );

      if (facilityUserId) {
        await notifyFacilityNewApplication(
          facilityUserId,
          shiftTitle,
          workerName,
          session
        );
      }
    });

    if (workerContact?.email) {
      try {
        await enqueueEmail({
          recipients: [
            {
              email: workerContact.email,
              name:
                formatName(workerContact.firstName, workerContact.lastName) ||
                workerContact.email
            }
          ],
          template: "APPLICATION_SUBMITTED",
          payload: {
            firstName: workerContact.firstName ?? "",
            lastName: workerContact.lastName ?? "",
            shiftTitle,
            applicationUrl: `${getAppBaseUrl()}/dashboard/worker/applications`
          }
        });
      } catch (error) {
        console.warn("Failed to queue application submitted email:", error);
      }
    }

    return {
      applicationId,
      shiftId: String(shift._id)
    };
  } finally {
    await session.endSession();
  }
}

export async function decideShiftApplication(
  userId: string,
  applicationId: string,
  action: "ACCEPT" | "REJECT"
) {
  await connectDB();

  const facilityProfile = await FacilityProfile.findOne({ userId }).lean();
  if (!facilityProfile) {
    throw new Error("Facility profile not found.");
  }

  const application = await Application.findById(applicationId).lean();
  if (!application) {
    throw new Error("Application not found.");
  }

  const shift = await Shift.findOne({
    _id: application.shiftId,
    facilityId: facilityProfile._id
  }).lean();

  if (!shift) {
    throw new Error("Shift not found.");
  }

  const workerProfile = await WorkerProfile.findById(application.workerId).lean();
  if (!workerProfile) {
    throw new Error("Worker profile not found.");
  }

  const workerContact = await User.findById(workerProfile.userId).lean();

  const session = await mongoose.startSession();
  try {
    let decisionResult:
      | { status: "ACCEPTED" | "REJECTED"; applicationId: string; shiftId: string }
      | null = null;

    await session.withTransaction(async () => {
      const currentApplication = await Application.findById(applicationId).session(session);
      if (!currentApplication) {
        throw new Error("Application not found.");
      }

      const existingAccepted = await Application.findOne({
        shiftId: shift._id,
        status: "ACCEPTED",
        _id: { $ne: currentApplication._id }
      }).session(session);

      if (existingAccepted && action === "ACCEPT") {
        throw new Error("This shift already has an accepted worker.");
      }

      if (action === "ACCEPT") {
        if (shift.status === "FILLED") {
          throw new Error("This shift has already been filled.");
        }

        currentApplication.status = "ACCEPTED";
        await currentApplication.save({ session });

        await Shift.findByIdAndUpdate(
          shift._id,
          { $set: { status: "FILLED" } },
          { session }
        );

        const otherApplications = await Application.find({
          shiftId: shift._id,
          _id: { $ne: currentApplication._id }
        })
          .select("workerId")
          .session(session);

        if (otherApplications.length) {
          await Application.updateMany(
            {
              shiftId: shift._id,
              _id: { $ne: currentApplication._id }
            },
            { $set: { status: "REJECTED" } },
            { session }
          );
        }

        await Assignment.create(
          [
            {
              workerId: currentApplication.workerId,
              facilityId: facilityProfile._id,
              shiftId: shift._id,
              status: "UPCOMING",
              assignedAt: new Date()
            }
          ],
          { session }
        );

        await notifyWorkerApplicationDecision(
          String(workerProfile.userId),
          `${shift.roleRequired} on ${formatDate(shift.date)}`,
          "ACCEPTED",
          session
        );

        const otherWorkerProfiles = await WorkerProfile.find({
          _id: { $in: otherApplications.map((app) => app.workerId) }
        })
          .select("userId")
          .session(session);

        await Promise.all(
          otherWorkerProfiles.map((profile) =>
            notifyWorkerApplicationDecision(
              String(profile.userId),
              `${shift.roleRequired} on ${formatDate(shift.date)}`,
              "REJECTED",
              session
            )
          )
        );

        decisionResult = {
          status: "ACCEPTED",
          applicationId: String(currentApplication._id),
          shiftId: String(shift._id)
        };
      } else {
        currentApplication.status = "REJECTED";
        await currentApplication.save({ session });

        await notifyWorkerApplicationDecision(
          String(workerProfile.userId),
          `${shift.roleRequired} on ${formatDate(shift.date)}`,
          "REJECTED",
          session
        );

        decisionResult = {
          status: "REJECTED",
          applicationId: String(currentApplication._id),
          shiftId: String(shift._id)
        };
      }
    });

    if (!decisionResult) {
      throw new Error("Unable to complete application decision.");
    }

    if (workerContact?.email) {
      try {
        await enqueueEmail({
          recipients: [
            {
              email: workerContact.email,
              name:
                formatName(workerContact.firstName, workerContact.lastName) ||
                workerContact.email
            }
          ],
          template:
            action === "ACCEPT"
              ? "APPLICATION_ACCEPTED"
              : "APPLICATION_REJECTED",
          payload: {
            firstName: workerContact.firstName ?? "",
            lastName: workerContact.lastName ?? "",
            shiftTitle: `${shift.roleRequired} on ${formatDate(shift.date)}`,
            shiftUrl: `${getAppBaseUrl()}/dashboard/worker/assignments`,
            notes: action === "REJECT" ? "" : ""
          }
        });
      } catch (error) {
        console.warn("Failed to queue application decision email:", error);
      }
    }

    return decisionResult;
  } finally {
    await session.endSession();
  }
}
