"use client";

import { useRef, type PropsWithChildren } from "react";
import LoadingBar, { type LoadingBarRef } from "react-top-loading-bar";
import { AuthProvider } from "./auth-context";
import { HeaderNav } from "../components/header-nav";
import { GlobalToastProvider } from "../components/global-toast-provider";
import { useAxiosLoadingBar } from "../hooks/useAxiosLoadingBar";
import { ColorSchemeProvider } from "./color-scheme-context";

export function LayoutClient({ children }: PropsWithChildren) {
  return (
    <ColorSchemeProvider>
      <GlobalToastProvider>
        <LayoutContainer>{children}</LayoutContainer>
      </GlobalToastProvider>
    </ColorSchemeProvider>
  );
}

function LayoutContainer({ children }: PropsWithChildren) {
  const loadingBarRef = useRef<LoadingBarRef | null>(null);

  useAxiosLoadingBar(loadingBarRef);

  return (
    <AuthProvider>
  <div className="relative min-h-screen bg-transparent text-[var(--foreground)] md:pl-64">
        <LoadingBar color="var(--accent-9)" ref={loadingBarRef} shadow={true} />
        <HeaderNav />
  <main className="min-h-screen bg-transparent pt-16 transition-[padding] duration-200 md:pt-0">
          {children}
        </main>
      </div>
    </AuthProvider>
  );
}
