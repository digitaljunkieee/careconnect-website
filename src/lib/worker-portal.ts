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
import { getSkip, paginateItems } from "@/lib/pagination";

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
  facility?: {
    companyName?: string;
    address?: string;
    facilityType?: string;
    description?: string;
  } | null;
  facilityId?: {
    companyName?: string;
    address?: string;
    facilityType?: string;
    description?: string;
  } | null;
  date?: Date;
  startTime?: string;
  endTime?: string;
  hourlyRate?: number;
  roleRequired?: string;
  requiredQualifications?: string;
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
  facility?: {
    companyName?: string;
    address?: string;
    facilityType?: string;
    description?: string;
  } | null;
  facilityId?: {
    companyName?: string;
    address?: string;
    facilityType?: string;
    description?: string;
  } | null;
  date?: Date;
  startTime?: string;
  endTime?: string;
  hourlyRate?: number;
  roleRequired?: string;
  requiredQualifications?: string;
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
  profileCompletionPercent: number;
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
  facilityType: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
  hourlyRate: number;
  hourlyRateLabel: string;
  roleRequired: string;
  requirements: string;
  description: string;
  notes: string;
  tags: string[];
  alreadyApplied: boolean;
  isFeatured: boolean;
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

export type WorkerApplicationStatusCounts = {
  ALL: number;
  PENDING: number;
  ACCEPTED: number;
  REJECTED: number;
};

