import "server-only";
import { getBackendBaseUrl } from "@/lib/backend-url";
import type {
  SurveyLeadStatus,
  SurveyUserType
} from "@/lib/validators/survey";

export type AdminSurveyLeadRow = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  userType: SurveyUserType;
  location: string;
  notificationConsent: boolean;
  status: SurveyLeadStatus;
  submittedAt: string;
};

export type AdminSurveyLeadDetail = AdminSurveyLeadRow & {
  surveyAnswers: Record<string, unknown>;
  updatedAt: string;
};

export type AdminSurveyLeadListData = {
  rows: AdminSurveyLeadRow[];
  total: number;
  consented: number;
  workerTotal: number;
  facilityTotal: number;
  partnerTotal: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export type SurveyLeadListFilters = {
  page: number;
  pageSize: number;
  search: string;
  userType?: SurveyUserType;
  status?: SurveyLeadStatus;
};

type BackendResponse<T> = {
  success?: boolean;
  data?: T;
  message?: string;
  error?: { message?: string };
};

async function requestAdminBackend<T>(
  accessToken: string,
  path: string,
  init?: RequestInit
) {
  if (!accessToken) {
    const error = new Error("Your admin session has expired. Please sign in again.");
    (error as Error & { statusCode?: number }).statusCode = 401;
    throw error;
  }

  const response = await fetch(`${getBackendBaseUrl()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers
    },
    cache: "no-store"
  });
  const payload = (await response.json().catch(() => null)) as BackendResponse<T> | null;

  if (!response.ok || !payload?.success || !payload.data) {
    const error = new Error(
      payload?.error?.message ?? payload?.message ?? "Unable to load survey leads."
    );
    (error as Error & { statusCode?: number }).statusCode = response.status;
    throw error;
  }

  return payload.data;
}

function buildQuery(filters: Partial<SurveyLeadListFilters>) {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.pageSize) params.set("pageSize", String(filters.pageSize));
  if (filters.search) params.set("search", filters.search);
  if (filters.userType) params.set("userType", filters.userType);
  if (filters.status) params.set("status", filters.status);
  return params;
}

export function getAdminSurveyLeadListData(
  accessToken: string,
  filters: SurveyLeadListFilters
) {
  const query = buildQuery(filters);
  return requestAdminBackend<AdminSurveyLeadListData>(
    accessToken,
    `/api/admin/survey-leads?${query.toString()}`
  );
}

export function getAdminSurveyLeadDetail(accessToken: string, id: string) {
  return requestAdminBackend<AdminSurveyLeadDetail>(
    accessToken,
    `/api/admin/survey-leads/${encodeURIComponent(id)}`
  );
}

export function updateAdminSurveyLeadStatus(
  accessToken: string,
  id: string,
  status: SurveyLeadStatus
) {
  return requestAdminBackend<AdminSurveyLeadDetail>(
    accessToken,
    `/api/admin/survey-leads/${encodeURIComponent(id)}/status`,
    { method: "PATCH", body: JSON.stringify({ status }) }
  );
}

export async function exportAdminSurveyLeadsCsv(
  accessToken: string,
  filters: Pick<SurveyLeadListFilters, "search" | "userType" | "status">
) {
  const query = buildQuery(filters);
  const response = await fetch(
    `${getBackendBaseUrl()}/api/admin/survey-leads/export/csv?${query.toString()}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store"
    }
  );

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as BackendResponse<never> | null;
    const error = new Error(payload?.error?.message ?? "Unable to export survey leads.");
    (error as Error & { statusCode?: number }).statusCode = response.status;
    throw error;
  }

  return response.text();
}
