/** @format */

import api from "./api";
import type { APIResponse } from "@/types/auth";

export interface TypeKendaraan {
  id: number;
  nama: string;
  merek?: number;
  merek_nama?: string;
}

export interface TypeKendaraanListResponse {
  data: TypeKendaraan[];
  page: number;
  page_size: number;
  total_pages: number;
  total_count: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface TypeKendaraanFormData {
  nama: string;
  merek?: number;
}

export const typeKendaraanService = {
  /**
   * Get list type kendaraan dengan pagination dan search
   */
  async getList(params?: {
    page?: number;
    page_size?: number;
    search?: string;
    merek_id?: number;
  }): Promise<TypeKendaraanListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.page_size)
      queryParams.append("page_size", params.page_size.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.merek_id)
      queryParams.append("merek_id", params.merek_id.toString());

    const response = await api.get<APIResponse<TypeKendaraanListResponse>>(
      `/crud/type-kendaraan/?${queryParams.toString()}`
    );
    return response.data.results!;
  },

  /**
   * Get detail type kendaraan by ID
   */
  async getById(id: number): Promise<TypeKendaraan> {
    const response = await api.get<APIResponse<TypeKendaraan>>(
      `/crud/type-kendaraan/${id}/`
    );
    return response.data.results!;
  },

  /**
   * Create type kendaraan baru
   */
  async create(data: TypeKendaraanFormData): Promise<TypeKendaraan> {
    const response = await api.post<APIResponse<TypeKendaraan>>(
      `/crud/type-kendaraan/`,
      data
    );
    return response.data.results!;
  },

  /**
   * Update type kendaraan
   */
  async update(
    id: number,
    data: TypeKendaraanFormData
  ): Promise<TypeKendaraan> {
    const response = await api.put<APIResponse<TypeKendaraan>>(
      `/crud/type-kendaraan/${id}/`,
      data
    );
    return response.data.results!;
  },

  /**
   * Partial update type kendaraan
   */
  async partialUpdate(
    id: number,
    data: Partial<TypeKendaraanFormData>
  ): Promise<TypeKendaraan> {
    const response = await api.patch<APIResponse<TypeKendaraan>>(
      `/crud/type-kendaraan/${id}/`,
      data
    );
    return response.data.results!;
  },

  /**
   * Delete type kendaraan
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/crud/type-kendaraan/${id}/`);
  },
};
