"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, Clock3, Search } from "lucide-react";
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
import {
  SHIFT_ROLE_CATEGORIES,
  inferShiftRoleFields
} from "@/lib/shift-roles";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
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

type RoleCategoryDropdownProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "value" | "onChange"
> & {
  value: string;
  onChange: (value: string) => void;
  onClearCustomRole: () => void;
};

const RoleCategoryDropdown = React.forwardRef<
  HTMLButtonElement,
  RoleCategoryDropdownProps
>(function RoleCategoryDropdown(
  { className, value, onChange, onClearCustomRole, type, ...buttonProps },
  ref
) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const searchInputRef = React.useRef<HTMLInputElement | null>(null);

  const filteredOptions = React.useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return SHIFT_ROLE_CATEGORIES;
    }

    return SHIFT_ROLE_CATEGORIES.filter((role) => role.toLowerCase().includes(query));
  }, [search]);

  React.useEffect(() => {
    if (!open) {
      return;
    }

    window.requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });
  }, [open]);

  return (
    <DropdownMenu
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);

        if (!nextOpen) {
          setSearch("");
        }
      }}
      open={open}
    >
      <DropdownMenuTrigger asChild>
        <Button
          className={cn(
            "h-11 w-full justify-between border-border/80 bg-background/80 px-4 font-normal text-left text-sm shadow-none transition hover:border-primary/40 hover:bg-accent/40",
            !value && "text-muted-foreground",
            className
          )}
          ref={ref}
          type={type ?? "button"}
          variant="outline"
          {...buttonProps}
        >
          <span className="truncate">{value || "Select a role"}</span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="w-[min(31rem,calc(100vw-2rem))] border-border/70 bg-background p-2 shadow-2xl"
        collisionPadding={12}
      >
        <div className="relative px-1 pb-2 pt-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-10 border-border/70 bg-background/90 pl-10"
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
              }
            }}
            placeholder="Search roles"
            ref={searchInputRef}
            value={search}
          />
        </div>

        <div className="max-h-64 overflow-y-auto px-1 pb-1">
          {filteredOptions.length ? (
            filteredOptions.map((role) => (
              <DropdownMenuItem
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-sm",
                  value === role && "bg-accent/70 text-accent-foreground"
                )}
                key={role}
                onSelect={() => {
                  onChange(role);
                  if (role !== "Other Role") {
                    onClearCustomRole();
                  }
                  setOpen(false);
                }}
              >
                <span className="pr-3">{role}</span>
                {value === role ? <Check className="h-4 w-4 shrink-0 text-primary" /> : null}
              </DropdownMenuItem>
            ))
          ) : (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              No roles found.
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
RoleCategoryDropdown.displayName = "RoleCategoryDropdown";

type FacilityShiftFormProps = {
  initialValues: {
    date: string;
    startTime: string;
    endTime: string;
    hourlyRate: number;
    roleCategory?: string;
    customRole?: string;
    roleRequired?: string;
    requiredQualifications?: string;
    notes?: string;
    status?: "OPEN" | "CLOSED" | "FILLED";
  };
  mode: "create" | "edit";
  submitLabel?: string;
  onSuccessRedirect?: string;
  onSuccess?: () => void;
  apiUrl: string;
  layout?: "page" | "modal";
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
  onSuccess,
  apiUrl,
  layout = "page"
}: FacilityShiftFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = React.useState(false);
  const schema = mode === "create" ? shiftFormSchema : shiftUpdateSchema;
  const isModalLayout = layout === "modal";
  const roleDefaults = inferShiftRoleFields(initialValues);

  const form = useForm<ShiftFormValues>({
    resolver: zodResolver(schema as never),
    defaultValues: {
      date: toDateInputValue(initialValues.date),
      startTime: initialValues.startTime,
      endTime: initialValues.endTime,
      hourlyRate: initialValues.hourlyRate,
      roleCategory: initialValues.roleCategory ?? roleDefaults.roleCategory ?? "",
      customRole: initialValues.customRole ?? roleDefaults.customRole ?? "",
      requiredQualifications: initialValues.requiredQualifications ?? "",
      notes: initialValues.notes ?? "",
      ...(mode === "edit"
        ? { status: initialValues.status ?? "OPEN" }
        : {})
      } as ShiftFormValues
  });
  const selectedRoleCategory = form.watch("roleCategory");

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

      onSuccess?.();

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
      <form
        className={isModalLayout ? "flex min-h-0 flex-1 flex-col" : "space-y-5"}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div
          className={
            isModalLayout
              ? "flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6"
              : "space-y-5"
          }
        >
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
                  <div className="relative">
                    <FormControl>
                      <Input className="pr-10" type="time" {...field} />
                    </FormControl>
                    <Clock3 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground dark:text-white/70" />
                  </div>
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
                  <div className="relative">
                    <FormControl>
                      <Input className="pr-10" type="time" {...field} />
                    </FormControl>
                    <Clock3 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground dark:text-white/70" />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="roleCategory"
              render={({ field }) => (
              <FormItem>
                <FormLabel>Role Required</FormLabel>
                <FormControl>
                  <RoleCategoryDropdown
                    {...field}
                    onClearCustomRole={() => form.setValue("customRole", "")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {selectedRoleCategory === "Other Role" ? (
            <FormField
              control={form.control}
              name="customRole"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custom role</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter a custom role" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : null}

          <FormField
            control={form.control}
            name="requiredQualifications"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Required Qualifications</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Optional certifications, experience, or skills"
                    rows={3}
                    {...field}
                  />
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
                  <Textarea
                    placeholder="Additional shift notes"
                    rows={isModalLayout ? 3 : 4}
                    {...field}
                  />
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
        </div>

        <div
          className={
            isModalLayout
              ? "border-t border-border/60 bg-background/95 px-5 py-4 sm:px-6"
              : "pt-1"
          }
        >
          <Button className="w-full" disabled={isSaving} size="lg" type="submit">
            {isSaving ? "Saving shift..." : submitLabel ?? "Save shift"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
