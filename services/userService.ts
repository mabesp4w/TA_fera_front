/** @format */

import api from "./api";
import type { APIResponse, User, UserRole } from "@/types/auth";

export interface UserFormData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password?: string;
  role: UserRole;
  is_active?: boolean;
}

export interface UserFilters {
  page?: number;
  page_size?: number;
  search?: string;
  role?: string;
  is_active?: boolean;
}

export interface UsersResponse {
  data: User[];
  total_count: number;
  total_pages: number;
  page: number;
  page_size: number;
}

export const userService = {
  /**
   * Get list of users with pagination and filters
   */
  async getList(filters: UserFilters = {}): Promise<UsersResponse> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.page_size) params.append("page_size", filters.page_size.toString());
    if (filters.search) params.append("search", filters.search);
    if (filters.role) params.append("role", filters.role);
    if (filters.is_active !== undefined) params.append("is_active", filters.is_active.toString());
    
    const queryString = params.toString();
    const url = queryString ? `/auth/users/?${queryString}` : "/auth/users/";
    
    const response = await api.get<APIResponse<UsersResponse>>(url);
    return response.data.results || {
      data: [],
      total_count: 0,
      total_pages: 1,
      page: 1,
      page_size: 10,
    };
  },

  /**
   * Get user by ID
   */
  async getById(id: number): Promise<User> {
    const response = await api.get<APIResponse<User>>(`/auth/users/${id}/`);
    return response.data.results!;
  },

  /**
   * Create new user
   */
  async create(data: UserFormData): Promise<User> {
    const response = await api.post<APIResponse<User>>("/auth/users/", data);
    return response.data.results!;
  },

  /**
   * Update user
   */
  async update(id: number, data: Partial<UserFormData>): Promise<User> {
    const response = await api.patch<APIResponse<User>>(`/auth/users/${id}/`, data);
    return response.data.results!;
  },

  /**
   * Delete user
   */
  async delete(id: number): Promise<void> {
    await api.delete<APIResponse>(`/auth/users/${id}/`);
  },

  /**
   * Change user password (admin only)
   */
  async changePassword(id: number, newPassword: string): Promise<void> {
    await api.post<APIResponse>(`/auth/users/${id}/change-password/`, {
      password: newPassword,
    });
  },

  /**
   * Toggle user active status
   */
  async toggleActive(id: number, isActive: boolean): Promise<User> {
    const response = await api.patch<APIResponse<User>>(`/users/${id}/`, {
      is_active: isActive,
    });
    return response.data.results!;
  },

  /**
   * Get users by role
   */
  async getByRole(role: UserRole): Promise<User[]> {
    const response = await api.get<APIResponse<User[]>>(`/auth/users/by-role/?role=${role}`);
    return response.data.results || [];
  },
};
