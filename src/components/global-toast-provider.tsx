"use client";

import { createContext, useCallback, useContext, useMemo, useRef, type PropsWithChildren } from "react";
import { Toast } from "primereact/toast";
import type { ToastMessageOptions } from "primereact/toast";

export type ShowToast = (options: ToastMessageOptions) => void;

const ToastContext = createContext<ShowToast | null>(null);

export function GlobalToastProvider({ children }: PropsWithChildren) {
  const toastRef = useRef<Toast | null>(null);

  const showToast = useCallback<ShowToast>((options) => {
    toastRef.current?.show(options);
  }, []);

  const value = useMemo(() => showToast, [showToast]);

  return (
    <ToastContext.Provider value={value}>
      <Toast ref={toastRef} position="top-right" />
      {children}
    </ToastContext.Provider>
  );
}

export const useGlobalToast = (): ShowToast => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useGlobalToast must be used within a GlobalToastProvider");
  }

  return context;
};
