import { NextRequest } from "next/server";
import { requireSessionUser } from "@/lib/auth-helpers";
import { jsonError, getErrorStatus } from "@/lib/api";
import { exportAdminPaymentsCsv } from "@/lib/admin-platform";
import { adminPaymentListQuerySchema } from "@/lib/validators/admin";

export async function GET(request: NextRequest) {
  try {
    const admin = await requireSessionUser(["ADMIN"]);

    if (!admin?.id) {
      return jsonError("Unauthorized.", 401);
    }

    const { searchParams } = new URL(request.url);
    const parsed = adminPaymentListQuerySchema.safeParse({
      page: searchParams.get("page"),
      pageSize: searchParams.get("pageSize"),
      search: searchParams.get("search") ?? "",
      status: searchParams.get("status") ?? undefined,
      dateFrom: searchParams.get("dateFrom") ?? undefined,
      dateTo: searchParams.get("dateTo") ?? undefined
    });

    if (!parsed.success) {
      return jsonError("Validation failed.", 400, parsed.error.flatten());
    }

    const csv = await exportAdminPaymentsCsv({
      search: parsed.data.search,
      status:
        parsed.data.status && parsed.data.status !== "ALL"
          ? parsed.data.status
          : undefined,
      dateFrom: parsed.data.dateFrom || undefined,
      dateTo: parsed.data.dateTo || undefined
    });

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="payments.csv"'
      }
    });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to export payments.",
      getErrorStatus(error)
    );
  }
}
