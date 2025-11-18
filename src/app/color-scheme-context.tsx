"use client";

import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Theme } from "@radix-ui/themes";
import { useTheme as applyPrimeTheme } from "@primeuix/themes";
import Lara from "@primeuix/themes/lara";

export type ColorScheme = "light" | "dark";

type ColorSchemeContextValue = {
  scheme: ColorScheme;
  toggleScheme: () => void;
  setScheme: (scheme: ColorScheme) => void;
};

const STORAGE_KEY = "focusflow-color-scheme";

const PRIME_THEME_CONFIG = {
  preset: Lara,
  options: {
    prefix: "p",
    darkModeSelector: "[data-theme='dark']",
    cssLayer: true,
  },
};

const ColorSchemeContext = createContext<ColorSchemeContextValue | undefined>(
  undefined
);

function readClientScheme(): ColorScheme {
  if (typeof window === "undefined") {
    return "light";
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") {
    return stored;
  }

  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
  return prefersDark ? "dark" : "light";
}

export function ColorSchemeProvider({ children }: PropsWithChildren) {
  const [scheme, setScheme] = useState<ColorScheme>("light");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const resolved = readClientScheme();
    setScheme(resolved);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !hydrated) return;

    window.localStorage.setItem(STORAGE_KEY, scheme);
    document.documentElement.dataset.theme = scheme;
    if (document.body) {
      document.body.dataset.theme = scheme;
    }

    applyPrimeTheme(PRIME_THEME_CONFIG);
  }, [scheme, hydrated]);

  const toggleScheme = useCallback(() => {
    setScheme((current) => (current === "light" ? "dark" : "light"));
  }, []);

  const value = useMemo(
    () => ({ scheme, toggleScheme, setScheme }),
    [scheme, toggleScheme]
  );

  return (
    <ColorSchemeContext.Provider value={value}>
      <Theme
        appearance={scheme}
        accentColor="blue"
        grayColor="slate"
        radius="large"
        scaling="100%"
      >
        {children}
      </Theme>
    </ColorSchemeContext.Provider>
  );
}

export function useColorScheme() {
  const context = useContext(ColorSchemeContext);
  if (!context) {
    throw new Error("useColorScheme must be used within a ColorSchemeProvider");
  }
  return context;
}
