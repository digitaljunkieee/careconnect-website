import type { PipelineStage } from "mongoose";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import WorkerProfile, { type CloudinaryDocument } from "@/models/WorkerProfile";
import Application from "@/models/Application";
import Assignment from "@/models/Assignment";
import Shift from "@/models/Shift";
import VerificationLog from "@/models/VerificationLog";
import type { WorkerRoleType, VerificationStatus } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import { getSkip } from "@/lib/pagination";

type LeanUser = {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
};

type LeanWorkerProfile = {
  _id?: unknown;
  userId: unknown;
  phone?: string;
  addressHistory?: string[] | null;
  niNumber?: string;
  shareCode?: string;
  roleType?: WorkerRoleType;
  verificationStatus?: VerificationStatus;
  isVerified?: boolean;
  cloudinaryDocuments?: CloudinaryDocument[] | null;
  createdAt?: Date;
  updatedAt?: Date;
};

type WorkerDashboardAssignmentItem = {
  _id: unknown;
  status: string;
  shiftId?: {
    date?: Date;
    startTime?: string;
    endTime?: string;
    status?: string;
    facilityId?: { companyName?: string } | null;
  } | null;
};

type WorkerDashboardAvailableShiftItem = {
  _id: unknown;
  facility?: { companyName?: string } | null;
  date?: Date;
  startTime?: string;
  endTime?: string;
  hourlyRate?: number;
  roleRequired?: string;
  notes?: string;
};

type WorkerDashboardApplicationItem = {
  _id: unknown;
  shiftId?: {
    _id: unknown;
    date?: Date;
    startTime?: string;
    endTime?: string;
    hourlyRate?: number;
    roleRequired?: string;
    facilityId?: { companyName?: string } | null;
  } | null;
  status?: string;
  createdAt?: Date;
};

type WorkerShiftBoardItem = {
  _id: unknown;
  facility?: { companyName?: string } | null;
  date?: Date;
  startTime?: string;
  endTime?: string;
  hourlyRate?: number;
  roleRequired?: string;
  notes?: string;
};

type WorkerApplicationItem = {
  _id: unknown;
  shiftId: unknown;
  facility?: { companyName?: string } | null;
  shift?: {
    date?: Date;
    startTime?: string;
    endTime?: string;
    hourlyRate?: number;
    roleRequired?: string;
  } | null;
  status: string;
  createdAt?: Date;
};

type WorkerAssignmentItem = {
  _id: unknown;
  shiftId: unknown;
  facility?: { companyName?: string } | null;
  shift?: {
    date?: Date;
    startTime?: string;
    endTime?: string;
  } | null;
  status: string;
};

export type WorkerProfileData = {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string;
  phone: string;
  addressHistory: string[];
  niNumber: string;
  shareCode: string;
  roleType: WorkerRoleType;
  verificationStatus: VerificationStatus;
  isVerified: boolean;
  cloudinaryDocuments: CloudinaryDocument[];
  createdAt: string;
  updatedAt: string;
};

export type WorkerDashboardData = {
  firstName: string;
  verificationStatus: VerificationStatus;
  isVerified: boolean;
  profileCompletionPercent: number;
  upcomingAssignmentsCount: number;
  totalApplicationsCount: number;
  availableShiftsCount: number;
  availableShifts: WorkerShiftBoardRow[];
  recentApplications: WorkerApplicationRow[];
  upcomingAssignments: Array<{
    id: string;
    facilityName: string;
    date: string;
    startTime: string;
    endTime: string;
    status: string;
  }>;
};

export type VerificationHistoryItem = {
  id: string;
  status: VerificationStatus;
  reportUrl: string;
  submittedAt: string;
  documentName: string;
  resourceType?: string;
};

export type WorkerShiftBoardRow = {
  id: string;
  facilityName: string;
  date: string;
  startTime: string;
  endTime: string;
  hourlyRate: number;
  hourlyRateLabel: string;
  roleRequired: string;
  notes: string;
  alreadyApplied: boolean;
};

