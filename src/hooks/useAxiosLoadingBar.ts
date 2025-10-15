"use client";

import { useEffect, type RefObject } from "react";
import axios, {
  AxiosHeaders,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import type { LoadingBarRef } from "react-top-loading-bar";
import { clearJwtToken, readJwtToken } from "@/lib-fe/jwt-storage";
import { useGlobalToast } from "@/components/global-toast-provider";

export const useAxiosLoadingBar = (
  loadingBarRef: RefObject<LoadingBarRef | null>
) => {
  const showToast = useGlobalToast();

  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        loadingBarRef.current?.continuousStart();

        const token = readJwtToken();
        if (token) {
          const headersInstance = config.headers
            ? AxiosHeaders.from(config.headers)
            : new AxiosHeaders();
          headersInstance.set("Authorization", `Bearer ${token}`);
          config.headers = headersInstance;
        }

        return config;
      },
      (error) => {
        loadingBarRef.current?.complete();
        return Promise.reject(error);
      }
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response: AxiosResponse) => {
        loadingBarRef.current?.complete();
        return response;
      },
      (error) => {
        console.error("HTTP Error:", error);
        loadingBarRef.current?.complete();

        const message = axios.isAxiosError(error)
          ? error.response?.data?.message ?? error.message
          : "Unexpected error occurred";

        showToast({
          severity: "error",
          summary: "Request failed",
          detail: message,
          life: 4000,
        });

        if (axios.isAxiosError(error) && error.response?.status === 401) {
          clearJwtToken();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [loadingBarRef, showToast]);
};
