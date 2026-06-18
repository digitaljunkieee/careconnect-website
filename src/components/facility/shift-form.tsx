"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  shiftFormSchema,
  shiftUpdateSchema,
  type ShiftFormInput,
  type ShiftUpdateInput
} from "@/lib/validators/facility";
import { SHIFT_STATUSES, SHIFT_STATUS_LABELS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";

type ShiftFormValues = ShiftFormInput | ShiftUpdateInput;

type FacilityShiftFormProps = {
  initialValues: {
    date: string;
    startTime: string;
    endTime: string;
    hourlyRate: number;
    roleRequired: string;
    notes?: string;
    status?: "OPEN" | "CLOSED" | "FILLED";
  };
  mode: "create" | "edit";
  submitLabel?: string;
  onSuccessRedirect?: string;
  apiUrl: string;
};

function toDateInputValue(value: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

export function FacilityShiftForm({
  initialValues,
  mode,
  submitLabel,
  onSuccessRedirect,
  apiUrl
}: FacilityShiftFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = React.useState(false);
  const schema = mode === "create" ? shiftFormSchema : shiftUpdateSchema;

  const form = useForm<ShiftFormValues>({
    resolver: zodResolver(schema as never),
    defaultValues: {
      date: toDateInputValue(initialValues.date),
      startTime: initialValues.startTime,
      endTime: initialValues.endTime,
      hourlyRate: initialValues.hourlyRate,
      roleRequired: initialValues.roleRequired,
      notes: initialValues.notes ?? "",
      ...(mode === "edit"
        ? { status: initialValues.status ?? "OPEN" }
        : {})
    } as ShiftFormValues
  });

  async function onSubmit(values: ShiftFormValues) {
    setIsSaving(true);

    try {
      const response = await fetch(apiUrl, {
        method: mode === "create" ? "POST" : "PATCH",
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
          payload?.error?.message ?? payload?.message ?? "Unable to save shift."
        );
      }

      toast.success(mode === "create" ? "Shift created." : "Shift updated.");

      if (onSuccessRedirect) {
        router.push(onSuccessRedirect);
      } else {
        router.refresh();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save shift.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Form {...form}>
      <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="hourlyRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hourly Rate</FormLabel>
                <FormControl>
                  <Input
                    min={0}
                    step="0.01"
                    type="number"
                    value={field.value}
                    onChange={(event) => field.onChange(event.target.valueAsNumber)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="roleRequired"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role Required</FormLabel>
              <FormControl>
                <Input placeholder="Support Worker" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Additional shift notes" rows={4} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {mode === "edit" ? (
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {SHIFT_STATUSES.filter((status) => status !== "DRAFT").map(
                      (status) => (
                        <SelectItem key={status} value={status}>
                          {SHIFT_STATUS_LABELS[status]}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}

        <Button className="w-full" disabled={isSaving} size="lg" type="submit">
          {isSaving ? "Saving shift..." : submitLabel ?? "Save shift"}
        </Button>
      </form>
    </Form>
  );
}