export type WorkerApplicationRow = {
  id: string;
  shiftId: string;
  facilityName: string;
  shiftDate: string;
  startTime: string;
  endTime: string;
  hourlyRateLabel: string;
  roleRequired: string;
  status: string;
  appliedAt: string;
};

export type WorkerAssignmentRow = {
  id: string;
  shiftId: string;
  facilityName: string;
  date: string;
  hours: string;
  status: string;
};

function getWorkerProfileCompletionPercent(
  profile: LeanWorkerProfile | null,
  user: LeanUser | null
) {
  const completionChecks = [
    Boolean(user?.avatarUrl?.trim()),
    Boolean(profile?.phone?.trim()),
    Boolean(profile?.niNumber?.trim()),
    Boolean(profile?.addressHistory?.some((entry) => entry.trim())),
    Boolean(profile?.shareCode?.trim()),
    Boolean(profile?.roleType?.trim())
  ];

  return Math.round(
    (completionChecks.filter(Boolean).length / completionChecks.length) * 100
  );
}

function serializeWorkerProfile(
  profile: LeanWorkerProfile,
  user: LeanUser | null
): WorkerProfileData {
  return {
    userId: String(profile.userId),
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    email: user?.email ?? "",
    avatarUrl: user?.avatarUrl ?? "",
    phone: profile.phone ?? "",
    addressHistory: Array.isArray(profile.addressHistory)
      ? profile.addressHistory
      : [],
    niNumber: profile.niNumber ?? "",
    shareCode: profile.shareCode ?? "",
    roleType: profile.roleType ?? "CARE_SUPPORT",
    verificationStatus: profile.verificationStatus ?? "PENDING",
    isVerified: Boolean(profile.isVerified),
    cloudinaryDocuments: Array.isArray(profile.cloudinaryDocuments)
      ? profile.cloudinaryDocuments
      : [],
    createdAt: profile.createdAt?.toISOString?.() ?? new Date().toISOString(),
    updatedAt: profile.updatedAt?.toISOString?.() ?? new Date().toISOString()
  };
}

export async function getWorkerProfileData(userId: string) {
  await connectDB();

  const [user, profile] = (await Promise.all([
    User.findById(userId).lean(),
    WorkerProfile.findOne({ userId }).lean()
  ])) as [LeanUser | null, LeanWorkerProfile | null];

  if (!profile) {
    return null;
  }

  return serializeWorkerProfile(profile, user);
}

