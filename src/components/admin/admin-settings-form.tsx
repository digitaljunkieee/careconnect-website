"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  adminSettingsPasswordSchema,
  adminSettingsProfileSchema
} from "@/lib/validators/admin";
import type { AdminSettingsData } from "@/lib/admin-platform";
import type { Resolver } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardAppearanceCard } from "@/components/layout/dashboard-appearance-card";

type AdminSettingsFormProps = {
  data: AdminSettingsData;
};

type AdminProfileFormValues = {
  firstName: string;
  lastName: string;
  phone: string;
  notificationPreferences: {
    email: boolean;
    inApp: boolean;
    sms: boolean;
    weeklyDigest: boolean;
  };
};

type AdminPasswordFormValues = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

async function parseApiError(response: Response) {
  const payload = (await response.json().catch(() => null)) as
    | { error?: { message?: string }; message?: string }
    | null;

  return payload?.error?.message ?? payload?.message ?? "Unable to save settings.";
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm text-destructive">{message}</p>;
}

export function AdminSettingsForm({ data }: AdminSettingsFormProps) {
  const router = useRouter();
  const [isProfileSaving, setIsProfileSaving] = React.useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = React.useState(false);

  const profileForm = useForm<AdminProfileFormValues>({
    resolver: zodResolver(adminSettingsProfileSchema) as unknown as Resolver<AdminProfileFormValues>,
    defaultValues: {
      firstName: data.user.firstName,
      lastName: data.user.lastName,
      phone: data.user.phone,
      notificationPreferences: data.notificationPreferences
    }
  });

  const passwordForm = useForm<AdminPasswordFormValues>({
    resolver: zodResolver(adminSettingsPasswordSchema) as unknown as Resolver<AdminPasswordFormValues>,
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  });

  async function saveProfile(values: AdminProfileFormValues) {
    setIsProfileSaving(true);

    try {
      const response = await fetch("/api/admin/settings/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(values)
      });

      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }

      toast.success("Admin profile updated.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save settings.");
    } finally {
      setIsProfileSaving(false);
    }
  }

  async function savePassword(values: AdminPasswordFormValues) {
    setIsPasswordSaving(true);

    try {
      const response = await fetch("/api/admin/settings/password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(values)
      });

      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }

      toast.success("Password updated.");
      passwordForm.reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update password.");
    } finally {
      setIsPasswordSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <DashboardAppearanceCard />

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>Update Admin Profile</CardTitle>
            <CardDescription>Keep your contact details and notification preferences current.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={profileForm.handleSubmit(saveProfile)}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="firstName">
                    First name
                  </label>
                  <Input id="firstName" {...profileForm.register("firstName")} />
                  <FieldError message={profileForm.formState.errors.firstName?.message} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="lastName">
                    Last name
                  </label>
                  <Input id="lastName" {...profileForm.register("lastName")} />
                  <FieldError message={profileForm.formState.errors.lastName?.message} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="phone">
                  Phone
                </label>
                <Input id="phone" {...profileForm.register("phone")} />
                <FieldError message={profileForm.formState.errors.phone?.message} />
              </div>

              <div className="space-y-3 rounded-3xl border border-border/70 bg-muted/25 p-4">
                <p className="text-sm font-medium">Notification preferences</p>
                <div className="grid gap-3 md:grid-cols-2">
                  {([
                    ["email", "Email updates"],
                    ["inApp", "In-app notifications"],
                    ["sms", "SMS alerts"],
                    ["weeklyDigest", "Weekly digest"]
                  ] as const).map(([key, label]) => {
                    const field = `notificationPreferences.${key}` as const;

                    return (
                      <label key={key} className="flex items-center gap-3 text-sm">
                        <input
                          className="h-4 w-4 rounded border-border"
                          type="checkbox"
                          {...profileForm.register(field)}
                        />
                        <span>{label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <Button className="rounded-2xl" disabled={isProfileSaving} type="submit">
                {isProfileSaving ? "Saving..." : "Save profile"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Use a strong password and confirm it before saving.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={passwordForm.handleSubmit(savePassword)}>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="currentPassword">
                  Current password
                </label>
                <Input
                  id="currentPassword"
                  type="password"
                  {...passwordForm.register("currentPassword")}
                />
                <FieldError message={passwordForm.formState.errors.currentPassword?.message} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="newPassword">
                  New password
                </label>
                <Input id="newPassword" type="password" {...passwordForm.register("newPassword")} />
                <FieldError message={passwordForm.formState.errors.newPassword?.message} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="confirmPassword">
                  Confirm new password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...passwordForm.register("confirmPassword")}
                />
                <FieldError message={passwordForm.formState.errors.confirmPassword?.message} />
              </div>
              <Button className="rounded-2xl" disabled={isPasswordSaving} type="submit">
                {isPasswordSaving ? "Updating..." : "Change password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
