import { createHttpError } from "@/lib/http-error";

type EbcConfig = {
  baseUrl: string;
  apiKey: string;
  webhookSecret: string;
};

export type EbcDocumentPayload = {
  name: string;
  publicId: string;
  secureUrl: string;
  resourceType?: string;
};

export type EbcApplicantInput = {
  workerProfileId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  niNumber?: string;
  shareCode?: string;
  roleType?: string;
  addressHistory?: string[];
  documents?: EbcDocumentPayload[];
};

export type EbcApplicantResponse = {
  applicantId: string;
  status: "PENDING" | "IN_REVIEW" | "VERIFIED" | "REJECTED" | "MORE_INFO_REQUIRED";
  submittedAt: string;
  raw: unknown;
};

export type EbcWorkerDetailsResponse = {
  applicantId: string;
  status: "PENDING" | "IN_REVIEW" | "VERIFIED" | "REJECTED" | "MORE_INFO_REQUIRED";
  raw: unknown;
};

type EbcApiResponse = {
  id?: string;
  applicantId?: string;
  status?: string;
  submittedAt?: string;
  data?: {
    id?: string;
    applicantId?: string;
    status?: string;
    submittedAt?: string;
  };
};

function getEbcConfig(): EbcConfig {
  const baseUrl = process.env.EBC_API_BASE_URL;
  const apiKey = process.env.EBC_API_KEY;
  const webhookSecret = process.env.EBC_WEBHOOK_SECRET;

  if (!baseUrl) {
    throw new Error("Missing EBC_API_BASE_URL environment variable.");
  }

  if (!apiKey) {
    throw new Error("Missing EBC_API_KEY environment variable.");
  }

  if (!webhookSecret) {
    throw new Error("Missing EBC_WEBHOOK_SECRET environment variable.");
  }

  return {
    baseUrl: baseUrl.replace(/\/+$/, ""),
    apiKey,
    webhookSecret
  };
}

function getEbcHeaders(apiKey: string) {
  return {
    authorization: `Bearer ${apiKey}`,
    "x-api-key": apiKey,
    "content-type": "application/json",
    accept: "application/json"
  };
}

function normalizeEbcStatus(status?: string) {
  const normalized = status?.trim().toUpperCase();

  switch (normalized) {
    case "VERIFIED":
      return "VERIFIED" as const;
    case "REJECTED":
      return "REJECTED" as const;
    case "MORE_INFO_REQUIRED":
    case "ADDITIONAL_INFORMATION_REQUESTED":
      return "MORE_INFO_REQUIRED" as const;
    case "IN_REVIEW":
      return "IN_REVIEW" as const;
    default:
      return "PENDING" as const;
  }
}

function extractApplicantId(payload: EbcApiResponse) {
  return (
    payload.applicantId ??
    payload.id ??
    payload.data?.applicantId ??
    payload.data?.id ??
    ""
  );
}

function extractSubmittedAt(payload: EbcApiResponse) {
  return payload.submittedAt ?? payload.data?.submittedAt ?? new Date().toISOString();
}

async function parseEbcResponse(response: Response) {
  const text = await response.text();

  if (!response.ok) {
    const error = new Error(text || `EBC request failed with status ${response.status}.`);
    (error as Error & { statusCode?: number }).statusCode = 502;
    throw error;
  }

  try {
    return text ? (JSON.parse(text) as EbcApiResponse) : {};
  } catch {
    return {};
  }
}

export async function createEbcApplicant(
  input: EbcApplicantInput
): Promise<EbcApplicantResponse> {
  const config = getEbcConfig();
  const response = await fetch(`${config.baseUrl}/applicants`, {
    method: "POST",
    headers: getEbcHeaders(config.apiKey),
    body: JSON.stringify({
      workerProfileId: input.workerProfileId,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone ?? "",
      niNumber: input.niNumber ?? "",
      shareCode: input.shareCode ?? "",
      roleType: input.roleType ?? "CARE_SUPPORT",
      addressHistory: input.addressHistory ?? [],
      documents: input.documents ?? []
    })
  });

  const payload = await parseEbcResponse(response);
  const applicantId = extractApplicantId(payload);

  if (!applicantId) {
    throw createHttpError(
      502,
      "EBC applicant creation succeeded but did not return an applicant ID.",
      payload
    );
  }

  return {
    applicantId,
    status: normalizeEbcStatus(payload.status ?? payload.data?.status),
    submittedAt: extractSubmittedAt(payload),
    raw: payload
  };
}

export async function submitEbcWorkerDetails(
  applicantId: string,
  input: EbcApplicantInput
): Promise<EbcWorkerDetailsResponse> {
  const config = getEbcConfig();
  const response = await fetch(`${config.baseUrl}/applicants/${applicantId}/details`, {
    method: "POST",
    headers: getEbcHeaders(config.apiKey),
    body: JSON.stringify({
      workerProfileId: input.workerProfileId,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone ?? "",
      niNumber: input.niNumber ?? "",
      shareCode: input.shareCode ?? "",
      roleType: input.roleType ?? "CARE_SUPPORT",
      addressHistory: input.addressHistory ?? [],
      documents: input.documents ?? []
    })
  });

  const payload = await parseEbcResponse(response);
  const responseApplicantId = extractApplicantId(payload) || applicantId;

  return {
    applicantId: responseApplicantId,
    status: normalizeEbcStatus(payload.status ?? payload.data?.status),
    raw: payload
  };
}

export function getEbcWebhookSecret() {
  return getEbcConfig().webhookSecret;
}
