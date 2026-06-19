import type { PipelineStage } from "mongoose";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import WorkerProfile, { type CloudinaryDocument } from "@/models/WorkerProfile";
import FacilityProfile from "@/models/FacilityProfile";
import Shift from "@/models/Shift";
import Application from "@/models/Application";
import Assignment from "@/models/Assignment";
import VerificationLog from "@/models/VerificationLog";
import PaymentLog from "@/models/PaymentLog";
import type {
  ApplicationStatus,
  ShiftStatus,
  VerificationStatus,
  WorkerRoleType
} from "@/lib/constants";
import { formatDate, formatName } from "@/lib/format";
import { getSkip } from "@/lib/pagination";

type LeanUser = {
  _id: unknown;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  notificationPreferences?: {
    email?: boolean;
    inApp?: boolean;
    sms?: boolean;
    weeklyDigest?: boolean;
  };
};

type LeanWorkerProfile = {
  _id: unknown;
  userId: unknown;
  phone?: string;
  addressHistory?: string[];
  niNumber?: string;
  shareCode?: string;
  roleType?: WorkerRoleType;
  verificationStatus?: VerificationStatus;
  isVerified?: boolean;
  cloudinaryDocuments?: CloudinaryDocument[];
  createdAt?: Date;
  updatedAt?: Date;
};