export async function getWorkerDashboardData(userId: string): Promise<WorkerDashboardData | null> {
  await connectDB();

  const [user, profile] = (await Promise.all([
    User.findById(userId).lean(),
    WorkerProfile.findOne({ userId }).lean()
  ])) as [LeanUser | null, LeanWorkerProfile | null];

  if (!profile) {
    return null;
  }

  const [upcomingAssignmentsCount, totalApplicationsCount, availableShiftsCount, upcomingAssignmentsRaw, availableShiftsRaw, recentApplicationsRaw, appliedShiftIds] =
    (await Promise.all([
      Assignment.countDocuments({
        workerId: profile._id,
        status: "UPCOMING"
      }),
      Application.countDocuments({
        workerId: profile._id
      }),
      Shift.countDocuments({ status: "OPEN" }),
      Assignment.find({
        workerId: profile._id,
        status: "UPCOMING"
      })
        .sort({ assignedAt: 1 })
        .limit(3)
        .populate({
          path: "shiftId",
          select: "date startTime endTime status facilityId",
          populate: {
            path: "facilityId",
            select: "companyName"
          }
        })
        .lean(),
      Shift.find({ status: "OPEN" })
        .sort({ date: 1, createdAt: 1 })
        .limit(3)
        .populate({
          path: "facilityId",
          select: "companyName"
        })
        .lean(),
      Application.find({ workerId: profile._id })
        .sort({ createdAt: -1 })
        .limit(3)
        .populate({
          path: "shiftId",
          select: "date startTime endTime hourlyRate roleRequired facilityId",
          populate: {
            path: "facilityId",
            select: "companyName"
          }
        })
        .lean(),
      Application.distinct("shiftId", { workerId: profile._id })
    ])) as [
      number,
      number,
      number,
      WorkerDashboardAssignmentItem[],
      WorkerDashboardAvailableShiftItem[],
      WorkerDashboardApplicationItem[],
      unknown[]
    ];

  const appliedShiftIdSet = new Set(appliedShiftIds.map((shiftId) => String(shiftId)));

  return {
    firstName: user?.firstName ?? "",
    verificationStatus: profile.verificationStatus ?? "PENDING",
    isVerified: Boolean(profile.isVerified),
    profileCompletionPercent: getWorkerProfileCompletionPercent(profile, user),
    upcomingAssignmentsCount,
    totalApplicationsCount,
    availableShiftsCount,
    availableShifts: availableShiftsRaw.map((shift) => ({
      id: String(shift._id),
      facilityName: shift.facility?.companyName ?? "Unknown facility",
      date: shift.date ? new Date(shift.date).toISOString() : new Date().toISOString(),
      startTime: shift.startTime ?? "--:--",
      endTime: shift.endTime ?? "--:--",
      hourlyRate: shift.hourlyRate ?? 0,
      hourlyRateLabel: formatCurrency(shift.hourlyRate ?? 0),
      roleRequired: shift.roleRequired ?? "",
      notes: shift.notes ?? "",
      alreadyApplied: appliedShiftIdSet.has(String(shift._id))
    })) as WorkerShiftBoardRow[],
    recentApplications: recentApplicationsRaw.map((application) => ({
      id: String(application._id),
      shiftId: String(application.shiftId?._id ?? ""),
      facilityName: application.shiftId?.facilityId?.companyName ?? "Unknown facility",
      shiftDate: application.shiftId?.date
        ? new Date(application.shiftId.date).toISOString()
        : new Date().toISOString(),
      startTime: application.shiftId?.startTime ?? "--:--",
      endTime: application.shiftId?.endTime ?? "--:--",
      hourlyRateLabel: formatCurrency(application.shiftId?.hourlyRate ?? 0),
      roleRequired: application.shiftId?.roleRequired ?? "Unknown role",
      status: application.status ?? "PENDING",
      appliedAt: application.createdAt?.toISOString?.() ?? new Date().toISOString()
    })) as WorkerApplicationRow[],
    upcomingAssignments: upcomingAssignmentsRaw.map((assignment) => ({
      id: String(assignment._id),
      facilityName:
        assignment.shiftId?.facilityId?.companyName ?? "Unknown facility",
      date: assignment.shiftId?.date
        ? new Date(assignment.shiftId.date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric"
          })
        : "TBA",
      startTime: assignment.shiftId?.startTime ?? "--:--",
      endTime: assignment.shiftId?.endTime ?? "--:--",
      status: assignment.status
    }))
  };
}

export async function getVerificationHistory(userId: string) {
  await connectDB();

  const profile = await WorkerProfile.findOne({ userId }).lean();

  if (!profile) {
    return null;
  }

  const logs = await VerificationLog.find({ workerId: profile._id })
    .sort({ createdAt: -1 })
    .lean();

  const documents = Array.isArray(profile.cloudinaryDocuments)
    ? profile.cloudinaryDocuments
    : [];

  const submittedAt =
    logs[0]?.createdAt?.toISOString?.() ?? profile.updatedAt?.toISOString?.() ?? new Date().toISOString();

  return {
    profile: serializeWorkerProfile(profile, await User.findById(userId).lean()),
    logs: logs.map((log) => ({
      id: String(log._id),
      status: log.status,
      reportUrl: log.reportUrl ?? "",
      submittedAt: log.createdAt?.toISOString?.() ?? new Date().toISOString(),
      documentName:
        (log.payload as Record<string, unknown>)?.documentName?.toString?.() ??
        "Document",
      resourceType:
        (log.payload as Record<string, unknown>)?.resourceType?.toString?.() ??
        undefined
    })),
    documents,
    submittedAt
  };
}

