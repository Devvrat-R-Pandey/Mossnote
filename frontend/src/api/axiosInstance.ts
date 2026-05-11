import axios, { AxiosError } from "axios";
import type { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { useUiStore } from "../store/uiStore";

if (!import.meta.env.VITE_API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not defined. Check your .env file.");
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    const status = error.response?.status;

    if (status === 401) {
      localStorage.removeItem("token");
      import("../store/authStore").then(({ useAuthStore }) => {
        if (useAuthStore.getState().user) {
          useAuthStore.setState({ user: null, error: null });
        }
      });
    }

    if (status === 429) {
      useUiStore.getState().setRateLimited(true);
      setTimeout(() => useUiStore.getState().setRateLimited(false), 10000);
    }

    console.error("API Error:", error.message);
    return Promise.reject(error);
  }
);
