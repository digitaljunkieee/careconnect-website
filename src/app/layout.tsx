import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import Script from "next/script";
import { auth } from "@/auth";
import { Providers } from "@/components/providers/providers";
import "./globals.css";

const fontVariables = {
  "--font-sans":
    '"Segoe UI", Inter, -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif',
  "--font-display":
    '"Trebuchet MS", "Segoe UI Semibold", "Segoe UI", system-ui, sans-serif'
} as CSSProperties;

export const metadata: Metadata = {
  title: {
    default: "CareConnect",
    template: "%s | CareConnect"
  },
  description:
    "CareConnect helps care workers find flexible shifts and helps care facilities fill vacancies with verified professionals."
};

const dashboardThemeBootstrap = `
(function () {
  try {
    var match = document.cookie.match(/(?:^|; )careconnect-dashboard-theme=([^;]+)/);
    var theme = match ? decodeURIComponent(match[1]) : null;
    if (theme !== "dark" && theme !== "light") {
      try {
        theme = window.localStorage.getItem("careconnect-dashboard-theme");
      } catch (storageError) {
        theme = null;
      }
    }
    var root = document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    if (theme) {
      root.dataset.dashboardTheme = theme;
    } else {
      root.removeAttribute("data-dashboard-theme");
    }
  } catch (error) {}
})();
`;

export default async function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  const session = await auth();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      style={fontVariables}
    >
      <body className="font-sans antialiased">
        <Script id="dashboard-theme-bootstrap" strategy="beforeInteractive">
          {dashboardThemeBootstrap}
        </Script>
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}
