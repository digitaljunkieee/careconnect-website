"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import {
  WORKER_ROLE_TYPE_LABELS,
  WORKER_ROLE_TYPES
} from "@/lib/constants";
import {
  workerProfileSchema,
} from "@/lib/validators/worker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";

type WorkerProfileFormProps = {
  initialValues: z.input<typeof workerProfileSchema>;
};

type WorkerProfileFormValues = z.input<typeof workerProfileSchema>;

export function WorkerProfileForm({ initialValues }: WorkerProfileFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = React.useState(false);

  const form = useForm<WorkerProfileFormValues>({
    resolver: zodResolver(workerProfileSchema) as never,
    defaultValues: initialValues
  });

  async function onSubmit(values: WorkerProfileFormValues) {
    setIsSaving(true);

    try {
      const response = await fetch("/api/worker/profile", {
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

      toast.success("Worker profile saved.");
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
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="+44 7000 000000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="niNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>National Insurance Number</FormLabel>
                <FormControl>
                  <Input placeholder="QQ123456C" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="addressHistory"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address History</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter previous addresses, one per line."
                  rows={6}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="shareCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>UKVI Share Code</FormLabel>
                <FormControl>
                  <Input placeholder="S123-456-789" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="roleType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {WORKER_ROLE_TYPES.map((roleType) => (
                      <SelectItem key={roleType} value={roleType}>
                        {WORKER_ROLE_TYPE_LABELS[roleType]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button className="w-full" disabled={isSaving} size="lg" type="submit">
          {isSaving ? "Saving profile..." : "Save profile"}
        </Button>
      </form>
    </Form>
  );
}
