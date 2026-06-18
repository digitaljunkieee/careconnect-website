import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { jsonError, jsonSuccess } from "@/lib/api";
import { workerShiftBoardQuerySchema } from "@/lib/validators/worker";
import { getWorkerShiftBoardData } from "@/lib/worker-portal";

export async function GET(request: NextRequest) {
  const session = await auth();

  if (session?.user?.role !== "WORKER" || !session.user.id) {
    return jsonError("Unauthorized.", 401);
  }

  const { searchParams } = new URL(request.url);
  const parsed = workerShiftBoardQuerySchema.safeParse({
    page: searchParams.get("page"),
    pageSize: searchParams.get("pageSize"),
    search: searchParams.get("search") ?? "",
    role: searchParams.get("role") ?? "",
    dateFrom: searchParams.get("dateFrom") ?? "",
    dateTo: searchParams.get("dateTo") ?? "",
    minRate: searchParams.get("minRate") ?? undefined,
    maxRate: searchParams.get("maxRate") ?? undefined
  });

  if (!parsed.success) {
    return jsonError("Validation failed.", 400, parsed.error.flatten());
  }

  const data = await getWorkerShiftBoardData(session.user.id, parsed.data);
  if (!data) {
    return jsonError("Worker profile not found.", 404);
  }
  return jsonSuccess(data);
}