export async function getWorkerShiftBoardData(
  userId: string,
  filters: {
    search: string;
    role: string;
    dateFrom?: string;
    dateTo?: string;
    minRate?: number;
  maxRate?: number;
  page: number;
    pageSize: number;
  }
) {
  await connectDB();

  const profile = await WorkerProfile.findOne({ userId }).lean();
  if (!profile) {
    return null;
  }

  const skip = getSkip(filters.page, filters.pageSize);
  const baseMatch: Record<string, unknown> = { status: "OPEN" };
  const appliedShiftIds = new Set(
    (await Application.distinct("shiftId", { workerId: profile._id })).map((shiftId) =>
      String(shiftId)
    )
  );

  if (filters.role) {
    baseMatch.roleRequired = { $regex: new RegExp(filters.role, "i") };
  }

  if (filters.dateFrom || filters.dateTo) {
    const dateFilter: Record<string, Date> = {};

    if (filters.dateFrom) {
      dateFilter.$gte = new Date(filters.dateFrom);
    }

    if (filters.dateTo) {
      dateFilter.$lte = new Date(filters.dateTo);
    }

    baseMatch.date = dateFilter;
  }

  if (typeof filters.minRate === "number" || typeof filters.maxRate === "number") {
    const rateFilter: Record<string, number> = {};
    if (typeof filters.minRate === "number") {
      rateFilter.$gte = filters.minRate;
    }
    if (typeof filters.maxRate === "number") {
      rateFilter.$lte = filters.maxRate;
    }
    baseMatch.hourlyRate = rateFilter;
  }

  const searchRegex = filters.search
    ? new RegExp(filters.search, "i")
    : null;

  const pipeline: PipelineStage[] = [
    { $match: baseMatch },
    {
      $lookup: {
        from: "facilityprofiles",
        localField: "facilityId",
        foreignField: "_id",
        as: "facility"
      }
    },
    { $unwind: "$facility" },
    ...(searchRegex
      ? [
          {
            $match: {
              $or: [
                { roleRequired: searchRegex },
                { notes: searchRegex },
                { "facility.companyName": searchRegex }
              ]
            }
          }
        ]
      : []),
    { $sort: { date: 1, startTime: 1, _id: 1 } },
    {
      $facet: {
        items: [{ $skip: skip }, { $limit: filters.pageSize }],
        total: [{ $count: "count" }]
      }
    }
  ];

  const [result] = (await Shift.aggregate(pipeline)) as [
    { items?: WorkerShiftBoardItem[]; total?: Array<{ count?: number }> }
  ];
  const total = result?.total?.[0]?.count ?? 0;
  const items = result?.items ?? [];

  return {
    rows: items.map((item) => ({
      id: String(item._id),
      facilityName: item.facility?.companyName ?? "Unknown facility",
      date: item.date ? new Date(item.date).toISOString() : new Date().toISOString(),
      startTime: item.startTime,
      endTime: item.endTime,
      hourlyRate: item.hourlyRate ?? 0,
      hourlyRateLabel: formatCurrency(item.hourlyRate ?? 0),
      roleRequired: item.roleRequired ?? "",
      notes: item.notes ?? "",
      alreadyApplied: appliedShiftIds.has(String(item._id))
    })) as WorkerShiftBoardRow[],
    total,
    page: filters.page,
    pageSize: filters.pageSize,
    pageCount: Math.max(Math.ceil(total / filters.pageSize), 1)
  };
}

