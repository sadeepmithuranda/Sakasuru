import { useSyncExternalStore } from "react";

/**
 * Light / dark appearance. The choice is per device (like most apps): it is kept
 * in localStorage so the login and welcome screens follow it too, and
 * "system" follows the phone or computer setting live.
 * public/theme-init.js applies the same logic before React loads so there is no flash.
 */
export type ThemeChoice = "light" | "dark" | "system";
export const THEME_CHOICES: ThemeChoice[] = ["light", "dark", "system"];

const KEY = "sk_theme";
const META_COLORS = { light: "#1556B8", dark: "#0A1220" } as const;
const listeners = new Set<() => void>();

function readChoice(): ThemeChoice {
  try {
    const v = localStorage.getItem(KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system";
  }
}

const media = () => (typeof window !== "undefined" && window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null);

export function resolveTheme(choice: ThemeChoice): "light" | "dark" {
  if (choice !== "system") return choice;
  return media()?.matches ? "dark" : "light";
}

export function applyTheme(choice: ThemeChoice = readChoice()) {
  const resolved = resolveTheme(choice);
  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
  root.style.colorScheme = resolved;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", META_COLORS[resolved]);
}

export function setThemeChoice(choice: ThemeChoice) {
  try {
    if (choice === "system") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, choice);
  } catch {
    /* storage blocked — the choice still applies for this visit */
  }
  current = choice;
  applyTheme(choice);
  listeners.forEach((l) => l());
}

let current: ThemeChoice = typeof window === "undefined" ? "system" : readChoice();

// Follow the device setting while the choice is "system".
media()?.addEventListener("change", () => {
  if (current === "system") {
    applyTheme("system");
    listeners.forEach((l) => l());
  }
});

const subscribe = (l: () => void) => (listeners.add(l), () => void listeners.delete(l));
const snapshot = () => `${current}:${resolveTheme(current)}`;

export function useTheme() {
  const snap = useSyncExternalStore(subscribe, snapshot, () => "system:light");
  const [choice, resolved] = snap.split(":") as [ThemeChoice, "light" | "dark"];
  return {
    choice,
    resolved,
    setChoice: setThemeChoice,
    toggle: () => setThemeChoice(resolved === "dark" ? "light" : "dark"),
  };
}
