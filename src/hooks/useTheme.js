/**
 * useTheme — light/dark theme manager.
 *
 * Persists the choice in localStorage and toggles the `dark` class on
 * <html> so Tailwind's class-based dark mode picks it up. Defaults to
 * dark (matching the app's original design).
 */
import { useState, useEffect, useCallback } from "react";
import { safeStorage } from "@/lib/safeStorage";

const STORAGE_KEY = "lsl-theme";
const DEFAULT = "dark";

function getInitialTheme() {
  if (typeof window === "undefined") return DEFAULT;
  const stored = safeStorage.getItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : DEFAULT;
}

function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
}

export function useTheme() {
  const [theme, setThemeState] = useState(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = useCallback((t) => {
    safeStorage.setItem(STORAGE_KEY, t);
    setThemeState(t);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      safeStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  return { theme, setTheme, toggleTheme };
}