export type WorkerApplicationsData = {
  rows: WorkerApplicationRow[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  statusCounts: WorkerApplicationStatusCounts;
};

export type WorkerAssignmentRow = {
  id: string;
  shiftId: string;
  facilityName: string;
  date: string;
  hours: string;
  status: string;
};

function normalizeValue(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

function titleCase(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function getPrimaryAddress(addressHistory?: string[] | null) {
  if (!Array.isArray(addressHistory)) {
    return "";
  }

  const entries = addressHistory.map((entry) => entry.trim()).filter(Boolean);
  return entries.at(-1) ?? "";
}

function extractPostcodeArea(address?: string) {
  const postcodeMatch = address
    ?.toUpperCase()
    .match(/\b([A-Z]{1,2})\d[A-Z\d]?\s*\d[A-Z]{2}\b/);

  return postcodeMatch?.[1] ?? "";
}

function extractLocationLabel(address?: string | null) {
  const trimmed = address?.trim() ?? "";
  if (!trimmed) {
    return "";
  }

  const parts = trimmed
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (!parts.length) {
    return "";
  }

  const lastPart = parts.at(-1) ?? "";
  const postcodePattern = /\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/i;

  if (postcodePattern.test(lastPart) && parts.length > 1) {
    return parts.at(-2) ?? lastPart;
  }

  return lastPart;
}

function getShiftFacility(
  item: Pick<WorkerShiftBoardItem, "facility" | "facilityId">
) {
  return item.facility ?? item.facilityId ?? null;
}

function parseShiftHour(value?: string) {
  if (!value) {
    return null;
  }

  const [hours, minutes = "0"] = value.split(":");
  const parsedHours = Number.parseInt(hours, 10);
  const parsedMinutes = Number.parseInt(minutes, 10);

  if (!Number.isFinite(parsedHours) || !Number.isFinite(parsedMinutes)) {
    return null;
  }

  return parsedHours + parsedMinutes / 60;
}

function isUrgentShift(row: {
  roleRequired: string;
  requirements: string;
  description: string;
}) {
  return /\b(urgent|asap|immediate|short notice|same day)\b/i.test(
    `${row.roleRequired} ${row.requirements} ${row.description}`
  );
}

function getShiftPeriodTag(startTime?: string) {
  const hour = parseShiftHour(startTime);

  if (hour === null) {
    return null;
  }

  return hour >= 6 && hour < 18 ? "Day Shift" : "Night Shift";
}

function buildShiftTags(row: {
  startTime?: string;
  roleRequired: string;
  requirements: string;
  description: string;
  facilityType: string;
}) {
  const tags = new Set<string>();

  const periodTag = getShiftPeriodTag(row.startTime);
  if (periodTag) {
    tags.add(periodTag);
  }

  if (isUrgentShift(row)) {
    tags.add("Urgent");
  }

  if (/\bdementia\b/i.test(`${row.roleRequired} ${row.requirements} ${row.description}`)) {
    tags.add("Dementia Care");
  }

  if (row.facilityType) {
    tags.add(row.facilityType);
  }

  return Array.from(tags).slice(0, 3);
}

function computeFeaturedScore(row: {
  hourlyRate: number;
  date: string;
  startTime: string;
  roleRequired: string;
  requirements: string;
  description: string;
}) {
  const shiftDate = new Date(row.date);
  const now = new Date();
  const diffDays = Math.max(
    Math.floor((shiftDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    0
  );
  const urgencyScore = isUrgentShift(row) ? 1000 : 0;
  const rateScore = Math.round(row.hourlyRate);
  const recencyScore = diffDays <= 1 ? 80 : diffDays <= 3 ? 60 : diffDays <= 7 ? 30 : 0;
  const shiftTimeScore = parseShiftHour(row.startTime) ?? 0;

  return urgencyScore + rateScore + recencyScore + shiftTimeScore;
}

function getDistanceRank(workerLocation: string, facilityLocation: string) {
  const normalizedWorkerLocation = normalizeValue(workerLocation);
  const normalizedFacilityLocation = normalizeValue(facilityLocation);

  if (!normalizedWorkerLocation || !normalizedFacilityLocation) {
    return 99;
  }

  if (normalizedWorkerLocation === normalizedFacilityLocation) {
    return 0;
  }

  const workerPostcodeArea = extractPostcodeArea(workerLocation);
  const facilityPostcodeArea = extractPostcodeArea(facilityLocation);

  if (workerPostcodeArea && facilityPostcodeArea && workerPostcodeArea === facilityPostcodeArea) {
    return 0;
  }

  const workerTokens = new Set(normalizedWorkerLocation.split(" ").filter(Boolean));
  const facilityTokens = normalizedFacilityLocation.split(" ").filter(Boolean);

  if (facilityTokens.some((token) => workerTokens.has(token))) {
    return 1;
  }

  return 2;
}

function matchesDistanceFilter(
  distanceFilter: string,
  workerLocation: string,
  facilityLocation: string
) {
  if (!distanceFilter || distanceFilter === "all" || !workerLocation) {
    return true;
  }

  const rank = getDistanceRank(workerLocation, facilityLocation);

  switch (distanceFilter) {
    case "nearby":
      return rank <= 0;
    case "city":
      return rank <= 1;
    case "regional":
      return rank <= 2;
    default:
      return true;
  }
}

function compareMarketplaceRows(
  a: WorkerShiftBoardRow & { featuredScore: number },
  b: WorkerShiftBoardRow & { featuredScore: number }
) {
  const featuredDiff = b.featuredScore - a.featuredScore;
  if (featuredDiff !== 0) {
    return featuredDiff;
  }

  const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
  if (dateDiff !== 0) {
    return dateDiff;
  }

  const rateDiff = b.hourlyRate - a.hourlyRate;
  if (rateDiff !== 0) {
    return rateDiff;
  }

  return a.facilityName.localeCompare(b.facilityName);
}

function buildMarketplaceRow(
  item: WorkerShiftBoardItem,
  appliedShiftIds: Set<string>
): WorkerShiftBoardRow & { featuredScore: number } {
  const date = item.date ? new Date(item.date) : new Date();
  const facility = getShiftFacility(item);
  const location = extractLocationLabel(facility?.address) || "Location on request";
  const facilityType = facility?.facilityType ? titleCase(facility.facilityType) : "";
  const roleRequired = item.roleRequired ?? "";
  const requirements = item.requiredQualifications ?? "";
  const description = item.notes ?? "";
  const hourlyRate = item.hourlyRate ?? 0;

  return {
    id: String(item._id),
    facilityName: facility?.companyName ?? "Unknown facility",
    facilityType,
    location,
    date: date.toISOString(),
    startTime: item.startTime ?? "--:--",
    endTime: item.endTime ?? "--:--",
    hourlyRate,
    hourlyRateLabel: formatCurrency(hourlyRate),
    roleRequired,
    requirements,
    description,
    notes: item.notes ?? "",
    tags: buildShiftTags({
      startTime: item.startTime,
      roleRequired,
      requirements,
      description,
      facilityType
    }),
    alreadyApplied: appliedShiftIds.has(String(item._id)),
    isFeatured: false,
    featuredScore: computeFeaturedScore({
      hourlyRate,
      date: date.toISOString(),
      startTime: item.startTime ?? "--:--",
      roleRequired,
      requirements,
      description
    })
  };
}

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
    roleType: profile.roleType ?? "CARE_ASSISTANT",
    verificationStatus: profile.verificationStatus ?? "PENDING",
    isVerified: Boolean(profile.isVerified),
    cloudinaryDocuments: Array.isArray(profile.cloudinaryDocuments)
      ? profile.cloudinaryDocuments
      : [],
    profileCompletionPercent: getWorkerProfileCompletionPercent(profile, user),
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
          select: "companyName address facilityType description"
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
    availableShifts: availableShiftsRaw.map((shift) => {
      const row = buildMarketplaceRow(shift as WorkerShiftBoardItem, appliedShiftIdSet);
      const { featuredScore, ...marketplaceRow } = row;
      void featuredScore;

      return {
        ...marketplaceRow,
        isFeatured: false
      };
    }) as WorkerShiftBoardRow[],
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
    distance?: string;
    page: number;
    pageSize: number;
  }
) {
  await connectDB();

  const profile = await WorkerProfile.findOne({ userId }).lean();
  if (!profile) {
    return null;
  }

  const baseMatch: Record<string, unknown> = { status: "OPEN" };
  const appliedShiftIds = new Set(
    (await Application.distinct("shiftId", { workerId: profile._id })).map((shiftId) =>
      String(shiftId)
    )
  );
  const workerLocation = getPrimaryAddress(profile.addressHistory);

  if (filters.role && filters.role !== "all") {
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
                { requiredQualifications: searchRegex },
                { notes: searchRegex },
                { "facility.companyName": searchRegex },
                { "facility.address": searchRegex },
                { "facility.facilityType": searchRegex }
              ]
            }
          }
        ]
      : [])
  ];

  const items = (await Shift.aggregate(pipeline)) as WorkerShiftBoardItem[];
  const marketplaceRows = items
    .map((item) => buildMarketplaceRow(item, appliedShiftIds))
    .filter((row) =>
      matchesDistanceFilter(filters.distance ?? "all", workerLocation, row.location)
    )
    .sort(compareMarketplaceRows)
    .map((row, index) =>
      index === 0
        ? {
            ...row,
            isFeatured: true
          }
        : row
    );

  const { rows, total, page, pageCount } = paginateItems(
    marketplaceRows,
    filters.page,
    filters.pageSize
  );

  return {
    rows: rows.map((row) => {
      const { featuredScore, ...marketplaceRow } = row;
      void featuredScore;
      return marketplaceRow;
    }) as WorkerShiftBoardRow[],
    total,
    page,
    pageSize: filters.pageSize,
    pageCount
  };
}

export async function getWorkerApplicationsData(
  userId: string,
  filters: { page: number; pageSize: number; status?: string; search?: string }
) {
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
  const search = filters.search?.trim() ?? "";
  const searchRegex = search ? new RegExp(search, "i") : null;

  const statusCountRows = (await Application.aggregate([
    { $match: { workerId: profile._id } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }
  ])) as Array<{ _id?: string; count?: number }>;

  const statusCounts: WorkerApplicationStatusCounts = {
    ALL: 0,
    PENDING: 0,
    ACCEPTED: 0,
    REJECTED: 0
  };

  statusCountRows.forEach((row) => {
    const key = row._id as keyof WorkerApplicationStatusCounts | undefined;
    if (key && key in statusCounts) {
      statusCounts[key] = row.count ?? 0;
    }
  });
  statusCounts.ALL = statusCountRows.reduce((total, row) => total + (row.count ?? 0), 0);

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
    ...(searchRegex
      ? [
          {
            $match: {
              $or: [
                { "facility.companyName": searchRegex },
                { "shift.roleRequired": searchRegex },
                { status: searchRegex }
              ]
            }
          }
        ]
      : []),
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
    pageCount: Math.max(Math.ceil(total / filters.pageSize), 1),
    statusCounts
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
