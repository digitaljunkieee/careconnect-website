import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SHIFT_STATUS_LABELS } from "@/lib/constants";
import { FacilityShiftForm } from "@/components/facility/shift-form";
import { getFacilityShiftById } from "@/lib/facility-portal";
import { requireSessionUser } from "@/lib/auth-helpers";

type ShiftEditPageProps = {
  params: Promise<{ shiftId: string }>;
};

export default async function FacilityShiftEditPage({ params }: ShiftEditPageProps) {
  const user = await requireSessionUser(["FACILITY"]);

  if (!user) {
    redirect("/login");
  }

  const { shiftId } = await params;
  const shift = await getFacilityShiftById(user.id, shiftId);

  if (!shift) {
    return (
      <Card className="border-border/70">
        <CardHeader>
          <CardTitle>Shift not found</CardTitle>
          <CardDescription>
            The shift may have been deleted or you may not have access to it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link href="/dashboard/facility/shifts">Back to shifts</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <Card className="border-border/70">
        <CardHeader>
          <CardTitle>Edit Shift</CardTitle>
          <CardDescription>
            Update the shift details and save your changes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FacilityShiftForm
            apiUrl={`/api/facility/shifts/${shiftId}`}
            initialValues={{
              ...shift,
              status: shift.status === "DRAFT" ? "OPEN" : shift.status
            }}
            mode="edit"
            onSuccessRedirect="/dashboard/facility/shifts"
            submitLabel="Save changes"
          />
        </CardContent>
      </Card>

      <Card className="border-border/70">
        <CardHeader>
          <CardTitle>Shift summary</CardTitle>
          <CardDescription>
            Review the current shift details before saving your changes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>Status: <span className="font-medium text-foreground">{SHIFT_STATUS_LABELS[shift.status]}</span></p>
          <p>Role required: <span className="font-medium text-foreground">{shift.roleRequired}</span></p>
          <p>Hourly rate: <span className="font-medium text-foreground">GBP {shift.hourlyRate}</span></p>
        </CardContent>
      </Card>
    </div>
  );
}
