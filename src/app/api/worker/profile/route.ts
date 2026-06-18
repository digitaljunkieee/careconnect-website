import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { jsonError, jsonSuccess, getErrorStatus } from "@/lib/api";
import { workerProfileSchema } from "@/lib/validators/worker";
import { getWorkerProfileData } from "@/lib/worker-portal";
import { saveWorkerProfile } from "@/lib/workflows";

export async function GET() {
  const session = await auth();

  if (session?.user?.role !== "WORKER" || !session.user.id) {
    return jsonError("Unauthorized.", 401);
  }

  const profile = await getWorkerProfileData(session.user.id);

  if (!profile) {
    return jsonError("Worker profile not found.", 404);
  }

  return jsonSuccess(profile);
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (session?.user?.role !== "WORKER" || !session.user.id) {
      return jsonError("Unauthorized.", 401);
    }

    const body = await request.json();
    const parsed = workerProfileSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError("Validation failed.", 400, parsed.error.flatten());
    }

    const profile = await saveWorkerProfile(session.user.id, parsed.data);

    return jsonSuccess(profile, "Worker profile updated.");
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to update worker profile.",
      getErrorStatus(error)
    );
  }
}
