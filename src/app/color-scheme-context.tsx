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

function resolveInitialScheme(): ColorScheme {
  if (typeof window === "undefined") {
    return "light";
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") {
    if (typeof document !== "undefined") {
      document.documentElement.dataset.theme = stored;
      if (document.body) {
        document.body.dataset.theme = stored;
      }
    }
    return stored;
  }

  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
  const resolved = prefersDark ? "dark" : "light";
  if (typeof document !== "undefined") {
    document.documentElement.dataset.theme = resolved;
    if (document.body) {
      document.body.dataset.theme = resolved;
    }
  }
  return resolved;
}

export function ColorSchemeProvider({ children }: PropsWithChildren) {
  const [scheme, setScheme] = useState<ColorScheme>(() => resolveInitialScheme());

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.localStorage.setItem(STORAGE_KEY, scheme);
    document.documentElement.dataset.theme = scheme;
    if (document.body) {
      document.body.dataset.theme = scheme;
    }

    applyPrimeTheme(PRIME_THEME_CONFIG);
  }, [scheme]);

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
