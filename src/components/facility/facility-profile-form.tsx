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
  FormDescription,
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
  "border-white/8 bg-[#15243A] text-white placeholder:text-white/35 shadow-none focus-visible:border-[#2bb9ff] focus-visible:ring-2 focus-visible:ring-[#2bb9ff]/45 focus-visible:ring-offset-0";

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
        <div className="grid gap-5 md:grid-cols-2">
          <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-white/80">
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
                <FormLabel className="text-sm font-medium text-white/80">Website</FormLabel>
                <FormControl>
                  <Input className={fieldClassName} placeholder="careconnect.co.uk" {...field} />
                </FormControl>
                <FormDescription className="text-xs text-white/45">
                  Keep it short and current.
                </FormDescription>
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
              <FormLabel className="text-sm font-medium text-white/80">Address</FormLabel>
              <FormControl>
                <Textarea
                  className={fieldClassName}
                  placeholder="Company address"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-5 md:grid-cols-2">
          <FormField
            control={form.control}
            name="contactNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-white/80">
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
                <FormLabel className="text-sm font-medium text-white/80">
                  Facility Type
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value || undefined}>
                  <FormControl>
                    <SelectTrigger className={fieldClassName}>
                      <SelectValue placeholder="Choose facility type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="border-white/8 bg-[#101D31] text-white shadow-[0_24px_60px_rgba(4,14,38,0.45)]">
                    {FACILITY_TYPE_OPTIONS.map((option) => (
                      <SelectItem
                        key={option}
                        className="focus:bg-white/5 focus:text-white"
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
              <FormLabel className="text-sm font-medium text-white/80">Description</FormLabel>
              <FormControl>
                <Textarea
                  className={fieldClassName}
                  placeholder="Describe your setting, services, and what makes your facility stand out."
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
            className="h-12 rounded-2xl bg-[#076c82] px-6 text-white shadow-[0_18px_40px_rgba(7,108,130,0.35)] transition hover:bg-[#13d9cb] hover:text-[#040e26]"
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
