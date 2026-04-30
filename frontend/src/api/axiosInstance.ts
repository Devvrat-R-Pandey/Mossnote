// api/axiosInstance.ts
import axios, { AxiosError } from "axios";
import type { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { useUiStore } from "../store/uiStore";

// In production, set VITE_API_URL to the Render backend URL (e.g. https://notebloom-api.onrender.com/api)
// In development, Vite proxy forwards /api → localhost:3000
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token from localStorage to every request
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

    // If 401, clear auth state (token expired/invalid)
    if (status === 401) {
      localStorage.removeItem("token");
    }

    // If 429, signal rate-limiting to the UI
    if (status === 429) {
      useUiStore.getState().setRateLimited(true);
      // Auto-clear after 10 seconds
      setTimeout(() => useUiStore.getState().setRateLimited(false), 10000);
    }

    console.error("API Error:", error.message);
    return Promise.reject(error);
  }
);