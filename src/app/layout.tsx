import type { Metadata } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import { IBM_Plex_Sans, Space_Grotesk } from "next/font/google";
import { auth } from "@/auth";
import { Providers } from "@/components/providers/providers";
import "./globals.css";

const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"]
});

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"]
});

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
      className={`${sans.variable} ${display.variable}`}
    >
      <body className="font-sans">
        <Script id="dashboard-theme-bootstrap" strategy="beforeInteractive">
          {dashboardThemeBootstrap}
        </Script>
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}
