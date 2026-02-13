/** @format */

"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, LoginRequest } from "@/types/auth";
import { authService } from "@/services/authService";
import { toast } from "@/services";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      login: async (credentials: LoginRequest) => {
        try {
          set({ isLoading: true });
          const response = await authService.login(credentials);
          
          // Store token and user data
          if (typeof window !== "undefined") {
            localStorage.setItem("token", response.token);
            localStorage.setItem("user", JSON.stringify(response.user));
          }

          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          });

          toast.success("Login berhasil!");
        } catch (error: any) {
          set({ isLoading: false });
          const errorMessage = error?.message || "Login gagal. Silakan coba lagi.";
          toast.error(errorMessage);
          throw error;
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true });
          await authService.logout();
        } catch (error) {
          // Continue with logout even if API call fails
          console.error("Logout error:", error);
        } finally {
          // Clear local storage
          if (typeof window !== "undefined") {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
          }

          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });

          toast.success("Logout berhasil!");
        }
      },

      checkAuth: async () => {
        try {
          const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
          
          if (!token) {
            set({
              user: null,
              token: null,
              isAuthenticated: false,
            });
            return;
          }

          // Verify token by getting profile
          const user = await authService.getProfile();
          
          set({
            user,
            token,
            isAuthenticated: true,
          });
        } catch (error) {
          // Token invalid or expired
          if (typeof window !== "undefined") {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
          }
          
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

