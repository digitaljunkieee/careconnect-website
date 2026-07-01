import {
  CalendarDays,
  Bell,
  Building2,
  ClipboardList,
  CreditCard,
  FileText,
  History,
  LayoutDashboard,
  ListChecks,
  ListTodo,
  Settings2,
  ShieldCheck,
  Users,
  UsersRound,
  UserRound,
} from "lucide-react";
import type { Role } from "@/lib/constants";

export type DashboardNavItem = {
  id: string;
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  match?: "exact" | "prefix";
  mobile?: boolean;
};

export const DASHBOARD_NAVIGATION: Record<Role, DashboardNavItem[]> = {
  ADMIN: [
    {
      id: "admin-overview",
      label: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
      mobile: true
    },
    {
      id: "admin-users",
      label: "Users",
      href: "/dashboard/admin/users",
      icon: UsersRound,
      match: "prefix",
      mobile: true
    },
    {
      id: "admin-workers",
      label: "Workers",
      href: "/dashboard/admin/workers",
      icon: Users,
      match: "prefix",
      mobile: true
    },
    {
      id: "admin-facilities",
      label: "Facilities",
      href: "/dashboard/admin/facilities",
      icon: Building2,
      match: "prefix",
      mobile: true
    },
    {
      id: "admin-survey-leads",
      label: "Survey Leads",
      href: "/dashboard/admin/survey-leads",
      icon: ListChecks,
      match: "prefix",
      mobile: true
    },
    {
      id: "admin-verifications",
      label: "Verifications",
      href: "/dashboard/admin/verifications",
      icon: ShieldCheck,
      match: "prefix",
      mobile: true
    },
    {
      id: "admin-shifts",
      label: "Shifts",
      href: "/dashboard/admin/shifts",
      icon: CalendarDays,
      match: "prefix",
      mobile: true
    },
    {
      id: "admin-applications",
      label: "Applications",
      href: "/dashboard/admin/applications",
      icon: ClipboardList,
      match: "prefix",
      mobile: true
    },
    {
      id: "admin-assignments",
      label: "Assignments",
      href: "/dashboard/admin/assignments",
      icon: ListTodo,
      match: "prefix",
      mobile: true
    },
    {
      id: "admin-payments",
      label: "Payments",
      href: "/dashboard/admin/payments",
      icon: CreditCard,
      match: "prefix",
      mobile: true
    },
    {
      id: "admin-notifications",
      label: "Notifications",
      href: "/dashboard/admin/notifications",
      icon: Bell,
      match: "prefix",
      mobile: true
    },
    {
      id: "admin-reports",
      label: "Reports",
      href: "/dashboard/admin/reports/compliance",
      icon: FileText,
      match: "prefix",
      mobile: true
    },
    {
      id: "admin-activity-log",
      label: "Activity Log",
      href: "/dashboard/admin/activity-log",
      icon: History,
      match: "prefix",
      mobile: true
    },
    {
      id: "admin-settings",
      label: "Settings",
      href: "/dashboard/admin/settings",
      icon: Settings2,
      match: "prefix",
      mobile: true
    }
  ],
  WORKER: [
    {
      id: "worker-overview",
      label: "Overview",
      href: "/dashboard/worker",
      icon: LayoutDashboard,
      mobile: true
    },
    {
      id: "worker-shifts",
      label: "Shifts",
      href: "/dashboard/worker/shifts",
      icon: CalendarDays,
      mobile: true
    },
    {
      id: "worker-applications",
      label: "Applications",
      href: "/dashboard/worker/applications",
      icon: ClipboardList,
      mobile: true
    },
    {
      id: "worker-profile",
      label: "Profile",
      href: "/dashboard/worker/profile",
      icon: UserRound,
      match: "prefix",
      mobile: true
    }
  ],
  FACILITY: [
    {
      id: "facility-overview",
      label: "Overview",
      href: "/dashboard/facility",
      icon: LayoutDashboard,
      mobile: true
    },
    {
      id: "facility-shifts",
      label: "Shifts",
      href: "/dashboard/facility/shifts",
      icon: CalendarDays,
      match: "prefix",
      mobile: true
    },
    {
      id: "facility-applicants",
      label: "Applications",
      href: "/dashboard/facility/applicants",
      icon: ClipboardList,
      mobile: true
    },
    {
      id: "facility-profile",
      label: "Profile",
      href: "/dashboard/facility/profile",
      icon: UserRound,
      match: "prefix",
      mobile: true
    }
  ]
};
