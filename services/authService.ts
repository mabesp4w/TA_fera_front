/** @format */

import api from "./api";
import type { LoginRequest, LoginResponse, APIResponse, User } from "@/types/auth";

export const authService = {
  /**
   * Login user
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<APIResponse<LoginResponse>>("/auth/login/", credentials);
    return response.data.results!;
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await api.post<APIResponse>("/auth/logout/");
  },

  /**
   * Get user profile
   */
  async getProfile(): Promise<User> {
    const response = await api.get<APIResponse<{ user: User; role: string }>>("/auth/profile/");
    return response.data.results!.user;
  },
};

