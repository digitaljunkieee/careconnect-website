import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import FacilityProfile from "@/models/FacilityProfile";
import Shift from "@/models/Shift";
import Application from "@/models/Application";
import type {
  ApplicationStatus,
  ShiftStatus,
  VerificationStatus
} from "@/lib/constants";
import { formatCurrency, formatDate, formatName } from "@/lib/format";
import { getSkip } from "@/lib/pagination";

type LeanUser = {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
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

type LeanWorkerProfile = {
  _id: unknown;
  userId?: unknown;
  verificationStatus?: VerificationStatus;
  roleType?: string;
};

type FacilityShiftItem = {
  _id: unknown;
  date?: Date;
  startTime?: string;
  endTime?: string;
  hourlyRate?: number;
  roleRequired?: string;
  notes?: string;
  status: ShiftStatus;
};

type ShiftSummaryItem = {
  _id: unknown;
  date?: Date;
  startTime?: string;
  endTime?: string;
  roleRequired?: string;
  status?: ShiftStatus;
};

type ApplicantItem = {
  _id: unknown;
  workerId: unknown;
  status: string;
  createdAt?: Date;
  workerProfile?: {
    verificationStatus?: VerificationStatus;
    roleType?: string;
  } | null;
  workerUser?: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
  } | null;
};

export type FacilityProfileData = {
  userId: string;
  companyName: string;
  address: string;
  contactNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string;
  createdAt: string;
  updatedAt: string;
};

export type FacilityDashboardData = {
  companyName: string;
  openShiftsCount: number;
  filledShiftsCount: number;
  pendingApplicationsCount: number;
  upcomingShifts: Array<{
    id: string;
    date: string;
    roleRequired: string;
    status: ShiftStatus;
    hourlyRateLabel: string;
  }>;
};

export type FacilityShiftRow = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  hourlyRate: number;
  hourlyRateLabel: string;
  roleRequired: string;
  status: ShiftStatus;
  applicationCount: number;
};

export type FacilityShiftStats = {
  open: number;
  closed: number;
  filled: number;
  draft: number;
};

export type ApplicantRow = {
  id: string;
  workerId: string;
  workerName: string;
  applicationStatus: string;
  verificationStatus: VerificationStatus;
  roleType: string;
  appliedAt: string;
  shiftLabel?: string;
};

function normalizeText(value: string | undefined) {
  return value?.trim() ?? "";
}

function normalizeName(user?: Pick<LeanUser, "firstName" | "lastName" | "email"> | null) {
  return formatName(user?.firstName ?? undefined, user?.lastName ?? undefined) || user?.email || "";
}

function normalizeSearch(value: string) {
  return value.trim().toLowerCase();
}

function matchesSearch(values: Array<string | number | undefined>, search: string) {
  if (!search) {
    return true;
  }

  return values.some((value) =>
    String(value ?? "")
      .toLowerCase()
      .includes(search)
  );
}

function paginate<T>(items: T[], page: number, pageSize: number) {
  const total = items.length;
  const pageCount = Math.max(Math.ceil(total / pageSize), 1);
  const offset = getSkip(page, pageSize);

  return {
    rows: items.slice(offset, offset + pageSize),
    total,
    pageCount
  };
}

async function getFacilityContext(userId: string) {
  const [user, profile] = (await Promise.all([
    User.findById(userId).lean(),
    FacilityProfile.findOne({ userId }).lean()
  ])) as [LeanUser | null, LeanFacilityProfile | null];

  return { user, profile };
}

export async function getFacilityProfileData(userId: string) {
  await connectDB();

  const { user, profile } = await getFacilityContext(userId);

  if (!profile) {
    return null;
  }

  return {
    userId: String(profile.userId),
    companyName: profile.companyName ?? "",
    address: profile.address ?? "",
    contactNumber: profile.contactNumber ?? "",
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    email: user?.email ?? "",
    avatarUrl: user?.avatarUrl ?? "",
    createdAt: profile.createdAt?.toISOString?.() ?? new Date().toISOString(),
    updatedAt: profile.updatedAt?.toISOString?.() ?? new Date().toISOString()
  } satisfies FacilityProfileData;
}

export async function getFacilityDashboardData(userId: string) {
  await connectDB();

  const { profile } = await getFacilityContext(userId);
  if (!profile) {
    return null;
  }

  const [openShiftsCount, filledShiftsCount, shifts, pendingApplicationsCount] =
    await Promise.all([
      Shift.countDocuments({ facilityId: profile._id, status: "OPEN" }),
      Shift.countDocuments({ facilityId: profile._id, status: "FILLED" }),
      (await Shift.find({ facilityId: profile._id })
        .sort({ date: 1 })
        .limit(3)
        .lean()) as FacilityShiftItem[],
      (async () => {
        const shiftIds = await Shift.find({ facilityId: profile._id }).distinct("_id");
        return Application.countDocuments({
          shiftId: { $in: shiftIds },
          status: "PENDING"
        });
      })()
    ]);

  return {
    companyName: profile.companyName ?? "",
    openShiftsCount,
    filledShiftsCount,
    pendingApplicationsCount,
    upcomingShifts: shifts.map((shift) => ({
      id: String(shift._id),
      date: shift.date ? new Date(shift.date).toISOString() : new Date().toISOString(),
      roleRequired: shift.roleRequired ?? "",
      status: shift.status,
      hourlyRateLabel: formatCurrency(shift.hourlyRate ?? 0)
    }))
  } satisfies FacilityDashboardData;
}

