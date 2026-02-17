/** @format */

import api from "./api";
import type { APIResponse } from "@/types/auth";

export interface MerekKendaraan {
  id: number;
  nama: string;
}

export interface MerekKendaraanListResponse {
  data: MerekKendaraan[];
  page: number;
  page_size: number;
  total_pages: number;
  total_count: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface MerekKendaraanFormData {
  nama: string;
}

export const merekKendaraanService = {
  /**
   * Get list merek kendaraan dengan pagination dan search
   */
  async getList(params?: {
    page?: number;
    page_size?: number;
    search?: string;
  }): Promise<MerekKendaraanListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.page_size)
      queryParams.append("page_size", params.page_size.toString());
    if (params?.search) queryParams.append("search", params.search);

    const response = await api.get<APIResponse<MerekKendaraanListResponse>>(
      `/crud/merek-kendaraan/?${queryParams.toString()}`
    );
    return response.data.results!;
  },

  /**
   * Get detail merek kendaraan by ID
   */
  async getById(id: number): Promise<MerekKendaraan> {
    const response = await api.get<APIResponse<MerekKendaraan>>(
      `/crud/merek-kendaraan/${id}/`
    );
    return response.data.results!;
  },

  /**
   * Create merek kendaraan baru
   */
  async create(data: MerekKendaraanFormData): Promise<MerekKendaraan> {
    const response = await api.post<APIResponse<MerekKendaraan>>(
      `/crud/merek-kendaraan/`,
      data
    );
    return response.data.results!;
  },

  /**
   * Update merek kendaraan
   */
  async update(
    id: number,
    data: MerekKendaraanFormData
  ): Promise<MerekKendaraan> {
    const response = await api.put<APIResponse<MerekKendaraan>>(
      `/crud/merek-kendaraan/${id}/`,
      data
    );
    return response.data.results!;
  },

  /**
   * Partial update merek kendaraan
   */
  async partialUpdate(
    id: number,
    data: Partial<MerekKendaraanFormData>
  ): Promise<MerekKendaraan> {
    const response = await api.patch<APIResponse<MerekKendaraan>>(
      `/crud/merek-kendaraan/${id}/`,
      data
    );
    return response.data.results!;
  },

  /**
   * Delete merek kendaraan
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/crud/merek-kendaraan/${id}/`);
  },
};
