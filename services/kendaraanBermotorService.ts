/** @format */

import api from "./api";
import type { APIResponse } from "@/types/auth";

export type BBMType = "BENSIN" | "SOLAR" | "LISTRIK" | "HYBRID";

export interface KendaraanBermotor {
  id: number;
  jenis?: number;
  jenis_nama?: string;
  type_kendaraan?: number;
  type_kendaraan_nama?: string;
  wajib_pajak?: number;
  wajib_pajak_nama?: string;
  no_polisi: string;
  no_rangka: string;
  no_mesin: string;
  tahun_buat: number;
  jml_cc: number;
  bbm: BBMType;
  created_at?: string;
  updated_at?: string;
}

export interface KendaraanBermotorListResponse {
  data: KendaraanBermotor[];
  page: number;
  page_size: number;
  total_pages: number;
  total_count: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface KendaraanBermotorFormData {
  jenis?: number;
  type_kendaraan?: number;
  wajib_pajak?: number;
  no_polisi: string;
  no_rangka: string;
  no_mesin: string;
  tahun_buat: number;
  jml_cc: number;
  bbm: BBMType;
}

export const kendaraanBermotorService = {
  /**
   * Get list kendaraan bermotor dengan pagination dan search
   */
  async getList(params?: {
    page?: number;
    page_size?: number;
    search?: string;
    jenis_id?: number;
    type_kendaraan_id?: number;
    wajib_pajak_id?: number;
  }): Promise<KendaraanBermotorListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.page_size)
      queryParams.append("page_size", params.page_size.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.jenis_id)
      queryParams.append("jenis_id", params.jenis_id.toString());
    if (params?.type_kendaraan_id)
      queryParams.append("type_kendaraan_id", params.type_kendaraan_id.toString());
    if (params?.wajib_pajak_id)
      queryParams.append("wajib_pajak_id", params.wajib_pajak_id.toString());

    const response = await api.get<APIResponse<KendaraanBermotorListResponse>>(
      `/crud/kendaraan-bermotor/?${queryParams.toString()}`
    );
    return response.data.results!;
  },

  /**
   * Get detail kendaraan bermotor by ID
   */
  async getById(id: number): Promise<KendaraanBermotor> {
    const response = await api.get<APIResponse<KendaraanBermotor>>(
      `/crud/kendaraan-bermotor/${id}/`
    );
    return response.data.results!;
  },

  /**
   * Create kendaraan bermotor baru
   */
  async create(data: KendaraanBermotorFormData): Promise<KendaraanBermotor> {
    const response = await api.post<APIResponse<KendaraanBermotor>>(
      `/crud/kendaraan-bermotor/`,
      data
    );
    return response.data.results!;
  },

  /**
   * Update kendaraan bermotor
   */
  async update(
    id: number,
    data: KendaraanBermotorFormData
  ): Promise<KendaraanBermotor> {
    const response = await api.put<APIResponse<KendaraanBermotor>>(
      `/crud/kendaraan-bermotor/${id}/`,
      data
    );
    return response.data.results!;
  },

  /**
   * Partial update kendaraan bermotor
   */
  async partialUpdate(
    id: number,
    data: Partial<KendaraanBermotorFormData>
  ): Promise<KendaraanBermotor> {
    const response = await api.patch<APIResponse<KendaraanBermotor>>(
      `/crud/kendaraan-bermotor/${id}/`,
      data
    );
    return response.data.results!;
  },

  /**
   * Delete kendaraan bermotor
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/crud/kendaraan-bermotor/${id}/`);
  },
};

// BBM options for select
export const BBM_OPTIONS: { value: BBMType; label: string }[] = [
  { value: "BENSIN", label: "Bensin" },
  { value: "SOLAR", label: "Solar" },
  { value: "LISTRIK", label: "Listrik" },
  { value: "HYBRID", label: "Hybrid" },
];