export async function getFacilityShiftListData(
  userId: string,
  filters: {
    page: number;
    pageSize: number;
    status?: ShiftStatus;
    search: string;
  }
) {
  await connectDB();

  const { profile } = await getFacilityContext(userId);
  if (!profile) {
    return null;
  }

  const match: Record<string, unknown> = { facilityId: profile._id };
  if (filters.status) {
    match.status = filters.status;
  }

  const search = normalizeText(filters.search);
  if (search) {
    match.$or = [
      { roleRequired: { $regex: new RegExp(search, "i") } },
      { notes: { $regex: new RegExp(search, "i") } }
    ];
  }

  const skip = getSkip(filters.page, filters.pageSize);

  const [items, total, applicationCounts, statusCounts] = (await Promise.all([
    Shift.find(match)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(filters.pageSize)
      .lean(),
    Shift.countDocuments(match),
    Shift.find({ facilityId: profile._id }).distinct("_id"),
    Promise.all(
      ["OPEN", "CLOSED", "FILLED", "DRAFT"].map(
        async (status): Promise<[string, number]> => [
          status,
          await Shift.countDocuments({ facilityId: profile._id, status })
        ]
      )
    )
  ])) as [FacilityShiftItem[], number, unknown[], Array<[string, number]>];

  const applications = await Application.aggregate([
    { $match: { shiftId: { $in: applicationCounts } } },
    {
      $group: {
        _id: "$shiftId",
        count: { $sum: 1 }
      }
    }
  ]);

  const applicationCountMap = new Map(
    applications.map((entry) => [String(entry._id), Number(entry.count ?? 0)])
  );
  const shiftStats = Object.fromEntries(statusCounts) as Record<string, number>;

  return {
    rows: items.map((shift) => ({
      id: String(shift._id),
      date: shift.date ? new Date(shift.date).toISOString() : new Date().toISOString(),
      startTime: shift.startTime,
      endTime: shift.endTime,
      hourlyRate: shift.hourlyRate ?? 0,
      hourlyRateLabel: formatCurrency(shift.hourlyRate ?? 0),
      roleRequired: shift.roleRequired ?? "",
      status: shift.status,
      applicationCount: applicationCountMap.get(String(shift._id)) ?? 0
    })) as FacilityShiftRow[],
    statusCounts: {
      open: shiftStats.OPEN ?? 0,
      closed: shiftStats.CLOSED ?? 0,
      filled: shiftStats.FILLED ?? 0,
      draft: shiftStats.DRAFT ?? 0
    } satisfies FacilityShiftStats,
    total,
    page: filters.page,
    pageSize: filters.pageSize,
    pageCount: Math.max(Math.ceil(total / filters.pageSize), 1)
  };
}

