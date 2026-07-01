"use client";

import * as React from "react";

export type DashboardTheme = "light" | "dark";

export const DASHBOARD_THEME_COOKIE_NAME = "careconnect-dashboard-theme";
const DASHBOARD_THEME_STORAGE_KEY = "careconnect-dashboard-theme";

type DashboardThemeContextValue = {
  theme: DashboardTheme;
  setTheme: (theme: DashboardTheme) => void;
  toggleTheme: () => void;
};

const DashboardThemeContext = React.createContext<DashboardThemeContextValue | null>(null);

function parseDashboardTheme(value: string | null | undefined): DashboardTheme | null {
  return value === "dark" || value === "light" ? value : null;
}

function readDashboardThemeCookie(): DashboardTheme | null {
  if (typeof document === "undefined") {
    return null;
  }

  const match = document.cookie.match(
    new RegExp(`(?:^|; )${DASHBOARD_THEME_COOKIE_NAME}=([^;]+)`)
  );

  return parseDashboardTheme(match ? decodeURIComponent(match[1]) : null);
}

function readDashboardThemeStorage(): DashboardTheme | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return parseDashboardTheme(window.localStorage.getItem(DASHBOARD_THEME_STORAGE_KEY));
  } catch {
    return null;
  }
}

function readBrowserDashboardTheme(): DashboardTheme | null {
  if (typeof document === "undefined") {
    return null;
  }

  const root = document.documentElement;

  return (
    readDashboardThemeCookie() ??
    readDashboardThemeStorage() ??
    parseDashboardTheme(root.dataset.dashboardTheme) ??
    (root.classList.contains("dark") ? "dark" : null)
  );
}

function writeDashboardTheme(theme: DashboardTheme) {
  document.cookie = `${DASHBOARD_THEME_COOKIE_NAME}=${theme}; path=/; max-age=31536000; samesite=lax`;

  try {
    window.localStorage.setItem(DASHBOARD_THEME_STORAGE_KEY, theme);
  } catch {}

  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.dataset.dashboardTheme = theme;
}

type DashboardThemeProviderProps = {
  children: React.ReactNode;
  initialTheme?: DashboardTheme;
};

export function DashboardThemeProvider({
  children,
  initialTheme = "light"
}: DashboardThemeProviderProps) {
  const [theme, setThemeState] = React.useState<DashboardTheme>(
    () => readBrowserDashboardTheme() ?? initialTheme
  );

  React.useLayoutEffect(() => {
    const browserTheme = readBrowserDashboardTheme();

    if (browserTheme && browserTheme !== theme) {
      setThemeState(browserTheme);
      writeDashboardTheme(browserTheme);
      return;
    }

    writeDashboardTheme(theme);
  }, [theme]);

  React.useEffect(() => {
    return () => {
      if (
        window.location.pathname.startsWith("/dashboard") ||
        window.location.pathname.startsWith("/admin")
      ) {
        return;
      }

      document.documentElement.classList.remove("dark");
      document.documentElement.removeAttribute("data-dashboard-theme");
    };
  }, []);

  const value = React.useMemo<DashboardThemeContextValue>(
    () => ({
      theme,
      setTheme: setThemeState,
      toggleTheme: () =>
        setThemeState((current) => (current === "dark" ? "light" : "dark"))
    }),
    [theme]
  );

  return (
    <DashboardThemeContext.Provider value={value}>
      {children}
    </DashboardThemeContext.Provider>
  );
}

export function useDashboardTheme() {
  const context = React.useContext(DashboardThemeContext);

  if (!context) {
    throw new Error("useDashboardTheme must be used within DashboardThemeProvider.");
  }

  return context;
}
