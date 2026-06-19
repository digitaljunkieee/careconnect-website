"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { facilityProfileSchema } from "@/lib/validators/facility";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

const FACILITY_TYPE_OPTIONS = [
  "Care Home",
  "Home Care",
  "Dementia Care",
  "Respite Support",
  "Nursing Care",
  "Supported Living"
] as const;

type FacilityProfileFormProps = {
  initialValues: z.input<typeof facilityProfileSchema>;
};

type FacilityProfileFormValues = z.input<typeof facilityProfileSchema>;

const fieldClassName =
  "border-border/70 bg-background/80 text-foreground placeholder:text-muted-foreground shadow-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-0";

export function FacilityProfileForm({ initialValues }: FacilityProfileFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = React.useState(false);

  const form = useForm<FacilityProfileFormValues>({
    resolver: zodResolver(facilityProfileSchema) as never,
    defaultValues: initialValues
  });

  React.useEffect(() => {
    form.reset(initialValues);
  }, [form, initialValues]);

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
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-foreground">
                  Company Name
                </FormLabel>
                <FormControl>
                  <Input className={fieldClassName} placeholder="Bright Care Ltd" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-foreground">Website</FormLabel>
                <FormControl>
                  <Input className={fieldClassName} placeholder="careconnect.co.uk" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-foreground">Address</FormLabel>
              <FormControl>
                <Textarea
                  className={fieldClassName}
                  placeholder="Enter company address"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="contactNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-foreground">
                  Contact Number
                </FormLabel>
                <FormControl>
                  <Input className={fieldClassName} placeholder="+44 20 0000 0000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="facilityType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-foreground">
                  Facility Type
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value || undefined}>
                  <FormControl>
                    <SelectTrigger className={fieldClassName}>
                      <SelectValue placeholder="Choose facility type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="border-border/70 bg-popover text-popover-foreground shadow-lg">
                    {FACILITY_TYPE_OPTIONS.map((option) => (
                      <SelectItem
                        key={option}
                        className="focus:bg-accent focus:text-accent-foreground"
                        value={option}
                      >
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-foreground">Description</FormLabel>
              <FormControl>
                <Textarea
                  className={fieldClassName}
                  placeholder="Tell workers about your facility, services, and shift environment."
                  rows={5}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
          <Button
            className="h-12 rounded-2xl px-6 shadow-none hover:translate-y-0"
            disabled={isSaving}
            type="submit"
          >
            {isSaving ? "Saving changes..." : "Save changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
