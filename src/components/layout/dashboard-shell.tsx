"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LogOut,
  Menu,
  MoonStar,
  Search,
  SunMedium,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger
} from "@/components/ui/sheet";
import { BrandMark, BrandGlyph } from "@/components/layout/brand-mark";
import { useDashboardTheme } from "@/components/providers/dashboard-theme-provider";
import { DASHBOARD_NAVIGATION, type DashboardNavItem } from "@/lib/navigation";
import { ROLE_LABELS, type Role } from "@/lib/constants";
import { cn } from "@/lib/utils";

type DashboardShellProps = {
  children: React.ReactNode;
  role: Role;
};

const SIDEBAR_STORAGE_KEY = "careconnect:dashboard-sidebar-collapsed";

function normalizePath(value: string) {
  const cleaned = value.split("#")[0].split("?")[0].replace(/\/$/, "");
  return cleaned || "/";
}

function isActivePath(pathname: string | null, item: DashboardNavItem) {
  if (!pathname) return false;

  const currentPath = normalizePath(pathname);
  const targetPath = normalizePath(item.href);

  if (item.match === "prefix") {
    return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);
  }

  return currentPath === targetPath;
}

export function DashboardShell({ children, role }: DashboardShellProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { theme, setTheme } = useDashboardTheme();
  const navItems = DASHBOARD_NAVIGATION[role];
  const mobileNavItems = navItems.filter((item) => item.mobile !== false);
  const dashboardSearchHref =
    role === "ADMIN"
      ? "/dashboard/admin/search"
      : role === "FACILITY"
        ? "/dashboard/facility/search"
        : "/dashboard/worker/search";
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [hasHydrated, setHasHydrated] = React.useState(false);
  const userName =
    [session?.user?.firstName, session?.user?.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() || session?.user?.name || session?.user?.email || ROLE_LABELS[role];
  const initials = userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  const userEmail = session?.user?.email ?? "CareConnect account";
  const currentPageLabel =
    navItems.find((item) => isActivePath(pathname, item))?.label ?? ROLE_LABELS[role];

  React.useEffect(() => {
    const storedValue = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);

    if (storedValue !== null) {
      setIsSidebarCollapsed(storedValue === "true");
    }

    setHasHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(isSidebarCollapsed));
  }, [hasHydrated, isSidebarCollapsed]);

  function NavItemLink({
    item,
    compact = false,
    closeOnNavigate = false,
    mobile = false
  }: {
    item: DashboardNavItem;
    compact?: boolean;
    closeOnNavigate?: boolean;
    mobile?: boolean;
  }) {
    const Icon = item.icon;
    const active = isActivePath(pathname, item);

    const link = (
      <Button
        asChild
        variant="ghost"
        className={cn(
          "w-full transition-all duration-200",
          mobile
            ? "h-auto min-w-0 flex-col gap-1 rounded-2xl px-2 py-2 text-[11px] font-semibold leading-tight"
            : "h-12 justify-start rounded-2xl px-4 text-left",
          compact && !mobile && "justify-center gap-0 px-0",
          active
            ? "bg-primary/10 text-primary hover:bg-primary/10"
            : "text-muted-foreground hover:bg-accent hover:text-foreground"
        )}
      >
        <Link
          href={item.href}
          aria-current={active ? "page" : undefined}
          title={compact ? item.label : undefined}
        >
          <Icon className={cn("h-4 w-4 shrink-0", mobile && "h-5 w-5")} />
          {!compact ? <span className="truncate">{item.label}</span> : null}
        </Link>
      </Button>
    );

    return closeOnNavigate ? <SheetClose asChild>{link}</SheetClose> : link;
  }

  function SidebarContent({
    compact = false,
    closeOnNavigate = false,
  }: {
    compact?: boolean;
    closeOnNavigate?: boolean;
  }) {
    return (
      <div className="relative flex h-full flex-col">
        <div
          className={cn(
            "flex items-center gap-3 px-4 pt-3",
            compact && "px-3 pt-3"
          )}
        >
          {compact ? (
            <BrandGlyph className="h-10 w-10 border-0 bg-transparent shadow-none" />
          ) : (
            <BrandMark
              compact
              className="max-w-full"
              glyphClassName="border-0 bg-transparent shadow-none"
            />
          )}
        </div>

        <nav className={cn("mt-6 flex-1", compact ? "space-y-1 px-2" : "space-y-1 px-3")}>
          {mobileNavItems.map((item) => (
            <NavItemLink
              key={item.id}
              item={item}
              compact={compact}
              closeOnNavigate={closeOnNavigate}
            />
          ))}

        </nav>

        <div className={cn("mt-auto border-t border-border/60", compact ? "px-2 py-3" : "px-4 py-4")}>
          {role === "FACILITY" ? (
            <Button
              type="button"
              variant="ghost"
              size={compact ? "icon" : "default"}
              className={cn(
                compact
                  ? "h-10 w-10 rounded-full border border-white/8 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
                  : "h-11 w-full justify-start rounded-2xl border border-white/8 bg-white/5 px-4 text-white/80 hover:bg-white/10 hover:text-white"
              )}
              aria-label="Sign out"
              onClick={() => {
                void signOut({ callbackUrl: "/login" });
              }}
            >
              <LogOut className={cn("h-4 w-4", compact ? "" : "mr-2")} />
              {!compact ? <span>Sign out</span> : null}
            </Button>
          ) : (
            <div
              className={cn(
                "flex items-center gap-3 rounded-2xl bg-muted/45 p-3",
                compact && "justify-center p-2"
              )}
            >
              <Avatar className="h-10 w-10 shrink-0 rounded-full">
                {session?.user?.image ? (
                  <AvatarImage src={session.user.image} alt={userName} />
                ) : null}
                <AvatarFallback className="rounded-full bg-primary/10 text-primary">
                  {initials || "CC"}
                </AvatarFallback>
              </Avatar>
              {!compact ? (
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{userName}</p>
                  <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(var(--brand-sky-rgb),0.08),transparent_28%),radial-gradient(circle_at_top_right,_rgba(var(--brand-cyan-rgb),0.06),transparent_26%),linear-gradient(180deg,rgba(245,251,255,1)_0%,rgba(239,247,255,1)_100%)] text-foreground dark:bg-[radial-gradient(circle_at_top_left,_rgba(var(--brand-sky-rgb),0.12),transparent_30%),radial-gradient(circle_at_top_right,_rgba(var(--brand-cyan-rgb),0.08),transparent_28%),linear-gradient(180deg,#040e26_0%,#091115_100%)]">
      <div className="relative z-10 flex min-h-screen">
        <aside
          className={cn(
            "relative hidden border-r border-border/70 bg-background/70 backdrop-blur-2xl shadow-[12px_0_40px_rgba(2,6,23,0.08)] transition-[width] duration-300 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden lg:[scrollbar-width:none] lg:[-ms-overflow-style:none] lg:[&::-webkit-scrollbar]:hidden",
            isSidebarCollapsed ? "w-20" : "w-64"
          )}
        >
          <SidebarContent compact={isSidebarCollapsed} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-border/70 bg-background/75 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-2 sm:gap-3">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-2xl lg:hidden"
                      aria-label="Open navigation"
                    >
                      <Menu className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="left"
                    className="w-[min(20rem,calc(100vw-1rem))] rounded-r-3xl"
                  >
                    <div className="px-1 pt-2">
                      <BrandMark
                        compact
                        className="max-w-full"
                        glyphClassName="border-0 bg-transparent shadow-none"
                      />
                    </div>
                    <div className="mt-5">
                      <SidebarContent closeOnNavigate />
                    </div>
                  </SheetContent>
                </Sheet>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="hidden h-10 w-10 shrink-0 rounded-full border border-border/70 bg-background/80 shadow-sm transition-transform hover:scale-105 lg:inline-flex"
                  aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                  aria-pressed={isSidebarCollapsed}
                  onClick={() => setIsSidebarCollapsed((value) => !value)}
                >
                  <Menu className="h-4 w-4" />
                </Button>
                <p className="text-sm font-semibold tracking-[0.12em] text-foreground/80">
                  {currentPageLabel}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  className="rounded-full border border-border/60 bg-background/70 shadow-sm"
                >
                  <Link aria-label="Search dashboard" href={dashboardSearchHref}>
                    <Search className="h-4 w-4" />
                  </Link>
                </Button>

                <div className="flex items-center rounded-full border border-border/70 bg-background/70 p-1 shadow-sm">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-9 w-9 rounded-full",
                      theme === "light"
                        ? "bg-primary/10 text-primary hover:bg-primary/10"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                    aria-label="Switch dashboard to light mode"
                    aria-pressed={theme === "light"}
                    onClick={() => setTheme("light")}
                  >
                    <SunMedium className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-9 w-9 rounded-full",
                      theme === "dark"
                        ? "bg-primary/10 text-primary hover:bg-primary/10"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                    aria-label="Switch dashboard to dark mode"
                    aria-pressed={theme === "dark"}
                    onClick={() => setTheme("dark")}
                  >
                    <MoonStar className="h-4 w-4" />
                  </Button>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-11 w-11 rounded-full border-border/70 bg-background/80 p-0 shadow-sm"
                      aria-label="Open account menu"
                    >
                      <Avatar className="h-11 w-11 rounded-full">
                        {session?.user?.image ? (
                          <AvatarImage src={session.user.image} alt={userName} />
                        ) : null}
                        <AvatarFallback className="rounded-full bg-primary/10 text-primary">
                          {initials || "CC"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuLabel>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          {session?.user?.image ? (
                            <AvatarImage src={session.user.image} alt={userName} />
                          ) : null}
                          <AvatarFallback className="rounded-xl bg-primary/10 text-primary">
                            {initials || "CC"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{userName}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {session?.user?.email ?? "CareConnect account"}
                          </p>
                          <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                            {ROLE_LABELS[role]}
                          </p>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => {
                        void signOut({ callbackUrl: "/login" });
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 pb-28 sm:px-6 lg:px-8 lg:py-8 lg:pb-8">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">{children}</div>
          </main>
        </div>
      </div>

      <nav
        aria-label="Primary navigation"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 px-2 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl lg:hidden"
      >
        <div className="mx-auto grid max-w-3xl grid-cols-4 gap-1">
          {mobileNavItems.map((item) => {
            const active = isActivePath(pathname, item);
            const Icon = item.icon;

            return (
              <Button
                key={item.id}
                asChild
                variant="ghost"
                className={cn(
                  "h-auto flex-col gap-1 rounded-2xl px-2 py-2 text-[11px] font-semibold leading-tight",
                  active
                    ? "bg-primary/10 text-primary hover:bg-primary/10"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Link href={item.href} aria-current={active ? "page" : undefined}>
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="truncate text-center">{item.label}</span>
                </Link>
              </Button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