export async function getShiftApplicantsData(
  userId: string,
  shiftId: string,
  filters: {
    page: number;
    pageSize: number;
    applicationStatus?: string;
    verificationStatus?: VerificationStatus;
  }
) {
  await connectDB();

  const { profile } = await getFacilityContext(userId);
  if (!profile) {
    return null;
  }

  const shift = await Shift.findOne({
    _id: shiftId,
    facilityId: profile._id
  }).lean();

  if (!shift) {
    return null;
  }

  const match: Record<string, unknown> = {
    shiftId: shift._id
  };

  if (filters.applicationStatus) {
    match.status = filters.applicationStatus;
  }

  const skip = getSkip(filters.page, filters.pageSize);
  const verificationFilter = filters.verificationStatus;

  const [result] = (await Application.aggregate([
    { $match: match },
    {
      $lookup: {
        from: "workerprofiles",
        localField: "workerId",
        foreignField: "_id",
        as: "workerProfile"
      }
    },
    { $unwind: "$workerProfile" },
    {
      $lookup: {
        from: "users",
        localField: "workerProfile.userId",
        foreignField: "_id",
        as: "workerUser"
      }
    },
    { $unwind: "$workerUser" },
    ...(verificationFilter
      ? [
          {
            $match: {
              "workerProfile.verificationStatus": verificationFilter
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
  ])) as [{ items?: ApplicantItem[]; total?: Array<{ count?: number }> }];

  const total = result?.total?.[0]?.count ?? 0;
  const items = result?.items ?? [];

  return {
    shift: {
      id: String(shift._id),
      roleRequired: shift.roleRequired,
      date: shift.date ? new Date(shift.date).toISOString() : new Date().toISOString(),
      startTime: shift.startTime,
      endTime: shift.endTime,
      status: shift.status
    },
    rows: items.map((item) => ({
      id: String(item._id),
      workerId: String(item.workerId),
      workerName:
        `${item.workerUser?.firstName ?? ""} ${item.workerUser?.lastName ?? ""}`.trim() ||
        item.workerUser?.email ||
        "Unknown worker",
      applicationStatus: item.status,
      verificationStatus: item.workerProfile?.verificationStatus ?? "PENDING",
      roleType: item.workerProfile?.roleType ?? "CARE_SUPPORT",
      appliedAt: item.createdAt?.toISOString?.() ?? new Date().toISOString()
    })) as ApplicantRow[],
    total,
    page: filters.page,
    pageSize: filters.pageSize,
    pageCount: Math.max(Math.ceil(total / filters.pageSize), 1)
  };
}

export async function getFacilityApplicantListData(
  userId: string,
  filters: {
    page: number;
    pageSize: number;
    search: string;
    applicationStatus?: ApplicationStatus;
    verificationStatus?: VerificationStatus;
  }
) {
  await connectDB();

  const { profile } = await getFacilityContext(userId);
  if (!profile) {
    return null;
  }

  const shiftIds = await Shift.find({ facilityId: profile._id }).distinct("_id");
  if (!shiftIds.length) {
    return {
      rows: [],
      total: 0,
      page: filters.page,
      pageSize: filters.pageSize,
      pageCount: 1
    };
  }

  const [applications] = (await Promise.all([
    Application.find({ shiftId: { $in: shiftIds } })
      .populate({
        path: "workerId",
        select: "userId verificationStatus roleType",
        populate: {
          path: "userId",
          select: "firstName lastName email"
        }
      })
      .populate({
        path: "shiftId",
        select: "date startTime endTime roleRequired status"
      })
      .sort({ createdAt: -1 })
      .lean()
  ])) as [
    Array<{
      _id: unknown;
      workerId?: LeanWorkerProfile;
      shiftId?: ShiftSummaryItem;
      status?: ApplicationStatus;
      createdAt?: Date;
    }>
  ];

  const search = normalizeSearch(filters.search);

  const filtered = applications
    .map((application) => {
      const workerProfile = application.workerId;
      const workerUser = workerProfile?.userId as LeanUser | undefined;
      const shift = application.shiftId;

      return {
        id: String(application._id),
        workerId: String(workerProfile?._id ?? application.workerId ?? ""),
        workerName: normalizeName(workerUser),
        applicationStatus: application.status ?? "PENDING",
        verificationStatus: workerProfile?.verificationStatus ?? "PENDING",
        roleType: workerProfile?.roleType ?? "CARE_SUPPORT",
        appliedAt: application.createdAt?.toISOString?.() ?? new Date().toISOString(),
        shiftLabel: [
          shift?.roleRequired ?? "Shift",
          shift?.date ? formatDate(shift.date) : "TBA",
          shift?.startTime && shift?.endTime ? `${shift.startTime} - ${shift.endTime}` : undefined
        ]
          .filter(Boolean)
          .join(" • "),
        sortDate: application.createdAt ?? new Date(0)
      };
    })
    .filter((row) => {
      if (filters.applicationStatus && row.applicationStatus !== filters.applicationStatus) {
        return false;
      }

      if (filters.verificationStatus && row.verificationStatus !== filters.verificationStatus) {
        return false;
      }

      return matchesSearch(
        [
          row.workerName,
          row.shiftLabel,
          row.applicationStatus,
          row.verificationStatus,
          row.roleType
        ],
        search
      );
    })
    .sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime());

  const { rows, total, pageCount } = paginate(filtered, filters.page, filters.pageSize);

  return {
    rows: rows.map(({ sortDate: _sortDate, ...row }) => row) as ApplicantRow[],
    total,
    page: filters.page,
    pageSize: filters.pageSize,
    pageCount
  };
}

export async function getFacilityShiftById(userId: string, shiftId: string) {
  await connectDB();

  const { profile } = await getFacilityContext(userId);
  if (!profile) {
    return null;
  }

  const shift = await Shift.findOne({
    _id: shiftId,
    facilityId: profile._id
  }).lean();

  if (!shift) {
    return null;
  }

  return {
    id: String(shift._id),
    date: shift.date ? new Date(shift.date).toISOString() : new Date().toISOString(),
    startTime: shift.startTime,
    endTime: shift.endTime,
    hourlyRate: shift.hourlyRate,
    roleRequired: shift.roleRequired,
    notes: shift.notes ?? "",
    status: shift.status
  };
}

export { createShiftForFacility, deleteShiftForFacility } from "@/lib/workflows";
