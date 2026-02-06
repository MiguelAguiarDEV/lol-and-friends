"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const storageKey = "laf-theme";
type ThemeName = "light" | "dark";

function isThemeName(value: string): value is ThemeName {
  return value === "light" || value === "dark";
}

function applyTheme(theme: ThemeName) {
  if (theme === "light") {
    delete document.documentElement.dataset.theme;
    return;
  }
  document.documentElement.dataset.theme = "dark";
}

export function ThemeSwitcher() {
  const [activeTheme, setActiveTheme] = useState<ThemeName>("light");

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(storageKey);
    if (storedTheme && isThemeName(storedTheme)) {
      setActiveTheme(storedTheme);
      applyTheme(storedTheme);
      return;
    }
    applyTheme("light");
  }, []);

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={
        activeTheme === "dark"
          ? "Cambiar a tema claro"
          : "Cambiar a tema oscuro"
      }
      title={activeTheme === "dark" ? "Modo claro" : "Modo oscuro"}
      onClick={() => {
        const nextTheme = activeTheme === "dark" ? "light" : "dark";
        setActiveTheme(nextTheme);
        applyTheme(nextTheme);
        window.localStorage.setItem(storageKey, nextTheme);
      }}
    >
      {activeTheme === "dark" ? <SunIcon /> : <MoonIcon />}
    </Button>
  );
}

function SunIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="size-5 text-amber-500"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <title>Tema claro</title>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2.5" />
      <path d="M12 19.5V22" />
      <path d="M4.9 4.9l1.8 1.8" />
      <path d="M17.3 17.3l1.8 1.8" />
      <path d="M2 12h2.5" />
      <path d="M19.5 12H22" />
      <path d="M4.9 19.1l1.8-1.8" />
      <path d="M17.3 6.7l1.8-1.8" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="size-5 text-indigo-500"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <title>Tema oscuro</title>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 1 0 9.8 9.8Z" />
    </svg>
  );
}
