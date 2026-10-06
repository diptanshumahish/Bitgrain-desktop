import { signal } from "../lib/signal";

type Theme = "light" | "dark";

const STORAGE_KEY = "imgi-theme";

function getInitialTheme(): Theme {
  try {
    return (localStorage.getItem(STORAGE_KEY) as Theme) ?? "dark";
  } catch {
    return "dark";
  }
}

function applyToDocument(theme: Theme): void {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.classList.toggle("dark", theme === "dark");
}

const initial = getInitialTheme();
applyToDocument(initial);

export const themeSignal = signal<Theme>(initial);

export function toggleTheme(): void {
  const next = themeSignal.value === "light" ? "dark" : "light";
  themeSignal.value = next;
  applyToDocument(next);
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // storage unavailable
  }
}
