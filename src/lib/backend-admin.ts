import { getBackendBaseUrl } from "@/lib/backend-url";

type BackendResponse<T> = {
  success?: boolean;
  data?: T;
  message?: string;
  error?: { message?: string };
};

export async function assignWorkerThroughBackend(
  accessToken: string,
  shiftId: string,
  input: { workerId: string; notes?: string }
) {
  if (!accessToken) {
    const error = new Error("Your admin session is missing a backend access token. Please sign in again.");
    (error as Error & { statusCode?: number }).statusCode = 401;
    throw error;
  }

  const response = await fetch(
    `${getBackendBaseUrl()}/api/admin/shifts/${encodeURIComponent(shiftId)}/assign-worker`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(input),
      cache: "no-store"
    }
  );
  const payload = (await response.json().catch(() => null)) as
    | BackendResponse<{
        shiftId: string;
        assignmentId: string;
        applicationId: string;
        workerId: string;
      }>
    | null;

  if (!response.ok || !payload?.success || !payload.data) {
    const error = new Error(
      payload?.error?.message ?? payload?.message ?? "Unable to assign worker."
    );
    (error as Error & { statusCode?: number }).statusCode = response.status;
    throw error;
  }

  return payload.data;
}
