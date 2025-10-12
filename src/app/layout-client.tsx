"use client";

import { useRef, type PropsWithChildren } from "react";
import { Theme } from "@radix-ui/themes";
import LoadingBar, { type LoadingBarRef } from "react-top-loading-bar";
import { AuthProvider } from "./auth-context";
import { HeaderNav } from "../components/header-nav";
import { GlobalToastProvider } from "../components/global-toast-provider";
import { useAxiosLoadingBar } from "../hooks/useAxiosLoadingBar";

export function LayoutClient({ children }: PropsWithChildren) {
  return (
    <Theme accentColor="blue" grayColor="slate" radius="large" scaling="100%">
      <GlobalToastProvider>
        <LayoutContainer>{children}</LayoutContainer>
      </GlobalToastProvider>
    </Theme>
  );
}

function LayoutContainer({ children }: PropsWithChildren) {
  const loadingBarRef = useRef<LoadingBarRef | null>(null);

  useAxiosLoadingBar(loadingBarRef);

  return (
    <AuthProvider>
      <div className="relative min-h-screen bg-[var(--background)] text-[var(--foreground)] md:pl-64">
        <LoadingBar color="var(--accent-9)" ref={loadingBarRef} shadow={true} />
        <HeaderNav />
        <main className="min-h-screen pt-16 transition-[padding] duration-200 md:pt-0">
          {children}
        </main>
      </div>
    </AuthProvider>
  );
}
