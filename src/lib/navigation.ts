import {
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
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
      label: "Overview",
      href: "/dashboard/admin",
      icon: LayoutDashboard,
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
      id: "admin-profile",
      label: "Profile",
      href: "/dashboard/admin/settings",
      icon: UserRound,
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
      mobile: true
    }
  ]
};
