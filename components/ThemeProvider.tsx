/** @format */

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

type Theme = "light" | "dark" | "device";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  currentTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("device");
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  // Function to get system preference
  const getSystemTheme = useCallback((): "light" | "dark" => {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }, []);

  // Function to apply theme to document
  // Maps: light -> pastel, dark -> coffee
  const applyTheme = useCallback((themeToApply: "light" | "dark") => {
    const daisyTheme = themeToApply === "light" ? "pastel" : "coffee";
    document.documentElement.setAttribute("data-theme", daisyTheme);
    setCurrentTheme(themeToApply);
  }, []);

  // Load saved theme on mount
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    if (savedTheme && ["light", "dark", "device"].includes(savedTheme)) {
      setThemeState(savedTheme);
    }
  }, []);

  // Handle theme changes and system preference
  useEffect(() => {
    if (!mounted) return;

    if (theme === "device") {
      // Get initial system preference and apply
      const systemTheme = getSystemTheme();
      applyTheme(systemTheme);
      localStorage.setItem("theme", "device");

      // Listen for system theme changes
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

      const handleChange = (e: MediaQueryListEvent) => {
        const newTheme = e.matches ? "dark" : "light";
        applyTheme(newTheme);
      };

      // Listen for changes
      mediaQuery.addEventListener("change", handleChange);

      return () => {
        mediaQuery.removeEventListener("change", handleChange);
      };
    } else {
      // For light or dark, apply directly
      applyTheme(theme);
      localStorage.setItem("theme", theme);
    }
  }, [theme, mounted, getSystemTheme, applyTheme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, currentTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
