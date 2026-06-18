import { connectDB } from "@/lib/mongodb";
import { toCsv } from "@/lib/csv";
import {
  formatCurrency,
  formatDate,
  formatName
} from "@/lib/format";
import { getSkip } from "@/lib/pagination";
import User from "@/models/User";
import WorkerProfile, { type CloudinaryDocument } from "@/models/WorkerProfile";
import FacilityProfile from "@/models/FacilityProfile";
import Shift from "@/models/Shift";
import Application from "@/models/Application";
import Assignment from "@/models/Assignment";
import PaymentLog from "@/models/PaymentLog";
import Notification from "@/models/Notification";
import type {
  ApplicationStatus,
  AuditEntityType,
  NotificationType,
  PaymentStatus,
  ShiftStatus,
  VerificationStatus,
  WorkerRoleType
} from "@/lib/constants";

type LeanUser = {
  _id: unknown;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
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

type LeanPaymentLog = {
  _id: unknown;
  shiftId?: unknown;
  stripeSessionId?: string;
  amount?: number;
  currency?: string;
  status?: PaymentStatus;
  createdAt?: Date;
  updatedAt?: Date;
  shift?: LeanShift | null;
  facility?: LeanFacilityProfile | null;
};

type LeanNotification = {
  _id: unknown;
  userId?: unknown;
  title?: string;
  message?: string;
  type?: NotificationType;
  isRead?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  user?: LeanUser | null;
};

export type AdminWorkerOption = {
  id: string;
  name: string;
  email: string;
};

export type AdminShiftRow = {
  id: string;
  shiftId: string;
  facilityName: string;
  date: string;
  roleRequired: string;
  status: ShiftStatus;
  assignedWorker: string;
  applicationCount: number;
};

export type AdminShiftListData = {
  rows: AdminShiftRow[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  workers: AdminWorkerOption[];
};

export type AdminShiftDetailData = {
  shift: {
    id: string;
    facilityId: string;
    facilityName: string;
    date: string;
    startTime: string;
    endTime: string;
    hourlyRate: number;
    hourlyRateLabel: string;
    roleRequired: string;
    notes: string;
    status: ShiftStatus;
    applicationCount: number;
  };
  assignment: {
    id: string;
    workerId: string;
    workerName: string;
    workerEmail: string;
    status: string;
    assignedAt: string;
  } | null;
  applications: Array<{
    id: string;
    workerName: string;
    workerEmail: string;
    status: ApplicationStatus;
    submittedAt: string;
  }>;
  workers: AdminWorkerOption[];
};

export type AdminApplicationRow = {
  id: string;
  workerName: string;
  workerEmail: string;
  facilityName: string;
  shiftLabel: string;
  status: ApplicationStatus;
  submittedAt: string;
};

export type AdminApplicationListData = {
  rows: AdminApplicationRow[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export type AdminPaymentRow = {
  id: string;
  stripeSessionId: string;
  facilityName: string;
  shiftLabel: string;
  amount: number;
  amountLabel: string;
  currency: string;
  status: PaymentStatus;
  createdAt: string;
};

export type AdminPaymentListData = {
  rows: AdminPaymentRow[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export type AdminNotificationRow = {
  id: string;
  title: string;
  userName: string;
  userEmail: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export type AdminNotificationListData = {
  rows: AdminNotificationRow[];
  total: number;
  unreadTotal: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export type AdminComplianceReportData = {
  range: {
    dateFrom: string;
    dateTo: string;
  };
  summary: {
    verifiedWorkers: number;
    pendingVerifications: number;
    rejectedWorkers: number;
    activeWorkers: number;
    expiringDocuments: number;
    applicationsInRange: number;
    assignmentsInRange: number;
  };
  expiringDocuments: Array<{
    workerName: string;
    workerEmail: string;
    documentName: string;
    expiresAt: string;
    daysRemaining: number;
    verificationStatus: VerificationStatus;
  }>;
  workerActivity: Array<{
    workerName: string;
    workerEmail: string;
    applications: number;
    assignments: number;
    lastActivityAt: string;
  }>;
};

export type AdminAnalyticsData = {
  range: {
    dateFrom: string;
    dateTo: string;
  };
  summary: {
    totalWorkers: number;
    totalFacilities: number;
    totalApplications: number;
    totalShifts: number;
    verifiedWorkers: number;
    shiftCompletionRate: number;
    verificationConversionRate: number;
  };
  workerGrowth: Array<{ label: string; count: number }>;
  facilityGrowth: Array<{ label: string; count: number }>;
  applicationsOverTime: Array<{ label: string; count: number }>;
  shiftCompletionRates: Array<{ label: string; rate: number }>;
  verificationConversionRates: Array<{ label: string; rate: number }>;
};

export type AdminSearchRow = {
  id: string;
  entityType: AuditEntityType | "WORKER" | "FACILITY" | "SHIFT" | "APPLICATION";
  title: string;
  subtitle: string;
  status: string;
  createdAt: string;
  href: string;
};

export type AdminSearchData = {
  rows: AdminSearchRow[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export type AdminSettingsData = {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    avatarUrl: string;
  };
  notificationPreferences: {
    email: boolean;
    inApp: boolean;
    sms: boolean;
    weeklyDigest: boolean;
  };
};

function toIso(value?: Date | null) {
  return value?.toISOString?.() ?? new Date().toISOString();
}

function normalizeName(user?: Pick<LeanUser, "firstName" | "lastName" | "email"> | null) {
  return formatName(user?.firstName, user?.lastName) || user?.email || "";
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

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    month: "short",
    year: "numeric"
  }).format(date);
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function stripSortDate<T extends { sortDate?: unknown }>(row: T) {
  const cleaned = { ...row };
  delete (cleaned as { sortDate?: unknown }).sortDate;
  return cleaned;
}

function parseDateOrFallback(value: string | undefined, fallback: Date) {
  if (!value) {
    return fallback;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

async function getWorkerOptions(limit = 50): Promise<AdminWorkerOption[]> {
  const workers = (await WorkerProfile.find({
    verificationStatus: "VERIFIED",
    isVerified: true
  })
    .populate({
      path: "userId",
      select: "firstName lastName email isActive"
    })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .lean()) as Array<LeanWorkerProfile & { userId?: LeanUser }>;

  return workers
    .filter((worker) => Boolean(worker.userId) && worker.userId?.isActive !== false)
    .map((worker) => ({
      id: String(worker.userId?._id ?? worker._id),
      name: normalizeName(worker.userId),
      email: worker.userId?.email ?? ""
    }));
}

function toShiftLabel(shift?: LeanShift | null) {
  return `${shift?.roleRequired ?? "Shift"} • ${shift?.date ? formatDate(shift.date) : "TBA"}`;
}

export async function getAdminAssignableWorkers(limit = 50) {
  await connectDB();
  return getWorkerOptions(limit);
}

export async function getAdminShiftListData(filters: {
  page: number;
  pageSize: number;
  search: string;
  status?: ShiftStatus;
}): Promise<AdminShiftListData> {
  await connectDB();

  const [shifts, assignments, applicationCounts, workers] = await Promise.all([
    Shift.find()
      .populate({
        path: "facilityId",
        select: "companyName userId"
      })
      .lean(),
    Assignment.find()
      .populate({
        path: "workerId",
        select: "userId roleType",
        populate: {
          path: "userId",
          select: "firstName lastName email"
        }
      })
      .lean(),
    Application.aggregate([
      {
        $group: {
          _id: "$shiftId",
          count: { $sum: 1 }
        }
      }
    ]),
    getWorkerOptions(50)
  ]) as unknown as [
    Array<LeanShift & { facility?: LeanFacilityProfile }>,
    Array<LeanAssignment & { workerId?: LeanWorkerProfile }>,
    Array<{ _id: unknown; count?: number }>,
    AdminWorkerOption[]
  ];

  const assignmentMap = new Map<string, LeanAssignment & { workerId?: LeanWorkerProfile }>();
  assignments.forEach((assignment) => {
    assignmentMap.set(String(assignment.shiftId ?? assignment._id), assignment);
  });

  const applicationCountMap = new Map<string, number>();
  applicationCounts.forEach((entry) => {
    applicationCountMap.set(String(entry._id), Number(entry.count ?? 0));
  });

  const search = normalizeSearch(filters.search);
  const filtered = shifts
    .map((shift) => {
      const assignment = assignmentMap.get(String(shift._id));
      const workerProfile = assignment?.workerId as LeanWorkerProfile | undefined;
      const workerUser = workerProfile?.userId as LeanUser | undefined;
      const facility = shift.facilityId as LeanFacilityProfile | undefined;

      return {
        id: String(shift._id),
        shiftId: String(shift._id),
        facilityName: facility?.companyName ?? "Unknown facility",
        date: shift.date ? toIso(shift.date) : new Date().toISOString(),
        roleRequired: shift.roleRequired ?? "",
        status: shift.status ?? "OPEN",
        assignedWorker: normalizeName(workerUser) || "Unassigned",
        applicationCount: applicationCountMap.get(String(shift._id)) ?? 0,
        sortDate: shift.date ?? new Date(0)
      };
    })
    .filter((row) => {
      if (filters.status && row.status !== filters.status) {
        return false;
      }

      if (!search) {
        return true;
      }

      return matchesSearch(
        [
          row.shiftId,
          row.facilityName,
          row.roleRequired,
          row.status,
          row.assignedWorker,
          row.applicationCount
        ],
        search
      );
    })
    .sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime());

  const { rows, total, pageCount } = paginate(filtered, filters.page, filters.pageSize);

  return {
    rows: rows.map(stripSortDate),
    total,
    page: filters.page,
    pageSize: filters.pageSize,
    pageCount,
    workers
  };
}

export async function getAdminShiftDetailData(
  shiftId: string
): Promise<AdminShiftDetailData | null> {
  await connectDB();

  const [shift, assignments, applications, workers] = await Promise.all([
    Shift.findById(shiftId)
      .populate({
        path: "facilityId",
        select: "companyName userId address contactNumber"
      })
      .lean(),
    Assignment.find({ shiftId })
      .populate({
        path: "workerId",
        select: "userId roleType",
        populate: {
          path: "userId",
          select: "firstName lastName email"
        }
      })
      .lean(),
    Application.find({ shiftId })
      .populate({
        path: "workerId",
        select: "userId",
        populate: {
          path: "userId",
          select: "firstName lastName email"
        }
      })
      .lean(),
    getWorkerOptions(50)
  ]) as unknown as [
    (LeanShift & { facility?: LeanFacilityProfile }) | null,
    Array<LeanAssignment & { workerId?: LeanWorkerProfile }>,
    Array<LeanApplication & { workerId?: LeanWorkerProfile }>,
    AdminWorkerOption[]
  ];

  if (!shift) {
    return null;
  }

  const assignment = assignments[0];
  const assignedWorker = assignment?.workerId as LeanWorkerProfile | undefined;
  const assignedUser = assignedWorker?.userId as LeanUser | undefined;
  const facility = shift.facilityId as LeanFacilityProfile | undefined;

  return {
    shift: {
      id: String(shift._id),
      facilityId: String(
        (shift.facilityId as LeanFacilityProfile | undefined)?._id ?? shift.facilityId ?? ""
      ),
      facilityName: facility?.companyName ?? "Unknown facility",
      date: shift.date ? toIso(shift.date) : new Date().toISOString(),
      startTime: shift.startTime ?? "--:--",
      endTime: shift.endTime ?? "--:--",
      hourlyRate: shift.hourlyRate ?? 0,
      hourlyRateLabel: formatCurrency(shift.hourlyRate ?? 0),
      roleRequired: shift.roleRequired ?? "",
      notes: shift.notes ?? "",
      status: shift.status ?? "OPEN",
      applicationCount: applications.length
    },
    assignment: assignment
      ? {
          id: String(assignment._id),
          workerId: String(assignedWorker?._id ?? assignment.workerId ?? ""),
          workerName: normalizeName(assignedUser),
          workerEmail: assignedUser?.email ?? "",
          status: assignment.status ?? "UPCOMING",
          assignedAt: toIso(assignment.assignedAt ?? assignment.createdAt)
        }
      : null,
    applications: applications.map((application) => {
      const workerProfile = application.workerId as LeanWorkerProfile | undefined;
      const workerUser = workerProfile?.userId as LeanUser | undefined;

      return {
        id: String(application._id),
        workerName: normalizeName(workerUser),
        workerEmail: workerUser?.email ?? "",
        status: application.status ?? "PENDING",
        submittedAt: toIso(application.createdAt)
      };
    }),
    workers
  };
}

export async function getAdminApplicationListData(filters: {
  page: number;
  pageSize: number;
  search: string;
  status?: ApplicationStatus;
}): Promise<AdminApplicationListData> {
  await connectDB();

  const [applications] = await Promise.all([
    Application.find()
      .populate({
        path: "workerId",
        select: "userId verificationStatus roleType",
        populate: {
          path: "userId",
          select: "firstName lastName email phone"
        }
      })
      .populate({
        path: "shiftId",
        select: "date startTime endTime roleRequired status facilityId",
        populate: {
          path: "facilityId",
          select: "companyName"
        }
      })
      .sort({ createdAt: -1 })
      .lean()
  ]) as unknown as [
    Array<
      LeanApplication & {
        workerId?: LeanWorkerProfile;
        shiftId?: LeanShift & { facility?: LeanFacilityProfile };
      }
    >
  ];

  const search = normalizeSearch(filters.search);

  const filtered = applications
    .map((application) => {
      const workerProfile = application.workerId as LeanWorkerProfile | undefined;
      const workerUser = workerProfile?.userId as LeanUser | undefined;
      const shift = application.shiftId as LeanShift & { facility?: LeanFacilityProfile };
      const facility = shift?.facilityId as unknown as LeanFacilityProfile | undefined;

      return {
        id: String(application._id),
        workerName: normalizeName(workerUser),
        workerEmail: workerUser?.email ?? "",
        facilityName: facility?.companyName ?? "Unknown facility",
        shiftLabel: `${shift?.roleRequired ?? "Shift"} • ${shift?.date ? formatDate(shift.date) : "TBA"}`,
        status: application.status ?? "PENDING",
        submittedAt: toIso(application.createdAt),
        sortDate: application.createdAt ?? new Date(0)
      };
    })
    .filter((row) => {
      if (filters.status && row.status !== filters.status) {
        return false;
      }

      if (!search) {
        return true;
      }

      return matchesSearch(
        [row.workerName, row.workerEmail, row.facilityName, row.shiftLabel, row.status],
        search
      );
    })
    .sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime());

  const { rows, total, pageCount } = paginate(filtered, filters.page, filters.pageSize);

  return {
    rows: rows.map(stripSortDate),
    total,
    page: filters.page,
    pageSize: filters.pageSize,
    pageCount
  };
}

export async function getAdminPaymentListData(filters: {
  page: number;
  pageSize: number;
  search: string;
  status?: PaymentStatus;
  dateFrom?: string;
  dateTo?: string;
}): Promise<AdminPaymentListData> {
  await connectDB();

  const [payments] = await Promise.all([
    PaymentLog.find()
      .populate({
        path: "shiftId",
        select: "date startTime endTime roleRequired facilityId",
        populate: {
          path: "facilityId",
          select: "companyName userId"
        }
      })
      .sort({ createdAt: -1 })
      .lean()
  ]) as unknown as [
    Array<
      LeanPaymentLog & {
        shiftId?: LeanShift & { facilityId?: LeanFacilityProfile };
      }
    >
  ];

  const search = normalizeSearch(filters.search);
  const dateFrom = filters.dateFrom ? new Date(filters.dateFrom) : null;
  const dateTo = filters.dateTo ? new Date(filters.dateTo) : null;

  const filtered = payments
    .map((payment) => {
      const shift = payment.shiftId as LeanShift & { facilityId?: LeanFacilityProfile };
      const facility = shift?.facilityId as LeanFacilityProfile | undefined;

      return {
        id: String(payment._id),
        stripeSessionId: payment.stripeSessionId ?? "",
        facilityName: facility?.companyName ?? "Unknown facility",
        shiftLabel: `${shift?.roleRequired ?? "Shift"} • ${shift?.date ? formatDate(shift.date) : "TBA"}`,
        amount: payment.amount ?? 0,
        amountLabel: formatCurrency(payment.amount ?? 0, payment.currency ?? "GBP"),
        currency: payment.currency ?? "GBP",
        status: payment.status ?? "PENDING",
        createdAt: toIso(payment.createdAt),
        sortDate: payment.createdAt ?? new Date(0)
      };
    })
    .filter((row) => {
      if (filters.status && row.status !== filters.status) {
        return false;
      }

      if (dateFrom) {
        const created = new Date(row.createdAt);
        if (created < dateFrom) {
          return false;
        }
      }

      if (dateTo) {
        const created = new Date(row.createdAt);
        if (created > dateTo) {
          return false;
        }
      }

      if (!search) {
        return true;
      }

      return matchesSearch(
        [row.stripeSessionId, row.facilityName, row.shiftLabel, row.amount, row.status],
        search
      );
    })
    .sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime());

  const { rows, total, pageCount } = paginate(filtered, filters.page, filters.pageSize);

  return {
    rows: rows.map(stripSortDate),
    total,
    page: filters.page,
    pageSize: filters.pageSize,
    pageCount
  };
}

export async function getAdminNotificationListData(filters: {
  page: number;
  pageSize: number;
  search: string;
  type?: NotificationType;
  readStatus?: "READ" | "UNREAD";
}): Promise<AdminNotificationListData> {
  await connectDB();

  const [notifications] = await Promise.all([
    Notification.find()
      .populate({
        path: "userId",
        select: "firstName lastName email"
      })
      .sort({ createdAt: -1 })
      .lean()
  ]) as unknown as [
    Array<LeanNotification & { userId?: LeanUser }>
  ];

  const search = normalizeSearch(filters.search);

  const mapped = notifications
    .map((notification) => {
      const user = notification.userId as LeanUser | undefined;

      return {
        id: String(notification._id),
        title: notification.title ?? "",
        userName: normalizeName(user),
        userEmail: user?.email ?? "",
        type: notification.type ?? "INFO",
        message: notification.message ?? "",
        isRead: Boolean(notification.isRead),
        createdAt: toIso(notification.createdAt),
        sortDate: notification.createdAt ?? new Date(0)
      };
    })
    .filter((row) => {
      if (filters.type && row.type !== filters.type) {
        return false;
      }

      if (filters.readStatus === "READ" && !row.isRead) {
        return false;
      }

      if (filters.readStatus === "UNREAD" && row.isRead) {
        return false;
      }

      if (!search) {
        return true;
      }

      return matchesSearch(
        [row.title, row.userName, row.userEmail, row.message, row.type],
        search
      );
    })
    .sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime());

  const unreadTotal = mapped.filter((row) => !row.isRead).length;
  const { rows, total, pageCount } = paginate(mapped, filters.page, filters.pageSize);

  return {
    rows: rows.map(stripSortDate),
    total,
    unreadTotal,
    page: filters.page,
    pageSize: filters.pageSize,
    pageCount
  };
}

export async function getAdminComplianceReportData(filters: {
  dateFrom?: string;
  dateTo?: string;
}): Promise<AdminComplianceReportData> {
  await connectDB();

  const fallbackTo = new Date();
  const fallbackFrom = new Date(fallbackTo);
  fallbackFrom.setDate(fallbackFrom.getDate() - 30);

  const dateFrom = startOfMonth(parseDateOrFallback(filters.dateFrom, fallbackFrom));
  const dateTo = endOfMonth(parseDateOrFallback(filters.dateTo, fallbackTo));
  const expiryWindow = new Date(dateTo);
  expiryWindow.setDate(expiryWindow.getDate() + 30);

  const [workerProfiles, applications, assignments] = await Promise.all([
    WorkerProfile.find()
      .populate({
        path: "userId",
        select: "firstName lastName email isActive"
      })
      .lean(),
    Application.find({
      createdAt: { $gte: dateFrom, $lte: dateTo }
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
    Assignment.find({
      createdAt: { $gte: dateFrom, $lte: dateTo }
    })
      .populate({
        path: "workerId",
        select: "userId",
        populate: {
          path: "userId",
          select: "firstName lastName email"
        }
      })
      .lean()
  ]) as unknown as [
    Array<LeanWorkerProfile & { userId?: LeanUser }>,
    Array<LeanApplication & { workerId?: LeanWorkerProfile }>,
    Array<LeanAssignment & { workerId?: LeanWorkerProfile }>
  ];

  const verifiedWorkers = workerProfiles.filter(
    (profile) => profile.verificationStatus === "VERIFIED" && profile.isVerified
  ).length;
  const pendingVerifications = workerProfiles.filter((profile) =>
    ["PENDING", "IN_REVIEW"].includes(profile.verificationStatus ?? "")
  ).length;
  const rejectedWorkers = workerProfiles.filter(
    (profile) => profile.verificationStatus === "REJECTED"
  ).length;
  const activeWorkers = workerProfiles.filter((profile) => profile.userId?.isActive !== false).length;

  const expiringDocuments = workerProfiles.flatMap((profile) => {
    const workerUser = profile.userId as LeanUser | undefined;

    return (profile.cloudinaryDocuments ?? [])
      .filter((document) => {
        if (!document.expiresAt) {
          return false;
        }

        const expiresAt = new Date(document.expiresAt);
        return expiresAt >= dateFrom && expiresAt <= expiryWindow;
      })
      .map((document) => {
        const expiresAt = document.expiresAt ? new Date(document.expiresAt) : new Date();
        const remaining = Math.ceil(
          (expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );

        return {
          workerName: normalizeName(workerUser),
          workerEmail: workerUser?.email ?? "",
          documentName: document.name ?? "Document",
          expiresAt: toIso(document.expiresAt ?? null),
          daysRemaining: remaining,
          verificationStatus: profile.verificationStatus ?? "PENDING"
        };
      });
  });

  const activityMap = new Map<
    string,
    {
      workerName: string;
      workerEmail: string;
      applications: number;
      assignments: number;
      lastActivityAt: Date;
    }
  >();

  applications.forEach((application) => {
    const workerProfile = application.workerId as LeanWorkerProfile | undefined;
    const workerUser = workerProfile?.userId as LeanUser | undefined;
    const key = String(workerProfile?._id ?? application.workerId ?? "");
    if (!key) {
      return;
    }

    const current =
      activityMap.get(key) ?? {
        workerName: normalizeName(workerUser),
        workerEmail: workerUser?.email ?? "",
        applications: 0,
        assignments: 0,
        lastActivityAt: new Date(0)
      };

    current.applications += 1;
    const createdAt = application.createdAt ?? new Date(0);
    if (createdAt > current.lastActivityAt) {
      current.lastActivityAt = createdAt;
    }
    activityMap.set(key, current);
  });

  assignments.forEach((assignment) => {
    const workerProfile = assignment.workerId as LeanWorkerProfile | undefined;
    const workerUser = workerProfile?.userId as LeanUser | undefined;
    const key = String(workerProfile?._id ?? assignment.workerId ?? "");
    if (!key) {
      return;
    }

    const current =
      activityMap.get(key) ?? {
        workerName: normalizeName(workerUser),
        workerEmail: workerUser?.email ?? "",
        applications: 0,
        assignments: 0,
        lastActivityAt: new Date(0)
      };

    current.assignments += 1;
    const createdAt = assignment.createdAt ?? new Date(0);
    if (createdAt > current.lastActivityAt) {
      current.lastActivityAt = createdAt;
    }
    activityMap.set(key, current);
  });

  const workerActivity = Array.from(activityMap.values())
    .sort((a, b) => b.lastActivityAt.getTime() - a.lastActivityAt.getTime())
    .slice(0, 12)
    .map((entry) => ({
      workerName: entry.workerName,
      workerEmail: entry.workerEmail,
      applications: entry.applications,
      assignments: entry.assignments,
      lastActivityAt: toIso(entry.lastActivityAt)
    }));

  return {
    range: {
      dateFrom: dateFrom.toISOString(),
      dateTo: dateTo.toISOString()
    },
    summary: {
      verifiedWorkers,
      pendingVerifications,
      rejectedWorkers,
      activeWorkers,
      expiringDocuments: expiringDocuments.length,
      applicationsInRange: applications.length,
      assignmentsInRange: assignments.length
    },
    expiringDocuments,
    workerActivity
  };
}

export async function getAdminAnalyticsData(filters: {
  dateFrom?: string;
  dateTo?: string;
}): Promise<AdminAnalyticsData> {
  await connectDB();

  const fallbackTo = new Date();
  const fallbackFrom = new Date(fallbackTo);
  fallbackFrom.setMonth(fallbackFrom.getMonth() - 11);

  const dateFrom = startOfMonth(parseDateOrFallback(filters.dateFrom, fallbackFrom));
  const dateTo = endOfMonth(parseDateOrFallback(filters.dateTo, fallbackTo));

  const months: Date[] = [];
  const cursor = startOfMonth(new Date(dateFrom));
  while (cursor <= dateTo) {
    months.push(new Date(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }

  const [workers, facilities, applications, shifts, workerProfiles] = await Promise.all([
    User.find({
      role: "WORKER",
      createdAt: { $gte: dateFrom, $lte: dateTo }
    })
      .select("createdAt")
      .lean(),
    User.find({
      role: "FACILITY",
      createdAt: { $gte: dateFrom, $lte: dateTo }
    })
      .select("createdAt")
      .lean(),
    Application.find({
      createdAt: { $gte: dateFrom, $lte: dateTo }
    })
      .select("createdAt status")
      .lean(),
    Shift.find({
      createdAt: { $gte: dateFrom, $lte: dateTo }
    })
      .select("createdAt status")
      .lean(),
    WorkerProfile.find({
      createdAt: { $gte: dateFrom, $lte: dateTo }
    })
      .select("createdAt verificationStatus isVerified")
      .lean()
  ]) as unknown as [
    Array<{ createdAt?: Date }>,
    Array<{ createdAt?: Date }>,
    Array<{ createdAt?: Date }>,
    Array<{ createdAt?: Date; status?: ShiftStatus }>,
    Array<{ createdAt?: Date; verificationStatus?: VerificationStatus; isVerified?: boolean }>
  ];

  const buildMonthlySeries = <T extends { createdAt?: Date }>(
    items: T[],
    mapValue: (item: T) => number = () => 1
  ) => {
    return months.map((month) => {
      const key = getMonthKey(month);
      const count = items.reduce((total, item) => {
        if (!item.createdAt) {
          return total;
        }
        const itemKey = getMonthKey(item.createdAt);
        return itemKey === key ? total + mapValue(item) : total;
      }, 0);

      return {
        label: monthLabel(month),
        count
      };
    });
  };

  const workerGrowth = buildMonthlySeries(workers);
  const facilityGrowth = buildMonthlySeries(facilities);
  const applicationsOverTime = buildMonthlySeries(applications);

  const shiftCompletionRates = months.map((month) => {
    const key = getMonthKey(month);
    const monthShifts = shifts.filter(
      (shift) => shift.createdAt && getMonthKey(shift.createdAt) === key
    );
    const filled = monthShifts.filter((shift) => shift.status === "FILLED").length;
    const rate = monthShifts.length ? Math.round((filled / monthShifts.length) * 100) : 0;

    return {
      label: monthLabel(month),
      rate
    };
  });

  const verificationConversionRates = months.map((month) => {
    const key = getMonthKey(month);
    const monthProfiles = workerProfiles.filter(
      (profile) => profile.createdAt && getMonthKey(profile.createdAt) === key
    );
    const verified = monthProfiles.filter(
      (profile) => profile.verificationStatus === "VERIFIED" && profile.isVerified
    ).length;
    const rate = monthProfiles.length ? Math.round((verified / monthProfiles.length) * 100) : 0;

    return {
      label: monthLabel(month),
      rate
    };
  });

  const totalWorkers = await User.countDocuments({ role: "WORKER" });
  const totalFacilities = await User.countDocuments({ role: "FACILITY" });
  const totalApplications = await Application.countDocuments();
  const totalShifts = await Shift.countDocuments();
  const verifiedWorkers = await WorkerProfile.countDocuments({
    verificationStatus: "VERIFIED",
    isVerified: true
  });
  const filledShifts = await Shift.countDocuments({ status: "FILLED" });

  return {
    range: {
      dateFrom: dateFrom.toISOString(),
      dateTo: dateTo.toISOString()
    },
    summary: {
      totalWorkers,
      totalFacilities,
      totalApplications,
      totalShifts,
      verifiedWorkers,
      shiftCompletionRate: totalShifts ? Math.round((filledShifts / totalShifts) * 100) : 0,
      verificationConversionRate: totalWorkers ? Math.round((verifiedWorkers / totalWorkers) * 100) : 0
    },
    workerGrowth,
    facilityGrowth,
    applicationsOverTime,
    shiftCompletionRates,
    verificationConversionRates
  };
}

export async function getAdminSearchData(filters: {
  page: number;
  pageSize: number;
  q: string;
  entityType?: "ALL" | "WORKER" | "FACILITY" | "SHIFT" | "APPLICATION";
}): Promise<AdminSearchData> {
  await connectDB();

  const search = normalizeSearch(filters.q);

  if (!search) {
    return {
      rows: [],
      total: 0,
      page: filters.page,
      pageSize: filters.pageSize,
      pageCount: 1
    };
  }

  const [workerProfiles, facilityProfiles, shifts, applications] = await Promise.all([
    WorkerProfile.find()
      .populate({ path: "userId", select: "firstName lastName email phone" })
      .select("userId roleType verificationStatus isVerified createdAt")
      .lean(),
    FacilityProfile.find()
      .populate({ path: "userId", select: "firstName lastName email isActive" })
      .select("userId companyName address contactNumber createdAt")
      .lean(),
    Shift.find()
      .populate({
        path: "facilityId",
        select: "companyName userId",
        populate: {
          path: "userId",
          select: "firstName lastName email"
        }
      })
      .select("facilityId date startTime endTime roleRequired status createdAt")
      .lean(),
    Application.find()
      .populate({
        path: "workerId",
        select: "userId",
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
      .select("workerId shiftId status createdAt")
      .lean()
  ]) as unknown as [
    Array<LeanWorkerProfile & { userId?: LeanUser }>,
    Array<LeanFacilityProfile & { userId?: LeanUser }>,
    Array<LeanShift & { facility?: LeanFacilityProfile }>,
    Array<LeanApplication & { workerId?: LeanWorkerProfile; shiftId?: LeanShift }>
  ];

  const rows: AdminSearchRow[] = [];

  if (filters.entityType === "ALL" || filters.entityType === "WORKER") {
    workerProfiles.forEach((profile) => {
      const user = profile.userId as LeanUser | undefined;
      const workerId = String(user?._id ?? profile._id);
      const status = profile.verificationStatus ?? "PENDING";
      if (
        matchesSearch(
          [normalizeName(user), user?.email, user?.phone, status, profile.roleType],
          search
        )
      ) {
        rows.push({
          id: workerId,
          entityType: "WORKER",
          title: normalizeName(user),
          subtitle: `${user?.email ?? ""} • ${status}`,
          status,
          createdAt: toIso(profile.createdAt),
          href: `/dashboard/admin/workers/${workerId}`
        });
      }
    });
  }

  if (filters.entityType === "ALL" || filters.entityType === "FACILITY") {
    facilityProfiles.forEach((profile) => {
      const user = profile.userId as LeanUser | undefined;
      const title = profile.companyName ?? "";
      const facilityId = String(user?._id ?? profile._id);
      const status = user?.isActive === false ? "INACTIVE" : "ACTIVE";
      if (matchesSearch([title, profile.address, profile.contactNumber, normalizeName(user), user?.email], search)) {
        rows.push({
          id: facilityId,
          entityType: "FACILITY",
          title,
          subtitle: `${normalizeName(user)} • ${user?.email ?? ""}`,
          status,
          createdAt: toIso(profile.createdAt),
          href: `/dashboard/admin/facilities/${facilityId}`
        });
      }
    });
  }

  if (filters.entityType === "ALL" || filters.entityType === "SHIFT") {
    shifts.forEach((shift) => {
      const facility = shift.facilityId as LeanFacilityProfile | undefined;
      if (matchesSearch([shift.roleRequired, facility?.companyName, shift.status, shift.notes], search)) {
        rows.push({
          id: String(shift._id),
          entityType: "SHIFT",
          title: `${facility?.companyName ?? "Facility"} • ${shift.roleRequired ?? "Shift"}`,
          subtitle: toShiftLabel(shift),
          status: shift.status ?? "OPEN",
          createdAt: toIso(shift.createdAt),
          href: `/dashboard/admin/shifts/${String(shift._id)}`
        });
      }
    });
  }

  if (filters.entityType === "ALL" || filters.entityType === "APPLICATION") {
    applications.forEach((application) => {
      const workerProfile = application.workerId as LeanWorkerProfile | undefined;
      const workerUser = workerProfile?.userId as LeanUser | undefined;
      const shift = application.shiftId as LeanShift | undefined;
      const facility = shift?.facilityId as LeanFacilityProfile | undefined;

      if (
        matchesSearch(
          [normalizeName(workerUser), workerUser?.email, facility?.companyName, shift?.roleRequired, application.status],
          search
        )
      ) {
        rows.push({
          id: String(application._id),
          entityType: "APPLICATION",
          title: normalizeName(workerUser) || "Application",
          subtitle: `${facility?.companyName ?? "Unknown facility"} • ${toShiftLabel(shift)}`,
          status: application.status ?? "PENDING",
          createdAt: toIso(application.createdAt),
          href: `/dashboard/admin/shifts/${String(shift?._id ?? "")}`
        });
      }
    });
  }

  rows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const { rows: paginatedRows, total, pageCount } = paginate(rows, filters.page, filters.pageSize);

  return {
    rows: paginatedRows,
    total,
    page: filters.page,
    pageSize: filters.pageSize,
    pageCount
  };
}

export async function getAdminSettingsData(adminId: string): Promise<AdminSettingsData | null> {
  await connectDB();

  const user = (await User.findById(adminId).lean()) as LeanUser | null;

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return {
    user: {
      id: String(user._id),
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      email: user.email ?? "",
      phone: user.phone ?? "",
      avatarUrl: user.avatarUrl ?? ""
    },
    notificationPreferences: {
      email: user.notificationPreferences?.email ?? true,
      inApp: user.notificationPreferences?.inApp ?? true,
      sms: user.notificationPreferences?.sms ?? false,
      weeklyDigest: user.notificationPreferences?.weeklyDigest ?? true
    }
  };
}

export async function exportAdminPaymentsCsv(filters: {
  search: string;
  status?: PaymentStatus;
  dateFrom?: string;
  dateTo?: string;
}) {
  const data = await getAdminPaymentListData({
    page: 1,
    pageSize: 5000,
    search: filters.search,
    status: filters.status,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo
  });

  return toCsv(data.rows, [
    { key: "stripeSessionId", label: "Stripe Session ID" },
    { key: "facilityName", label: "Facility" },
    { key: "shiftLabel", label: "Shift" },
    { key: "amountLabel", label: "Amount" },
    { key: "status", label: "Status" },
    { key: "createdAt", label: "Date" }
  ]);
}

export async function exportAdminComplianceCsv(filters: {
  dateFrom?: string;
  dateTo?: string;
}) {
  const data = await getAdminComplianceReportData(filters);

  return toCsv(data.expiringDocuments, [
    { key: "workerName", label: "Worker" },
    { key: "workerEmail", label: "Email" },
    { key: "documentName", label: "Document" },
    { key: "expiresAt", label: "Expires At" },
    { key: "daysRemaining", label: "Days Remaining" },
    { key: "verificationStatus", label: "Verification Status" }
  ]);
}
