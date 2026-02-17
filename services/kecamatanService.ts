/** @format */

import api from "./api";
import type { APIResponse } from "@/types/auth";

export interface Kecamatan {
  id: number;
  nama: string;
}

export interface KecamatanListResponse {
  data: Kecamatan[];
  page: number;
  page_size: number;
  total_pages: number;
  total_count: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface KecamatanFormData {
  nama: string;
}

export const kecamatanService = {
  /**
   * Get list kecamatan dengan pagination dan search
   */
  async getList(params?: {
    page?: number;
    page_size?: number;
    search?: string;
  }): Promise<KecamatanListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.page_size) queryParams.append("page_size", params.page_size.toString());
    if (params?.search) queryParams.append("search", params.search);

    const response = await api.get<APIResponse<KecamatanListResponse>>(
      `/crud/kecamatan/?${queryParams.toString()}`
    );
    // Backend returns: { status: 'success', message: '...', results: { data: [...], total_count: ..., ... } }
    return response.data.results!;
  },

  /**
   * Get detail kecamatan by ID
   */
  async getById(id: number): Promise<Kecamatan> {
    const response = await api.get<APIResponse<Kecamatan>>(
      `/crud/kecamatan/${id}/`
    );
    return response.data.results!;
  },

  /**
   * Create kecamatan baru
   */
  async create(data: KecamatanFormData): Promise<Kecamatan> {
    const response = await api.post<APIResponse<Kecamatan>>(
      `/crud/kecamatan/`,
      data
    );
    return response.data.results!;
  },

  /**
   * Update kecamatan
   */
  async update(id: number, data: KecamatanFormData): Promise<Kecamatan> {
    const response = await api.put<APIResponse<Kecamatan>>(
      `/crud/kecamatan/${id}/`,
      data
    );
    return response.data.results!;
  },

  /**
   * Partial update kecamatan
   */
  async partialUpdate(
    id: number,
    data: Partial<KecamatanFormData>
  ): Promise<Kecamatan> {
    const response = await api.patch<APIResponse<Kecamatan>>(
      `/crud/kecamatan/${id}/`,
      data
    );
    return response.data.results!;
  },

  /**
   * Delete kecamatan
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/crud/kecamatan/${id}/`);
  },
};

