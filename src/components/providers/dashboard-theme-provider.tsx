"use client";

import * as React from "react";

export type DashboardTheme = "light" | "dark";

export const DASHBOARD_THEME_COOKIE_NAME = "careconnect-dashboard-theme";

type DashboardThemeContextValue = {
  theme: DashboardTheme;
  setTheme: (theme: DashboardTheme) => void;
  toggleTheme: () => void;
};

const DashboardThemeContext = React.createContext<DashboardThemeContextValue | null>(null);

function writeDashboardTheme(theme: DashboardTheme) {
  document.cookie = `${DASHBOARD_THEME_COOKIE_NAME}=${theme}; path=/dashboard; max-age=31536000; samesite=lax`;

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
  const [theme, setThemeState] = React.useState<DashboardTheme>(initialTheme);

  React.useLayoutEffect(() => {
    writeDashboardTheme(theme);
  }, [theme]);

  React.useEffect(() => {
    return () => {
      if (window.location.pathname.startsWith("/dashboard")) {
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
