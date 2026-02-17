/** @format */

import api from "./api";
import type { APIResponse } from "@/types/auth";

export interface WajibPajak {
  id: number;
  no_ktp?: string;
  nama: string;
  alamat: string;
  kelurahan?: number;
  kelurahan_nama?: string;
  created_at?: string;
  updated_at?: string;
}

export interface WajibPajakListResponse {
  data: WajibPajak[];
  page: number;
  page_size: number;
  total_pages: number;
  total_count: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface WajibPajakFormData {
  no_ktp?: string;
  nama: string;
  alamat: string;
  kelurahan?: number;
}

export const wajibPajakService = {
  /**
   * Get list wajib pajak dengan pagination dan search
   */
  async getList(params?: {
    page?: number;
    page_size?: number;
    search?: string;
    kelurahan_id?: number;
  }): Promise<WajibPajakListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.page_size)
      queryParams.append("page_size", params.page_size.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.kelurahan_id)
      queryParams.append("kelurahan_id", params.kelurahan_id.toString());

    const response = await api.get<APIResponse<WajibPajakListResponse>>(
      `/crud/wajib-pajak/?${queryParams.toString()}`
    );
    return response.data.results!;
  },

  /**
   * Get detail wajib pajak by ID
   */
  async getById(id: number): Promise<WajibPajak> {
    const response = await api.get<APIResponse<WajibPajak>>(
      `/crud/wajib-pajak/${id}/`
    );
    return response.data.results!;
  },

  /**
   * Create wajib pajak baru
   */
  async create(data: WajibPajakFormData): Promise<WajibPajak> {
    const response = await api.post<APIResponse<WajibPajak>>(
      `/crud/wajib-pajak/`,
      data
    );
    return response.data.results!;
  },

  /**
   * Update wajib pajak
   */
  async update(id: number, data: WajibPajakFormData): Promise<WajibPajak> {
    const response = await api.put<APIResponse<WajibPajak>>(
      `/crud/wajib-pajak/${id}/`,
      data
    );
    return response.data.results!;
  },

  /**
   * Partial update wajib pajak
   */
  async partialUpdate(
    id: number,
    data: Partial<WajibPajakFormData>
  ): Promise<WajibPajak> {
    const response = await api.patch<APIResponse<WajibPajak>>(
      `/crud/wajib-pajak/${id}/`,
      data
    );
    return response.data.results!;
  },

  /**
   * Delete wajib pajak
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/crud/wajib-pajak/${id}/`);
  },
};
