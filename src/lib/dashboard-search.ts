import { getAdminSearchData } from "@/lib/admin-platform";
import { getFacilityApplicantListData, getFacilityProfileData, getFacilityShiftListData } from "@/lib/facility-portal";
import {
  getWorkerApplicationsData,
  getWorkerAssignmentsData,
  getWorkerProfileData,
  getWorkerShiftBoardData
} from "@/lib/worker-portal";
import type { Role, ApplicationStatus, ShiftStatus } from "@/lib/constants";

export type DashboardSearchResult = {
  id: string;
  title: string;
  subtitle: string;
  meta?: string;
  href: string;
};

export type DashboardSearchSection = {
  key: string;
  title: string;
  description: string;
  emptyLabel: string;
  results: DashboardSearchResult[];
};

export type DashboardSearchData = {
  query: string;
  sections: DashboardSearchSection[];
};

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

export async function getDashboardSearchData(
  role: Role,
  userId: string,
  query: string
): Promise<DashboardSearchData> {
  const search = normalizeSearch(query);
  const encodedQuery = encodeURIComponent(query);

  if (!search) {
    return { query, sections: [] };
  }

  if (role === "ADMIN") {
    const data = await getAdminSearchData({
      page: 1,
      pageSize: 20,
      q: query,
      entityType: "ALL"
    });

    return {
      query,
      sections: [
        {
          key: "admin",
          title: "Results",
          description: "Workers, facilities, shifts, and applications that match your search.",
          emptyLabel: "No results found for this query.",
          results: data.rows.map((row) => ({
            id: `${row.entityType}-${row.id}`,
            title: row.title,
            subtitle: row.subtitle,
            meta: row.status,
            href: row.href
          }))
        }
      ]
    };
  }

  if (role === "WORKER") {
    const [shiftBoard, applications, assignments, profile] = await Promise.all([
      getWorkerShiftBoardData(userId, {
        search: query,
        role: "",
        page: 1,
        pageSize: 12
      }),
      getWorkerApplicationsData(userId, {
        page: 1,
        pageSize: 20
      }),
      getWorkerAssignmentsData(userId),
      getWorkerProfileData(userId)
    ]);

    const applicationRows = (applications?.rows ?? []).filter((row) =>
      matchesSearch(
        [row.facilityName, row.roleRequired, row.status, row.shiftDate, row.hourlyRateLabel],
        search
      )
    );

    const assignmentRows = [
      ...(assignments?.upcoming ?? []),
      ...(assignments?.completed ?? [])
    ].filter((row) => matchesSearch([row.facilityName, row.status, row.date, row.hours], search));

    const profileRows =
      profile && matchesSearch([profile.firstName, profile.lastName, profile.email, profile.phone], search)
        ? [
            {
              id: profile.userId,
              title: `${profile.firstName} ${profile.lastName}`.trim() || "Profile",
              subtitle: profile.email,
              meta: profile.roleType,
              href: "/dashboard/worker/profile"
            }
          ]
        : [];

    return {
      query,
      sections: [
        {
          key: "worker-shifts",
          title: "Shifts",
          description: "Open shifts that match your search.",
          emptyLabel: "No matching shifts found.",
          results: (shiftBoard?.rows ?? []).map((row) => ({
            id: row.id,
            title: row.facilityName,
            subtitle: `${row.roleRequired} - ${row.date}`,
            meta: `${row.hourlyRateLabel}${row.alreadyApplied ? " - Applied" : ""}`,
            href: `/dashboard/worker/shifts?search=${encodedQuery}`
          }))
        },
        {
          key: "worker-applications",
          title: "Applications",
          description: "Applications that match your search.",
          emptyLabel: "No matching applications found.",
          results: applicationRows.map((row) => ({
            id: row.id,
            title: row.facilityName,
            subtitle: `${row.roleRequired} - ${row.shiftDate}`,
            meta: row.status,
            href: "/dashboard/worker/applications"
          }))
        },
        {
          key: "worker-assignments",
          title: "Assignments",
          description: "Upcoming or completed work that matches your search.",
          emptyLabel: "No matching assignments found.",
          results: assignmentRows.map((row) => ({
            id: row.id,
            title: row.facilityName,
            subtitle: row.hours,
            meta: row.status,
            href: "/dashboard/worker/assignments"
          }))
        },
        {
          key: "worker-profile",
          title: "Profile",
          description: "Your profile details and verification data.",
          emptyLabel: "No matching profile data found.",
          results: profileRows
        }
      ]
    };
  }

  const [shifts, applicants, profile] = await Promise.all([
    getFacilityShiftListData(userId, {
      page: 1,
      pageSize: 12,
      search: query,
      status: undefined as ShiftStatus | undefined
    }),
    getFacilityApplicantListData(userId, {
      page: 1,
      pageSize: 20,
      search: query,
      applicationStatus: undefined as ApplicationStatus | undefined,
      verificationStatus: undefined
    }),
    getFacilityProfileData(userId)
  ]);

  const profileRows =
    profile && matchesSearch([profile.companyName, profile.address, profile.contactNumber, profile.email], search)
      ? [
          {
            id: profile.userId,
            title: profile.companyName,
            subtitle: profile.email,
            meta: profile.contactNumber || "Profile",
            href: "/dashboard/facility/profile"
          }
        ]
      : [];

  return {
    query,
    sections: [
      {
        key: "facility-shifts",
        title: "Shifts",
        description: "Shift listings that match your search.",
        emptyLabel: "No matching shifts found.",
          results: (shifts?.rows ?? []).map((row) => ({
            id: row.id,
            title: row.roleRequired,
            subtitle: `${row.date} - ${row.startTime} to ${row.endTime}`,
            meta: `${row.hourlyRateLabel} - ${row.status}`,
          href: `/dashboard/facility/shifts?search=${encodedQuery}`
          }))
        },
      {
        key: "facility-applicants",
        title: "Applicants",
        description: "Care professionals and applications that match your search.",
        emptyLabel: "No matching applicants found.",
          results: (applicants?.rows ?? []).map((row) => ({
            id: row.id,
            title: row.workerName,
            subtitle: row.shiftLabel ?? row.roleType,
            meta: `${row.applicationStatus} - ${row.verificationStatus}`,
            href: `/dashboard/facility/applicants?search=${encodedQuery}`
          }))
        },
      {
        key: "facility-profile",
        title: "Profile",
        description: "Your facility details and contact information.",
        emptyLabel: "No matching profile data found.",
        results: profileRows
      }
    ]
  };
}
