"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ChevronRight, LogIn, Menu, UserPlus } from "lucide-react";
import { BrandMark } from "@/components/layout/brand-mark";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";

const sectionLinks = [
  { label: "Home", href: "#home" },
  { label: "Care Workers", href: "#care-workers" },
  { label: "Care Facilities", href: "#care-facilities" }
];

function MobileMenu() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Open navigation menu"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-900/12 bg-white/20 text-slate-950 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.55)] drop-shadow-[0_6px_14px_rgba(15,23,42,0.22)] backdrop-blur-sm transition-colors hover:bg-white/30 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
      </SheetTrigger>

      <SheetContent side="right" className="w-[min(88vw,22rem)] border-slate-200 bg-white p-0">
        <div className="flex min-h-full flex-col px-5 py-6">
          <SheetHeader className="items-start gap-3 text-left">
            <BrandMark compact />
            <SheetTitle className="sr-only">CareConnect navigation</SheetTitle>
          </SheetHeader>

          <div className="mt-8 grid gap-2">
            {sectionLinks.map((link) => (
              <SheetClose asChild key={link.label}>
                <Link
                  href={link.href}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-50"
                >
                  {link.label}
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </Link>
              </SheetClose>
            ))}
          </div>

          <div className="mt-6 grid gap-2 pt-1">
            <SheetClose asChild>
              <Link
                href="/login"
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-50"
              >
                Sign In
              </Link>
            </SheetClose>
            <SheetClose asChild>
              <Link
                href="/register"
                className="rounded-2xl bg-primary px-5 py-3 text-center text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              >
                Sign Up
              </Link>
            </SheetClose>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function HeaderIconAction({
  href,
  tooltip,
  label,
  icon: Icon
}: {
  href: string;
  tooltip: string;
  label: string;
  icon: LucideIcon;
}) {
  return (
    <div className="group relative">
      <Button
        asChild
        size="icon"
        variant="ghost"
        className="rounded-full border border-slate-900/12 bg-white/20 text-slate-950 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.55)] drop-shadow-[0_6px_14px_rgba(15,23,42,0.22)] backdrop-blur-sm transition-colors hover:bg-white/30"
      >
        <Link href={href} aria-label={label}>
          <Icon className="h-4 w-4" />
        </Link>
      </Button>
      <span className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 rounded-full bg-slate-950 px-2.5 py-1 text-[0.68rem] font-semibold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        {tooltip}
      </span>
    </div>
  );
}

export function LandingHeader() {
  return (
    <header className="absolute left-1/2 top-3 z-50 w-[calc(100%-1rem)] max-w-[1440px] -translate-x-1/2 px-0 sm:w-[calc(100%-1.5rem)] lg:top-4 lg:w-[calc(100%-2rem)]">
      <div className="mx-auto flex w-full items-center gap-3 rounded-full border border-transparent bg-transparent px-4 py-2.5 shadow-none backdrop-blur-0 sm:px-5 lg:gap-4">
        <BrandMark
          compact
          className="shrink-0 drop-shadow-[0_8px_18px_rgba(15,23,42,0.24)]"
        />

        <nav
          className="hidden w-[min(46vw,34rem)] flex-none items-center justify-end gap-6 lg:ml-3 lg:flex xl:ml-6"
          aria-label="Primary"
        >
          {sectionLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-semibold text-slate-700 drop-shadow-[0_8px_18px_rgba(15,23,42,0.2)] transition-colors hover:text-slate-950"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-2 lg:flex">
          <HeaderIconAction href="/login" tooltip="Login" label="Sign in" icon={LogIn} />
          <HeaderIconAction href="/register" tooltip="Sign up" label="Sign up" icon={UserPlus} />
        </div>

        <div className="ml-auto lg:hidden">
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
