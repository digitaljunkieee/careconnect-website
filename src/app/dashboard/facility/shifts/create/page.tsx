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
import { FacilityShiftForm } from "@/components/facility/shift-form";
import { getFacilityProfileData } from "@/lib/facility-portal";
import { requireSessionUser } from "@/lib/auth-helpers";

export default async function FacilityCreateShiftPage() {
  const user = await requireSessionUser(["FACILITY"]);

  if (!user) {
    redirect("/login");
  }

  const profile = await getFacilityProfileData(user.id);

  if (!profile) {
    return (
      <Card className="border-border/70">
        <CardHeader>
          <CardTitle>Create shift</CardTitle>
          <CardDescription>
            Complete your facility profile before posting shifts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/dashboard/facility/profile">Go to profile</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <Card className="border-border/70">
        <CardHeader>
          <CardTitle>Create Shift</CardTitle>
          <CardDescription>
            Publish a live shift and let verified workers apply right away.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FacilityShiftForm
            apiUrl="/api/facility/shifts"
            initialValues={{
              date: new Date().toISOString(),
              startTime: "",
              endTime: "",
              hourlyRate: 0,
              roleRequired: "",
              notes: ""
            }}
            mode="create"
            onSuccessRedirect="/dashboard/facility/shifts"
            submitLabel="Create shift"
          />
        </CardContent>
      </Card>
    </div>
  );
}