export async function getWorkerApplicationsData(userId: string, filters: { page: number; pageSize: number; status?: string }) {
  await connectDB();

  const profile = await WorkerProfile.findOne({ userId }).lean();
  if (!profile) {
    return null;
  }

  const match: Record<string, unknown> = { workerId: profile._id };
  if (filters.status) {
    match.status = filters.status;
  }

  const skip = getSkip(filters.page, filters.pageSize);

  const [result] = (await Application.aggregate([
    { $match: match },
    {
      $lookup: {
        from: "shifts",
        localField: "shiftId",
        foreignField: "_id",
        as: "shift"
      }
    },
    { $unwind: "$shift" },
    {
      $lookup: {
        from: "facilityprofiles",
        localField: "shift.facilityId",
        foreignField: "_id",
        as: "facility"
      }
    },
    { $unwind: { path: "$facility", preserveNullAndEmptyArrays: true } },
    { $sort: { createdAt: -1 } },
    {
      $facet: {
        items: [{ $skip: skip }, { $limit: filters.pageSize }],
        total: [{ $count: "count" }]
      }
    }
  ])) as [{ items?: WorkerApplicationItem[]; total?: Array<{ count?: number }> }];

  const total = result?.total?.[0]?.count ?? 0;
  const items = result?.items ?? [];

  return {
    rows: items.map((item) => ({
      id: String(item._id),
      shiftId: String(item.shiftId),
      facilityName: item.facility?.companyName ?? "Unknown facility",
      shiftDate: item.shift?.date ? new Date(item.shift.date).toISOString() : new Date().toISOString(),
      startTime: item.shift?.startTime ?? "--:--",
      endTime: item.shift?.endTime ?? "--:--",
      hourlyRateLabel: formatCurrency(item.shift?.hourlyRate ?? 0),
      roleRequired: item.shift?.roleRequired ?? "Unknown role",
      status: item.status,
      appliedAt: item.createdAt?.toISOString?.() ?? new Date().toISOString()
    })) as WorkerApplicationRow[],
    total,
    page: filters.page,
    pageSize: filters.pageSize,
    pageCount: Math.max(Math.ceil(total / filters.pageSize), 1)
  };
}

export async function getWorkerAssignmentsData(userId: string) {
  await connectDB();

  const profile = await WorkerProfile.findOne({ userId }).lean();
  if (!profile) {
    return null;
  }

  const [upcoming, completed] = (await Promise.all([
    Assignment.aggregate([
      { $match: { workerId: profile._id, status: "UPCOMING" } },
      {
        $lookup: {
          from: "shifts",
          localField: "shiftId",
          foreignField: "_id",
          as: "shift"
        }
      },
      { $unwind: "$shift" },
      {
        $lookup: {
          from: "facilityprofiles",
          localField: "facilityId",
          foreignField: "_id",
          as: "facility"
        }
      },
      { $unwind: { path: "$facility", preserveNullAndEmptyArrays: true } },
      { $sort: { "shift.date": 1 } }
    ]),
    Assignment.aggregate([
      { $match: { workerId: profile._id, status: "COMPLETED" } },
      {
        $lookup: {
          from: "shifts",
          localField: "shiftId",
          foreignField: "_id",
          as: "shift"
        }
      },
      { $unwind: "$shift" },
      {
        $lookup: {
          from: "facilityprofiles",
          localField: "facilityId",
          foreignField: "_id",
          as: "facility"
        }
      },
      { $unwind: { path: "$facility", preserveNullAndEmptyArrays: true } },
      { $sort: { "shift.date": -1 } }
    ])
  ])) as [WorkerAssignmentItem[], WorkerAssignmentItem[]];

  const mapAssignment = (assignment: WorkerAssignmentItem): WorkerAssignmentRow => ({
    id: String(assignment._id),
    shiftId: String(assignment.shiftId),
    facilityName: assignment.facility?.companyName ?? "Unknown facility",
    date: assignment.shift?.date
      ? new Date(assignment.shift.date).toISOString()
      : new Date().toISOString(),
    hours: `${assignment.shift?.startTime ?? "--:--"} - ${assignment.shift?.endTime ?? "--:--"}`,
    status: assignment.status
  });

  return {
    upcoming: upcoming.map(mapAssignment),
    completed: completed.map(mapAssignment)
  };
}

export { applyWorkerToShift } from "@/lib/workflows";
