export const SHIFT_ROLE_CATEGORIES = [
  "Care Assistant",
  "Support Worker",
  "Senior Care Assistant",
  "Healthcare Assistant (HCA)",
  "Domiciliary Care Worker",
  "Live-in Carer",
  "Registered Nurse (RGN)",
  "Mental Health Nurse (RMN)",
  "Learning Disability Nurse (RNLD)",
  "Dementia Care Worker",
  "Night Care Worker",
  "Rehabilitation Support Worker",
  "Complex Care Worker",
  "Team Leader",
  "Care Coordinator",
  "Deputy Manager",
  "Care Home Manager",
  "Other Role"
] as const;

export type ShiftRoleCategory = (typeof SHIFT_ROLE_CATEGORIES)[number];

type ShiftRoleInput = {
  roleCategory?: string | null;
  customRole?: string | null;
  roleRequired?: string | null;
};

export function isShiftRoleCategory(
  value: string | null | undefined
): value is ShiftRoleCategory {
  return Boolean(value && SHIFT_ROLE_CATEGORIES.includes(value as ShiftRoleCategory));
}

export function resolveShiftRoleLabel(input: ShiftRoleInput) {
  const roleCategory = input.roleCategory?.trim() ?? "";
  const customRole = input.customRole?.trim() ?? "";
  const roleRequired = input.roleRequired?.trim() ?? "";

  if (roleCategory === "Other Role") {
    return customRole || roleRequired || "Other Role";
  }

  if (roleCategory) {
    return roleCategory;
  }

  if (roleRequired) {
    return roleRequired;
  }

  if (customRole) {
    return customRole;
  }

  return "";
}

export function inferShiftRoleFields(input: ShiftRoleInput) {
  const storedCategory = input.roleCategory?.trim() ?? "";
  const storedCustomRole = input.customRole?.trim() ?? "";
  const storedRoleRequired = input.roleRequired?.trim() ?? "";

  if (isShiftRoleCategory(storedCategory)) {
    return {
      roleCategory: storedCategory,
      customRole: storedCategory === "Other Role" ? storedCustomRole || storedRoleRequired : "",
      roleRequired: resolveShiftRoleLabel({
        roleCategory: storedCategory,
        customRole: storedCustomRole,
        roleRequired: storedRoleRequired
      })
    };
  }

  if (isShiftRoleCategory(storedRoleRequired) && storedRoleRequired !== "Other Role") {
    return {
      roleCategory: storedRoleRequired,
      customRole: "",
      roleRequired: storedRoleRequired
    };
  }

  if (storedRoleRequired) {
    return {
      roleCategory: "Other Role",
      customRole: storedCustomRole || storedRoleRequired,
      roleRequired: storedRoleRequired
    };
  }

  if (storedCustomRole) {
    return {
      roleCategory: "Other Role",
      customRole: storedCustomRole,
      roleRequired: storedCustomRole
    };
  }

  return {
    roleCategory: "",
    customRole: "",
    roleRequired: ""
  };
}
