/** @format */

import api from "./api";
import type { APIResponse } from "@/types/auth";

export interface Kelurahan {
  id: number;
  nama: string;
  kecamatan?: number;
  kecamatan_nama?: string;
}

export interface KelurahanListResponse {
  data: Kelurahan[];
  page: number;
  page_size: number;
  total_pages: number;
  total_count: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface KelurahanFormData {
  nama: string;
  kecamatan?: number;
}

export const kelurahanService = {
  /**
   * Get list kelurahan dengan pagination dan search
   */
  async getList(params?: {
    page?: number;
    page_size?: number;
    search?: string;
    kecamatan_id?: number;
  }): Promise<KelurahanListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.page_size) queryParams.append("page_size", params.page_size.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.kecamatan_id) queryParams.append("kecamatan_id", params.kecamatan_id.toString());

    const response = await api.get<APIResponse<KelurahanListResponse>>(
      `/crud/kelurahan/?${queryParams.toString()}`
    );
    // Backend returns: { status: 'success', message: '...', results: { data: [...], total_count: ..., ... } }
    return response.data.results!;
  },

  /**
   * Get detail kelurahan by ID
   */
  async getById(id: number): Promise<Kelurahan> {
    const response = await api.get<APIResponse<Kelurahan>>(
      `/crud/kelurahan/${id}/`
    );
    return response.data.results!;
  },

  /**
   * Create kelurahan baru
   */
  async create(data: KelurahanFormData): Promise<Kelurahan> {
    const response = await api.post<APIResponse<Kelurahan>>(
      `/crud/kelurahan/`,
      data
    );
    return response.data.results!;
  },

  /**
   * Update kelurahan
   */
  async update(id: number, data: KelurahanFormData): Promise<Kelurahan> {
    const response = await api.put<APIResponse<Kelurahan>>(
      `/crud/kelurahan/${id}/`,
      data
    );
    return response.data.results!;
  },

  /**
   * Partial update kelurahan
   */
  async partialUpdate(
    id: number,
    data: Partial<KelurahanFormData>
  ): Promise<Kelurahan> {
    const response = await api.patch<APIResponse<Kelurahan>>(
      `/crud/kelurahan/${id}/`,
      data
    );
    return response.data.results!;
  },

  /**
   * Delete kelurahan
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/crud/kelurahan/${id}/`);
  },
};

