"use client";

import { useEffect, type RefObject } from "react";
import axios from "axios";
import type { LoadingBarRef } from "react-top-loading-bar";

export const useAxiosLoadingBar = (
  loadingBarRef: RefObject<LoadingBarRef | null>
) => {
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use((config) => {
      loadingBarRef.current?.continuousStart();
      return config;
    });

    const responseInterceptor = axios.interceptors.response.use(
      (response) => {
        loadingBarRef.current?.complete();
        return response;
      },
      (error) => {
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