type LeanFacilityProfile = {
  _id: unknown;
  userId: unknown;
  companyName?: string;
  address?: string;
  contactNumber?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

type LeanShift = {
  _id: unknown;
  facilityId?: unknown;
  date?: Date;
  startTime?: string;
  endTime?: string;
  hourlyRate?: number;
  roleRequired?: string;
  notes?: string;
  status?: ShiftStatus;
  createdAt?: Date;
  updatedAt?: Date;
};

type LeanApplication = {
  _id: unknown;
  workerId?: unknown;
  shiftId?: unknown;
  status?: ApplicationStatus;
  createdAt?: Date;
  updatedAt?: Date;
  workerProfile?: LeanWorkerProfile | null;
  workerUser?: LeanUser | null;
  shift?: LeanShift | null;
  facility?: LeanFacilityProfile | null;
};

type LeanAssignment = {
  _id: unknown;
  workerId?: unknown;
  facilityId?: unknown;
  shiftId?: unknown;
  status?: string;
  assignedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  shift?: LeanShift | null;
  facility?: LeanFacilityProfile | null;
  workerProfile?: LeanWorkerProfile | null;
  workerUser?: LeanUser | null;
};

type LeanVerificationLog = {
  _id: unknown;
  workerId?: unknown;
  status?: VerificationStatus;
  reportUrl?: string;
  payload?: Record<string, unknown>;
  adminId?: unknown;
  adminNotes?: string;
  decisionAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export type AdminDashboardData = {
  stats: {
    totalWorkers: number;
    verifiedWorkers: number;
    pendingVerifications: number;
    totalFacilities: number;
    openShifts: number;
    filledShifts: number;
    totalApplications: number;
    applicationsToday: number;
    totalRevenue: number;
    pendingPayments: number;
  };
  recentWorkerRegistrations: Array<{
    id: string;
    name: string;
    email: string;
    verificationStatus: VerificationStatus;
    isActive: boolean;
    registeredAt: string;
  }>;
  recentFacilityRegistrations: Array<{
    id: string;
    companyName: string;
    contactPerson: string;
    email: string;
    isActive: boolean;
    registeredAt: string;
  }>;
  recentApplications: Array<{
    id: string;
    workerName: string;
    facilityName: string;
    shiftLabel: string;
    status: ApplicationStatus;
    submittedAt: string;
  }>;
  pendingVerificationQueue: Array<{
    id: string;
    workerName: string;
    verificationStatus: VerificationStatus;
    documentCount: number;
    submittedAt: string;
  }>;
};

export type AdminWorkerRow = {
  id: string;
  profileId: string;
  fullName: string;
  email: string;
  phone: string;
  roleType: WorkerRoleType;
  verificationStatus: VerificationStatus;
  isActive: boolean;
  applications: number;
  registrationDate: string;
};

export type AdminVerificationRow = {
  id: string;
  workerId: string;
  workerUserId: string;
  workerName: string;
  submissionDate: string;
  currentStatus: VerificationStatus;
  documentCount: number;
  latestLogId?: string;
};

export type AdminFacilityRow = {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  openShifts: number;
  totalShifts: number;
  isActive: boolean;
  registrationDate: string;
};

export type AdminWorkerDetailData = {
  user: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    isActive: boolean;
    registrationDate: string;
  };
  profile: {
    id: string;
    phone: string;
    addressHistory: string[];
    niNumber: string;
    shareCode: string;
    roleType: WorkerRoleType;
    verificationStatus: VerificationStatus;
    isVerified: boolean;
    documents: CloudinaryDocument[];
    updatedAt: string;
  };
  verification: {
    submittedAt: string;
    currentStatus: VerificationStatus;
    logs: Array<{
      id: string;
      status: VerificationStatus;
      reportUrl: string;
      documentName: string;
      resourceType?: string;
      adminNotes: string;
      decisionAt?: string;
      submittedAt: string;
    }>;
  };
  assignments: {
    upcoming: Array<{
      id: string;
      facilityName: string;
      date: string;
      hours: string;
      status: string;
    }>;
    completed: Array<{
      id: string;
      facilityName: string;
      date: string;
      hours: string;
      status: string;
    }>;
  };
  applications: Array<{
    id: string;
    facilityName: string;
    shiftDate: string;
    shiftLabel: string;
    status: ApplicationStatus;
    submittedAt: string;
  }>;
};

export type AdminFacilityDetailData = {
  company: {
    id: string;
    companyName: string;
    address: string;
    contactNumber: string;
    contactPerson: string;
    email: string;
    isActive: boolean;
    registrationDate: string;
  };
  stats: {
    totalShifts: number;
    filledShifts: number;
    openShifts: number;
    totalApplications: number;
  };
  workersUsed: Array<{
    id: string;
    workerName: string;
    roleType: WorkerRoleType;
    assignmentCount: number;
  }>;
  applications: Array<{
    id: string;
    workerName: string;
    shiftLabel: string;
    status: ApplicationStatus;
    submittedAt: string;
  }>;
  shifts: Array<{
    id: string;
    date: string;
    roleRequired: string;
    status: ShiftStatus;
  }>;
};

export type AdminVerificationQueueData = {
  rows: AdminVerificationRow[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export type AdminWorkerListData = {
  rows: AdminWorkerRow[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export type AdminFacilityListData = {
  rows: AdminFacilityRow[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

function toIso(value?: Date | null) {
  return value?.toISOString?.() ?? new Date().toISOString();
}

function normalizeName(user?: Pick<LeanUser, "firstName" | "lastName" | "email"> | null) {
  return formatName(user?.firstName, user?.lastName) || user?.email || "";
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  await connectDB();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    totalWorkers,
    verifiedWorkers,
    pendingVerifications,
    totalFacilities,
    openShifts,
    filledShifts,
    totalApplications,
    applicationsToday,
    revenueAggregate,
    pendingPayments,
    recentWorkers,
    recentFacilities,
    recentApplications,
    pendingQueue
  ] = await Promise.all([
    User.countDocuments({ role: "WORKER" }),
    WorkerProfile.countDocuments({
      verificationStatus: "VERIFIED",
      isVerified: true
    }),
    WorkerProfile.countDocuments({
      verificationStatus: { $in: ["PENDING", "IN_REVIEW"] }
    }),
    User.countDocuments({ role: "FACILITY" }),
    Shift.countDocuments({ status: "OPEN" }),
    Shift.countDocuments({ status: "FILLED" }),
    Application.countDocuments(),
    Application.countDocuments({
      createdAt: { $gte: todayStart }
    }),
    PaymentLog.aggregate([{ $match: { status: "PAID" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
    PaymentLog.countDocuments({ status: "PENDING" }),
    User.aggregate([
      { $match: { role: "WORKER" } },
      {
        $lookup: {
          from: "workerprofiles",
          localField: "_id",
          foreignField: "userId",
          as: "workerProfile"
        }
      },
      { $unwind: { path: "$workerProfile", preserveNullAndEmptyArrays: true } },
      { $sort: { createdAt: -1 } },
      { $limit: 5 }
    ]),
    User.aggregate([
      { $match: { role: "FACILITY" } },
      {
        $lookup: {
          from: "facilityprofiles",
          localField: "_id",
          foreignField: "userId",
          as: "facilityProfile"
        }
      },
      { $unwind: { path: "$facilityProfile", preserveNullAndEmptyArrays: true } },
      { $sort: { createdAt: -1 } },
      { $limit: 5 }
    ]),
    Application.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({
        path: "workerId",
        select: "phone roleType userId",
        populate: {
          path: "userId",
          select: "firstName lastName email"
        }
      })
      .populate({
        path: "shiftId",
        select: "date roleRequired facilityId",
        populate: {
          path: "facilityId",
          select: "companyName"
        }
      })
      .lean(),
    VerificationLog.find({
      status: { $in: ["PENDING", "IN_REVIEW"] }
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({
        path: "workerId",
        select: "verificationStatus cloudinaryDocuments userId",
        populate: {
          path: "userId",
          select: "firstName lastName email"
        }
      })
      .lean()
  ]) as [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    Array<{ total?: number }>,
    number,
    Array<LeanUser & { workerProfile?: LeanWorkerProfile }>,
    Array<LeanUser & { facilityProfile?: LeanFacilityProfile }>,
    LeanApplication[],
    LeanVerificationLog[]
  ];

  const totalRevenue = revenueAggregate[0]?.total ?? 0;

  return {
    stats: {
      totalWorkers,
      verifiedWorkers,
      pendingVerifications,
      totalFacilities,
      openShifts,
      filledShifts,
      totalApplications,
      applicationsToday,
      totalRevenue,
      pendingPayments
    },
    recentWorkerRegistrations: recentWorkers.map((user) => {
      const workerProfile = user.workerProfile;
      return {
        id: String(user._id),
        name: normalizeName(user),
        email: user.email ?? "",
        verificationStatus: workerProfile?.verificationStatus ?? "PENDING",
        isActive: Boolean(user.isActive),
        registeredAt: toIso(user.createdAt)
      };
    }),
    recentFacilityRegistrations: recentFacilities.map((user) => {
      const facilityProfile = user.facilityProfile;
      return {
        id: String(user._id),
        companyName: facilityProfile?.companyName ?? `${normalizeName(user)} Facility`,
        contactPerson: normalizeName(user),
        email: user.email ?? "",
        isActive: Boolean(user.isActive),
        registeredAt: toIso(user.createdAt)
      };
    }),
    recentApplications: recentApplications.map((application) => {
      const workerProfile = application.workerId as unknown as LeanWorkerProfile | null;
      const workerUser = workerProfile?.userId as unknown as LeanUser | null;
      const shift = application.shiftId as unknown as LeanShift | null;
      const facility = shift?.facilityId as unknown as LeanFacilityProfile | null;

      return {
        id: String(application._id),
        workerName: normalizeName(workerUser),
        facilityName: facility?.companyName ?? "Unknown facility",
        shiftLabel: `${shift?.roleRequired ?? "Shift"} - ${shift?.date ? formatDate(shift.date) : "TBA"}`,
        status: application.status ?? "PENDING",
        submittedAt: toIso(application.createdAt)
      };
    }),
    pendingVerificationQueue: pendingQueue.map((log) => {
      const workerProfile = log.workerId as unknown as LeanWorkerProfile | null;
      const workerUser = workerProfile?.userId as unknown as LeanUser | null;
      const documents = workerProfile?.cloudinaryDocuments ?? [];

      return {
        id: String(workerProfile?._id ?? log.workerId ?? log._id),
        workerName: normalizeName(workerUser),
        verificationStatus: workerProfile?.verificationStatus ?? (log.status ?? "PENDING"),
        documentCount: documents.length,
        submittedAt: toIso(log.createdAt)
      };
    })
  };
}

export async function getAdminWorkerListData(filters: {
  page: number;
  pageSize: number;
  search: string;
  verificationStatus?: VerificationStatus;
  activityStatus?: "ACTIVE" | "INACTIVE";
}): Promise<AdminWorkerListData> {
  await connectDB();

  const match: Record<string, unknown> = { role: "WORKER" };

  if (filters.search) {
    const regex = new RegExp(filters.search, "i");
    match.$or = [
      { firstName: regex },
      { lastName: regex },
      { email: regex },
      { phone: regex }
    ];
  }

  const skip = getSkip(filters.page, filters.pageSize);

  const [result, applicationCounts] = await Promise.all([
    User.aggregate([
      { $match: match },
      {
        $lookup: {
          from: "workerprofiles",
          localField: "_id",
          foreignField: "userId",
          as: "workerProfile"
        }
      },
      { $unwind: { path: "$workerProfile", preserveNullAndEmptyArrays: true } },
      ...(filters.verificationStatus
        ? [
            {
              $match: {
                "workerProfile.verificationStatus": filters.verificationStatus
              }
            }
          ]
        : []),
      ...(filters.activityStatus
        ? [
            {
              $match: {
                isActive: filters.activityStatus === "ACTIVE"
              }
            }
          ]
        : []),
      { $sort: { createdAt: -1, _id: -1 } },
      {
        $facet: {
          items: [{ $skip: skip }, { $limit: filters.pageSize }],
          total: [{ $count: "count" }]
        }
      }
    ]),
    Application.aggregate([
      {
        $group: {
          _id: "$workerId",
          total: { $sum: 1 }
        }
      }
    ])
  ]) as [
    Array<{
      items?: Array<LeanUser & { workerProfile?: LeanWorkerProfile }>;
      total?: Array<{ count?: number }>;
    }>,
    Array<{ _id: unknown; total?: number }>
  ];

  const workerResult = result?.[0];
  const total = workerResult?.total?.[0]?.count ?? 0;
  const applicationCountMap = new Map(
    applicationCounts.map((entry) => [String(entry._id), Number(entry.total ?? 0)])
  );

  return {
    rows: (workerResult?.items ?? []).map((user) => ({
      id: String(user._id),
      profileId: String(user.workerProfile?._id ?? ""),
      fullName: normalizeName(user),
      email: user.email ?? "",
      phone: user.phone ?? user.workerProfile?.phone ?? "",
      roleType: user.workerProfile?.roleType ?? "CARE_SUPPORT",
      verificationStatus: user.workerProfile?.verificationStatus ?? "PENDING",
      isActive: Boolean(user.isActive),
      applications: applicationCountMap.get(String(user.workerProfile?._id ?? "")) ?? 0,
      registrationDate: toIso(user.createdAt)
    })),
    total,
    page: filters.page,
    pageSize: filters.pageSize,
    pageCount: Math.max(Math.ceil(total / filters.pageSize), 1)
  };
}

export async function getAdminWorkerDetailData(workerUserId: string): Promise<AdminWorkerDetailData | null> {
  await connectDB();

  const [user, profile] = (await Promise.all([
    User.findById(workerUserId).lean(),
    WorkerProfile.findOne({ userId: workerUserId }).lean()
  ])) as [LeanUser | null, LeanWorkerProfile | null];

  if (!user || !profile) {
    return null;
  }

  const [verificationLogs, upcomingAssignments, completedAssignments, applications] =
    await Promise.all([
      VerificationLog.find({ workerId: profile._id })
        .sort({ createdAt: -1 })
        .lean(),
      Assignment.find({ workerId: profile._id, status: "UPCOMING" })
        .sort({ assignedAt: -1 })
        .populate({
          path: "shiftId",
          select: "date startTime endTime facilityId status",
          populate: {
            path: "facilityId",
            select: "companyName"
          }
        })
        .lean(),
      Assignment.find({ workerId: profile._id, status: "COMPLETED" })
        .sort({ assignedAt: -1 })
        .populate({
          path: "shiftId",
          select: "date startTime endTime facilityId status",
          populate: {
            path: "facilityId",
            select: "companyName"
          }
        })
        .lean(),
      Application.find({ workerId: profile._id })
        .sort({ createdAt: -1 })
        .populate({
          path: "shiftId",
          select: "date roleRequired facilityId",
          populate: {
            path: "facilityId",
            select: "companyName"
          }
        })
        .lean()
    ]) as [LeanVerificationLog[], LeanAssignment[], LeanAssignment[], LeanApplication[]];

  const mapAssignment = (assignment: LeanAssignment) => {
    const shift = assignment.shiftId as unknown as LeanShift | null | undefined;
    const facility = shift?.facilityId as unknown as LeanFacilityProfile | null | undefined;

    return {
      id: String(assignment._id),
      facilityName: facility?.companyName ?? "Unknown facility",
      date: shift?.date ? formatDate(shift.date) : "TBA",
      hours: `${shift?.startTime ?? "--:--"} - ${shift?.endTime ?? "--:--"}`,
      status: assignment.status ?? "UPCOMING"
    };
  };

  return {
    user: {
      id: String(user._id),
      fullName: normalizeName(user),
      email: user.email ?? "",
      phone: user.phone ?? "",
      isActive: Boolean(user.isActive),
      registrationDate: toIso(user.createdAt)
    },
    profile: {
      id: String(profile._id),
      phone: profile.phone ?? "",
      addressHistory: profile.addressHistory ?? [],
      niNumber: profile.niNumber ?? "",
      shareCode: profile.shareCode ?? "",
      roleType: profile.roleType ?? "CARE_SUPPORT",
      verificationStatus: profile.verificationStatus ?? "PENDING",
      isVerified: Boolean(profile.isVerified),
      documents: profile.cloudinaryDocuments ?? [],
      updatedAt: toIso(profile.updatedAt)
    },
    verification: {
      submittedAt: toIso(verificationLogs[0]?.createdAt ?? profile.updatedAt),
      currentStatus: profile.verificationStatus ?? "PENDING",
      logs: verificationLogs.map((log) => ({
        id: String(log._id),
        status: log.status ?? "PENDING",
        reportUrl: log.reportUrl ?? "",
        documentName:
          ((log.payload ?? {}) as Record<string, unknown>).documentName?.toString?.() ??
          "Document",
        resourceType:
          ((log.payload ?? {}) as Record<string, unknown>).resourceType?.toString?.() ??
          undefined,
        adminNotes: log.adminNotes ?? "",
        decisionAt: log.decisionAt ? log.decisionAt.toISOString() : undefined,
        submittedAt: toIso(log.createdAt)
      }))
    },
    assignments: {
      upcoming: upcomingAssignments.map(mapAssignment),
      completed: completedAssignments.map(mapAssignment)
    },
    applications: applications.map((application) => {
      const shift = application.shiftId as unknown as LeanShift | null | undefined;
      const facility = shift?.facilityId as unknown as LeanFacilityProfile | null | undefined;

      return {
        id: String(application._id),
        facilityName: facility?.companyName ?? "Unknown facility",
        shiftDate: shift?.date ? formatDate(shift.date) : "TBA",
        shiftLabel: `${shift?.roleRequired ?? "Shift"} - ${shift?.date ? formatDate(shift.date) : "TBA"}`,
        status: application.status ?? "PENDING",
        submittedAt: toIso(application.createdAt)
      };
    })
  };
}

export async function getAdminVerificationQueueData(filters: {
  page: number;
  pageSize: number;
  search: string;
  status?: VerificationStatus;
  sort: "oldest" | "newest";
}): Promise<AdminVerificationQueueData> {
  await connectDB();

  const skip = getSkip(filters.page, filters.pageSize);
  const sortDirection = filters.sort === "oldest" ? 1 : -1;
  const searchRegex = filters.search ? new RegExp(filters.search, "i") : null;

  const pipeline: PipelineStage[] = [
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user"
      }
    },
    { $unwind: "$user" },
    {
      $lookup: {
        from: "verificationlogs",
        let: { workerProfileId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$workerId", "$$workerProfileId"] }
            }
          },
          { $sort: { createdAt: sortDirection } },
          { $limit: 1 }
        ],
        as: "latestLog"
      }
    },
    { $unwind: "$latestLog" },
    ...(filters.status
      ? [
          {
            $match: {
              verificationStatus: filters.status
            }
          }
        ]
      : []),
    ...(searchRegex
      ? [
          {
            $match: {
              $or: [
                { "user.firstName": searchRegex },
                { "user.lastName": searchRegex },
                { "user.email": searchRegex }
              ]
            }
          }
        ]
      : []),
    { $sort: { "latestLog.createdAt": sortDirection, _id: 1 } },
    {
      $facet: {
        items: [{ $skip: skip }, { $limit: filters.pageSize }],
        total: [{ $count: "count" }]
      }
    }
  ];

  const [result] = (await WorkerProfile.aggregate(pipeline)) as [
    {
      items?: Array<
        LeanWorkerProfile & {
          user?: LeanUser;
          latestLog?: LeanVerificationLog;
        }
      >;
      total?: Array<{ count?: number }>;
    }
  ];

  const total = result?.total?.[0]?.count ?? 0;

  return {
    rows: (result?.items ?? []).map((profile) => {
      const latestLog = profile.latestLog;
      const user = profile.user;
      return {
        id: String(profile._id),
        workerId: String(profile._id),
        workerUserId: String(profile.userId),
        workerName: normalizeName(user),
        submissionDate: toIso(latestLog?.createdAt ?? profile.updatedAt),
        currentStatus: profile.verificationStatus ?? latestLog?.status ?? "PENDING",
        documentCount: profile.cloudinaryDocuments?.length ?? 0,
        latestLogId: latestLog ? String(latestLog._id) : undefined
      };
    }),
    total,
    page: filters.page,
    pageSize: filters.pageSize,
    pageCount: Math.max(Math.ceil(total / filters.pageSize), 1)
  };
}

export async function getAdminFacilityListData(filters: {
  page: number;
  pageSize: number;
  search: string;
  activityStatus?: "ACTIVE" | "INACTIVE";
}): Promise<AdminFacilityListData> {
  await connectDB();

  const searchRegex = filters.search ? new RegExp(filters.search, "i") : null;

  const skip = getSkip(filters.page, filters.pageSize);

  const pipeline: PipelineStage[] = [
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user"
      }
    },
    { $unwind: "$user" },
    ...(filters.activityStatus
      ? [
          {
            $match: {
              "user.isActive": filters.activityStatus === "ACTIVE"
            }
          }
        ]
      : []),
    ...(searchRegex
      ? [
          {
            $match: {
              $or: [
                { companyName: searchRegex },
                { address: searchRegex },
                { contactNumber: searchRegex },
                { "user.firstName": searchRegex },
                { "user.lastName": searchRegex },
                { "user.email": searchRegex }
              ]
            }
          }
        ]
      : []),
    {
      $lookup: {
        from: "shifts",
        let: { facilityProfileId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$facilityId", "$$facilityProfileId"] }
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              openShifts: {
                $sum: {
                  $cond: [{ $eq: ["$status", "OPEN"] }, 1, 0]
                }
              }
            }
          }
        ],
        as: "shiftTotals"
      }
    },
    { $sort: { createdAt: -1, _id: -1 } },
    {
      $facet: {
        items: [{ $skip: skip }, { $limit: filters.pageSize }],
        total: [{ $count: "count" }]
      }
    }
  ];

  const [result] = (await FacilityProfile.aggregate(pipeline)) as [
    {
      items?: Array<
        LeanFacilityProfile & {
          user?: LeanUser;
          shiftTotals?: Array<{ total?: number; openShifts?: number }>;
        }
      >;
      total?: Array<{ count?: number }>;
    }
  ];

  const total = result?.total?.[0]?.count ?? 0;

  return {
    rows: (result?.items ?? []).map((profile) => ({
      id: String(profile.userId),
      companyName: profile.companyName ?? "",
      contactPerson: normalizeName(profile.user),
      email: profile.user?.email ?? "",
      openShifts: profile.shiftTotals?.[0]?.openShifts ?? 0,
      totalShifts: profile.shiftTotals?.[0]?.total ?? 0,
      isActive: Boolean(profile.user?.isActive),
      registrationDate: toIso(profile.createdAt)
    })),
    total,
    page: filters.page,
    pageSize: filters.pageSize,
    pageCount: Math.max(Math.ceil(total / filters.pageSize), 1)
  };
}

export async function getAdminFacilityDetailData(facilityUserId: string): Promise<AdminFacilityDetailData | null> {
  await connectDB();

  const [user, profile] = (await Promise.all([
    User.findById(facilityUserId).lean(),
    FacilityProfile.findOne({ userId: facilityUserId }).lean()
  ])) as [LeanUser | null, LeanFacilityProfile | null];

  if (!user || !profile) {
    return null;
  }

  const [shifts, applications, assignments] = await Promise.all([
    Shift.find({ facilityId: profile._id }).sort({ date: -1 }).lean(),
    Application.find()
      .populate({
        path: "shiftId",
        select: "date roleRequired facilityId"
      })
      .populate({
        path: "workerId",
        select: "userId",
        populate: {
          path: "userId",
          select: "firstName lastName email"
        }
      })
      .lean(),
    Assignment.find({ facilityId: profile._id })
      .populate({
        path: "workerId",
        select: "userId roleType",
        populate: {
          path: "userId",
          select: "firstName lastName email"
        }
      })
      .lean()
  ]) as [LeanShift[], LeanApplication[], LeanAssignment[]];

  const workerMap = new Map<string, { workerName: string; roleType: WorkerRoleType; assignmentCount: number }>();
  assignments.forEach((assignment) => {
    const workerProfile = assignment.workerId as unknown as LeanWorkerProfile | null | undefined;
    const workerUser = workerProfile?.userId as unknown as LeanUser | null | undefined;
    const key = String(workerProfile?._id ?? assignment.workerId ?? "");
    if (!key) {
      return;
    }
    const current = workerMap.get(key) ?? {
      workerName: normalizeName(workerUser),
      roleType: workerProfile?.roleType ?? "CARE_SUPPORT",
      assignmentCount: 0
    };
    current.assignmentCount += 1;
    workerMap.set(key, current);
  });

  return {
    company: {
      id: String(profile.userId),
      companyName: profile.companyName ?? "",
      address: profile.address ?? "",
      contactNumber: profile.contactNumber ?? "",
      contactPerson: normalizeName(user),
      email: user.email ?? "",
      isActive: Boolean(user.isActive),
      registrationDate: toIso(profile.createdAt)
    },
    stats: {
      totalShifts: shifts.length,
      filledShifts: shifts.filter((shift) => shift.status === "FILLED").length,
      openShifts: shifts.filter((shift) => shift.status === "OPEN").length,
      totalApplications: applications.filter((application) => {
        const shift = application.shiftId as unknown as LeanShift | null | undefined;
        return String((shift?.facilityId ?? profile._id) ?? "") === String(profile._id);
      }).length
    },
    workersUsed: Array.from(workerMap.entries()).map(([id, value]) => ({
      id,
      workerName: value.workerName,
      roleType: value.roleType,
      assignmentCount: value.assignmentCount
    })),
    applications: applications
      .filter((application) => {
        const shift = application.shiftId as unknown as LeanShift | null | undefined;
        return String((shift?.facilityId ?? profile._id) ?? "") === String(profile._id);
      })
      .map((application) => {
        const shift = application.shiftId as unknown as LeanShift | null | undefined;
        const workerProfile = application.workerId as unknown as LeanWorkerProfile | null | undefined;
        const workerUser = workerProfile?.userId as unknown as LeanUser | null | undefined;

        return {
          id: String(application._id),
          workerName: normalizeName(workerUser),
          shiftLabel: `${shift?.roleRequired ?? "Shift"} - ${shift?.date ? formatDate(shift.date) : "TBA"}`,
          status: application.status ?? "PENDING",
          submittedAt: toIso(application.createdAt)
        };
      }),
    shifts: shifts.map((shift) => ({
      id: String(shift._id),
      date: shift.date ? formatDate(shift.date) : "TBA",
      roleRequired: shift.roleRequired ?? "",
      status: shift.status ?? "OPEN"
    }))
  };
}
