import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { jsonError, jsonSuccess, getErrorStatus } from "@/lib/api";
import {
  applyToShiftSchema,
  workerApplicationQuerySchema
} from "@/lib/validators/worker";
import {
  getWorkerApplicationsData,
  applyWorkerToShift
} from "@/lib/worker-portal";

export async function GET(request: NextRequest) {
  const session = await auth();

  if (session?.user?.role !== "WORKER" || !session.user.id) {
    return jsonError("Unauthorized.", 401);
  }

  const { searchParams } = new URL(request.url);
  const parsed = workerApplicationQuerySchema.safeParse({
    page: searchParams.get("page"),
    pageSize: searchParams.get("pageSize"),
    status: searchParams.get("status") ?? undefined
  });

  if (!parsed.success) {
    return jsonError("Validation failed.", 400, parsed.error.flatten());
  }

  const data = await getWorkerApplicationsData(session.user.id, parsed.data);
  if (!data) {
    return jsonError("Worker profile not found.", 404);
  }

  return jsonSuccess(data);
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (session?.user?.role !== "WORKER" || !session.user.id) {
      return jsonError("Unauthorized.", 401);
    }

    const body = await request.json();
    const parsed = applyToShiftSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError("Validation failed.", 400, parsed.error.flatten());
    }

    const result = await applyWorkerToShift(session.user.id, parsed.data.shiftId);
    return jsonSuccess(result, "Application submitted.", 201);
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to apply to shift.",
      getErrorStatus(error)
    );
  }
}
