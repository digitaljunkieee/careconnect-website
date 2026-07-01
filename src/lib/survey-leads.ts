import type { FilterQuery } from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { toCsv } from "@/lib/csv";
import { clampNumber, getSkip } from "@/lib/pagination";
import SurveyLead, { type SurveyLeadDocument } from "@/models/SurveyLead";
import type { SurveyUserType } from "@/lib/validators/survey";

type LeanSurveyLead = Pick<
  SurveyLeadDocument,
  | "_id"
  | "fullName"
  | "email"
  | "phone"
  | "userType"
  | "location"
  | "notificationConsent"
  | "status"
  | "createdAt"
>;

export type AdminSurveyLeadRow = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  userType: SurveyUserType;
  location: string;
  notificationConsent: boolean;
  status: "WAITLISTED";
  submittedAt: string;
};

export type SurveyLeadListFilters = {
  page: number;
  pageSize: number;
  search: string;
  userType?: SurveyUserType;
};

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildFilter(filters: Pick<SurveyLeadListFilters, "search" | "userType">) {
  const filter: FilterQuery<SurveyLeadDocument> = {};
  const search = filters.search.trim();

  if (filters.userType) {
    filter.userType = filters.userType;
  }

  if (search) {
    const pattern = new RegExp(escapeRegex(search), "i");
    filter.$or = [
      { fullName: pattern },
      { email: pattern },
      { phone: pattern },
      { location: pattern }
    ];
  }

  return filter;
}

function toRow(lead: LeanSurveyLead): AdminSurveyLeadRow {
  return {
    id: String(lead._id),
    fullName: lead.fullName,
    email: lead.email,
    phone: lead.phone ?? "",
    userType: lead.userType,
    location: lead.location,
    notificationConsent: Boolean(lead.notificationConsent),
    status: lead.status,
    submittedAt: lead.createdAt.toISOString()
  };
}

export async function getAdminSurveyLeadListData(filters: SurveyLeadListFilters) {
  await connectDB();

  const query = buildFilter(filters);
  const [total, consented, userTypeCounts] = await Promise.all([
    SurveyLead.countDocuments(query),
    SurveyLead.countDocuments({ ...query, notificationConsent: true }),
    SurveyLead.aggregate<{ _id: SurveyUserType; count: number }>([
      { $match: query },
      { $group: { _id: "$userType", count: { $sum: 1 } } }
    ])
  ]);
  const pageCount = Math.max(Math.ceil(total / filters.pageSize), 1);
  const page = clampNumber(filters.page, 1, pageCount);
  const leads = (await SurveyLead.find(query)
    .sort({ createdAt: -1 })
    .skip(getSkip(page, filters.pageSize))
    .limit(filters.pageSize)
    .lean()) as LeanSurveyLead[];
  const counts = Object.fromEntries(userTypeCounts.map((item) => [item._id, item.count]));

  return {
    rows: leads.map(toRow),
    total,
    consented,
    workerTotal: counts.CARE_WORKER ?? 0,
    facilityTotal: counts.CARE_FACILITY ?? 0,
    partnerTotal: counts.INTERESTED_PARTNER ?? 0,
    page,
    pageSize: filters.pageSize,
    pageCount
  };
}

export async function exportAdminSurveyLeadsCsv(filters: {
  search: string;
  userType?: SurveyUserType;
}) {
  await connectDB();

  const leads = (await SurveyLead.find(buildFilter(filters))
    .sort({ createdAt: -1 })
    .limit(10000)
    .lean()) as LeanSurveyLead[];
  const rows = leads.map(toRow).map((row) => ({
    ...row,
    userType: row.userType.replaceAll("_", " "),
    notificationConsent: row.notificationConsent ? "Yes" : "No"
  }));

  return toCsv(rows, [
    { key: "fullName", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "userType", label: "User Type" },
    { key: "location", label: "Location" },
    { key: "notificationConsent", label: "Notification Consent" },
    { key: "submittedAt", label: "Submitted Date" },
    { key: "status", label: "Status" }
  ]);
}
