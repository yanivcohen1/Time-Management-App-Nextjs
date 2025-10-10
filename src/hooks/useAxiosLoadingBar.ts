"use client";

import { useEffect, type RefObject } from "react";
import axios, {
  AxiosHeaders,
  type AxiosHeaderValue,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import type { LoadingBarRef } from "react-top-loading-bar";

const JWT_STORAGE_KEY = "focusflow.jwt";

function readToken() {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(JWT_STORAGE_KEY);
}

function persistToken(token: string) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(JWT_STORAGE_KEY, token);
}

function headerValueToString(value: AxiosHeaderValue | undefined) {
  if (value == null) return null;
  if (Array.isArray(value)) {
    return headerValueToString(value[0]);
  }
  return typeof value === "string" ? value : String(value);
}

function extractAuthorizationHeader(headers: AxiosResponse["headers"]) {
  if (!headers) return null;
  if (typeof (headers as AxiosHeaders).get === "function") {
    const value = (headers as AxiosHeaders).get("authorization");
    return headerValueToString(value ?? undefined);
  }
  const headerRecord = headers as Record<string, AxiosHeaderValue | undefined>;
  return headerValueToString(headerRecord["authorization"]);
}

function coerceBearerToken(raw: string | null | undefined) {
  if (!raw) return null;
  return raw.startsWith("Bearer ") ? raw.split(" ", 2)[1] ?? null : raw;
}

export const useAxiosLoadingBar = (
  loadingBarRef: RefObject<LoadingBarRef | null>
) => {
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        loadingBarRef.current?.continuousStart();

        const token = readToken();
        if (token) {
          const headersInstance = config.headers
            ? AxiosHeaders.from(config.headers)
            : new AxiosHeaders();
          headersInstance.set("Authorization", `Bearer ${token}`);
          config.headers = headersInstance;
        }

        return config;
      }
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response: AxiosResponse) => {
        loadingBarRef.current?.complete();

        const authHeader = extractAuthorizationHeader(response.headers);
        const tokenFromHeader = coerceBearerToken(authHeader);

        const body = response.data as
          | (Record<string, unknown> & { token?: string; jwt?: string })
          | undefined;
        const tokenFromBody = body?.token ?? body?.jwt;

        if (tokenFromHeader) {
          persistToken(tokenFromHeader);
        } else if (typeof tokenFromBody === "string") {
          persistToken(tokenFromBody);
        }

        return response;
      },
      (error) => {
        console.error("HTTP Error:", error);
        loadingBarRef.current?.complete();
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [loadingBarRef]);
};
