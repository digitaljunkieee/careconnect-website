import Link from "next/link";
import { ArrowRight, Instagram, Linkedin, X } from "lucide-react";
import { BrandMark } from "@/components/layout/brand-mark";

const footerColumns = [
  {
    title: "Company",
    links: [
      { label: "About", href: "#home" },
      { label: "Contact", href: "#contact" }
    ]
  },
  {
    title: "Platform",
    links: [
      { label: "For care workers", href: "#care-workers" },
      { label: "For facilities", href: "#care-facilities" },
      { label: "Post a shift", href: "/dashboard/facility/shifts/create" }
    ]
  },
  {
    title: "Resources",
    links: [
      { label: "How it works", href: "#care-workers" },
      { label: "Verification", href: "#care-facilities" },
      { label: "Support", href: "#contact" }
    ]
  }
];

const socialLinks = [
  { label: "LinkedIn", href: "#contact", icon: Linkedin },
  { label: "X", href: "#contact", icon: X },
  { label: "Instagram", href: "#contact", icon: Instagram }
];

export function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white px-4 py-14 text-slate-950 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-5">
          <div className="space-y-5">
            <BrandMark compact className="max-w-fit" />

            <p className="max-w-sm text-sm leading-6 text-slate-500">
              Care staffing for workers and facilities.
            </p>

            <Link
              href="mailto:hello@careconnect.co.uk"
              className="block text-sm font-medium text-slate-600 transition-colors hover:text-slate-950"
            >
              hello@careconnect.co.uk
            </Link>

            <div className="flex items-center gap-2">
              {socialLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  aria-label={link.label}
                  title={link.label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-950"
                >
                  <link.icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>

          {footerColumns.map((column) => (
            <nav key={column.title} aria-label={column.title} className="space-y-4">
              <h2 className="text-sm font-semibold text-slate-950">{column.title}</h2>
              <div className="space-y-3">
                {column.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="block text-sm text-slate-500 transition-colors hover:text-slate-950"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </nav>
          ))}

          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-950">Newsletter</h2>
            <p className="max-w-sm text-sm leading-6 text-slate-500">
              Short updates on staffing, verification, and shift planning.
            </p>

            <form className="flex max-w-sm items-center gap-3">
              <label className="sr-only" htmlFor="footer-email">
                Email address
              </label>
              <input
                id="footer-email"
                type="email"
                placeholder="Email address"
                className="h-11 flex-1 border-b border-slate-200 bg-transparent px-0 text-sm text-slate-950 outline-none placeholder:text-slate-400"
              />
              <button
                type="submit"
                aria-label="Subscribe to newsletter"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:border-slate-400 hover:text-slate-950"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-100 pt-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">CareConnect {currentYear}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
              <Link href="#contact" className="transition-colors hover:text-slate-950">
                Privacy Policy
              </Link>
              <Link href="#contact" className="transition-colors hover:text-slate-950">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
