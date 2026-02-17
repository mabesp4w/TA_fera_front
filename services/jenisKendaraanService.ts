/** @format */

import api from "./api";
import type { APIResponse } from "@/types/auth";

export interface JenisKendaraan {
  id: number;
  nama: string;
  kategori: "MOTOR" | "MOBIL" | "JEEP" | "TRUK" | "BUS" | "LAINNYA";
  kategori_display: string;
}

export interface JenisKendaraanListResponse {
  data: JenisKendaraan[];
  page: number;
  page_size: number;
  total_pages: number;
  total_count: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface JenisKendaraanFormData {
  nama: string;
  kategori: "MOTOR" | "MOBIL" | "JEEP" | "TRUK" | "BUS" | "LAINNYA";
}

export const jenisKendaraanService = {
  /**
   * Get list jenis kendaraan dengan pagination dan search
   */
  async getList(params?: {
    page?: number;
    page_size?: number;
    search?: string;
  }): Promise<JenisKendaraanListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.page_size) queryParams.append("page_size", params.page_size.toString());
    if (params?.search) queryParams.append("search", params.search);

    const response = await api.get<APIResponse<JenisKendaraanListResponse>>(
      `/crud/jenis-kendaraan/?${queryParams.toString()}`
    );
    // Backend returns: { status: 'success', message: '...', results: { data: [...], total_count: ..., ... } }
    return response.data.results!;
  },

  /**
   * Get detail jenis kendaraan by ID
   */
  async getById(id: number): Promise<JenisKendaraan> {
    const response = await api.get<APIResponse<JenisKendaraan>>(
      `/crud/jenis-kendaraan/${id}/`
    );
    return response.data.results!;
  },

  /**
   * Create jenis kendaraan baru
   */
  async create(data: JenisKendaraanFormData): Promise<JenisKendaraan> {
    const response = await api.post<APIResponse<JenisKendaraan>>(
      `/crud/jenis-kendaraan/`,
      data
    );
    return response.data.results!;
  },

  /**
   * Update jenis kendaraan
   */
  async update(id: number, data: JenisKendaraanFormData): Promise<JenisKendaraan> {
    const response = await api.put<APIResponse<JenisKendaraan>>(
      `/crud/jenis-kendaraan/${id}/`,
      data
    );
    return response.data.results!;
  },

  /**
   * Partial update jenis kendaraan
   */
  async partialUpdate(
    id: number,
    data: Partial<JenisKendaraanFormData>
  ): Promise<JenisKendaraan> {
    const response = await api.patch<APIResponse<JenisKendaraan>>(
      `/crud/jenis-kendaraan/${id}/`,
      data
    );
    return response.data.results!;
  },

  /**
   * Delete jenis kendaraan
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/crud/jenis-kendaraan/${id}/`);
  },
};

