/** @format */

import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from "axios";
import type { APIResponse } from "@/types/auth";

const baseURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000";

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Request interceptor - Add token to headers
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    // If response has status property (from APIResponse wrapper)
    if (response.data && typeof response.data === "object" && "status" in response.data) {
      const apiResponse = response.data as APIResponse;
      if (apiResponse.status === "error") {
        return Promise.reject(new Error(apiResponse.message || "Request failed"));
      }
      return response;
    }
    return response;
  },
  (error: AxiosError<APIResponse>) => {
    // Handle network errors
    if (!error.response) {
      return Promise.reject(new Error("Network error. Please check your connection."));
    }

    // Handle 401 Unauthorized - Clear token and redirect to login
    if (error.response.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
      return Promise.reject(new Error("Session expired. Please login again."));
    }

    // Handle API response errors
    const apiResponse = error.response.data;
    if (apiResponse && apiResponse.status === "error") {
      const errorMessage = apiResponse.message || "An error occurred";
      const errors = apiResponse.errors;

      // If there are field-specific errors, format them
      if (errors) {
        // Handle errors as string (common case)
        if (typeof errors === "string") {
          return Promise.reject(new Error(errors));
        }
        // Handle errors as object (validation errors)
        if (typeof errors === "object" && errors !== null) {
          const formattedErrors = Object.entries(errors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(", ") : messages}`)
            .join("\n");
          return Promise.reject(new Error(formattedErrors || errorMessage));
        }
      }

      return Promise.reject(new Error(errorMessage));
    }

    return Promise.reject(error);
  }
);

export default api;

