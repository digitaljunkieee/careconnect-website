import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { jsonError, jsonSuccess, getErrorStatus } from "@/lib/api";
import {
  shiftFormSchema,
  shiftListQuerySchema
} from "@/lib/validators/facility";
import {
  createShiftForFacility,
  getFacilityShiftListData
} from "@/lib/facility-portal";

export async function GET(request: NextRequest) {
  const session = await auth();

  if (session?.user?.role !== "FACILITY" || !session.user.id) {
    return jsonError("Unauthorized.", 401);
  }

  const { searchParams } = new URL(request.url);
  const parsed = shiftListQuerySchema.safeParse({
    page: searchParams.get("page"),
    pageSize: searchParams.get("pageSize"),
    status: searchParams.get("status") ?? undefined,
    search: searchParams.get("search") ?? ""
  });

  if (!parsed.success) {
    return jsonError("Validation failed.", 400, parsed.error.flatten());
  }

  const data = await getFacilityShiftListData(session.user.id, parsed.data);

  if (!data) {
    return jsonError("Facility profile not found.", 404);
  }

  return jsonSuccess(data);
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (session?.user?.role !== "FACILITY" || !session.user.id) {
      return jsonError("Unauthorized.", 401);
    }

    const body = await request.json();
    const parsed = shiftFormSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError("Validation failed.", 400, parsed.error.flatten());
    }

    const shift = await createShiftForFacility(session.user.id, parsed.data);

    return jsonSuccess(shift, "Shift created successfully.", 201);
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to create shift.",
      getErrorStatus(error)
    );
  }
}
