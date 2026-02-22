/** @format */

export type UserRole = "admin" | "pimpinan" | "user";

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active?: boolean;
  show_password?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  role: string;
  user: User;
  expires_in: number;
}

export interface APIResponse<T = any> {
  status: "success" | "error";
  message: string;
  results?: T;
  errors?: Record<string, string[]>;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

