"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import {
  facilityProfileSchema,
} from "@/lib/validators/facility";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";

type FacilityProfileFormProps = {
  initialValues: z.input<typeof facilityProfileSchema>;
};

type FacilityProfileFormValues = z.input<typeof facilityProfileSchema>;

export function FacilityProfileForm({ initialValues }: FacilityProfileFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = React.useState(false);

  const form = useForm<FacilityProfileFormValues>({
    resolver: zodResolver(facilityProfileSchema) as never,
    defaultValues: initialValues
  });

  async function onSubmit(values: FacilityProfileFormValues) {
    setIsSaving(true);

    try {
      const response = await fetch("/api/facility/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(values)
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: { message?: string }; message?: string }
        | null;

      if (!response.ok) {
        throw new Error(
          payload?.error?.message ?? payload?.message ?? "Unable to save profile."
        );
      }

      toast.success("Facility profile saved.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save profile.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Form {...form}>
      <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name</FormLabel>
              <FormControl>
                <Input placeholder="Bright Care Ltd" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Textarea placeholder="Company address" rows={4} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contactNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Number</FormLabel>
              <FormControl>
                <Input placeholder="+44 20 0000 0000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button className="w-full" disabled={isSaving} size="lg" type="submit">
          {isSaving ? "Saving profile..." : "Save profile"}
        </Button>
      </form>
    </Form>
  );
}
