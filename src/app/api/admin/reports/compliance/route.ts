import { NextRequest } from "next/server";
import { requireSessionUser } from "@/lib/auth-helpers";
import { jsonError, jsonSuccess, getErrorStatus } from "@/lib/api";
import { adminComplianceReportQuerySchema } from "@/lib/validators/admin";
import {
  exportAdminComplianceCsv,
  getAdminComplianceReportData
} from "@/lib/admin-platform";

export async function GET(request: NextRequest) {
  try {
    const admin = await requireSessionUser(["ADMIN"]);

    if (!admin?.id) {
      return jsonError("Unauthorized.", 401);
    }

    const { searchParams } = new URL(request.url);
    const parsed = adminComplianceReportQuerySchema.safeParse({
      dateFrom: searchParams.get("dateFrom") ?? "",
      dateTo: searchParams.get("dateTo") ?? ""
    });

    if (!parsed.success) {
      return jsonError("Validation failed.", 400, parsed.error.flatten());
    }

    const format = searchParams.get("format");

    if (format === "csv") {
      const csv = await exportAdminComplianceCsv({
        dateFrom: parsed.data.dateFrom || undefined,
        dateTo: parsed.data.dateTo || undefined
      });

      return new Response(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="compliance-report.csv"'
        }
      });
    }

    const data = await getAdminComplianceReportData({
      dateFrom: parsed.data.dateFrom || undefined,
      dateTo: parsed.data.dateTo || undefined
    });

    return jsonSuccess(data);
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to load compliance report.",
      getErrorStatus(error)
    );
  }
}
