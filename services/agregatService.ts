/** @format */

import api from "./api";
import type { APIResponse } from "@/types/auth";

export interface AgregatPendapatan {
  id: number;
  tahun: number;
  bulan: number;
  jenis_kendaraan?: number;
  jenis_kendaraan_nama?: string;
  total_pendapatan: number;
  total_pokok_pkb: number;
  total_denda_pkb: number;
  total_swdkllj: number;
  total_bbnkb: number;
  total_opsen: number;
  jumlah_transaksi: number;
  jumlah_kendaraan: number;
  last_aggregated: string;
}

export interface AgregatListResponse {
  data: AgregatPendapatan[];
  page: number;
  page_size: number;
  total_pages: number;
  total_count: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface AgregatRegenerateRequest {
  tahun?: number;
  bulan?: number;
  jenis_kendaraan_id?: number;
  regenerate_all?: boolean;
}

export interface AgregatRegenerateResponse {
  created: number;
  updated: number;
  deleted: number;
  total: number;
  nov_2025_remaining?: number;
}

export interface FilterOptions {
  tahun_options: { value: number; label: string }[];
  bulan_options: { value: number; label: string }[];
}

export interface AgregatSummary {
  total_pendapatan: number;
  total_pokok_pkb: number;
  total_denda_pkb: number;
  total_swdkllj: number;
  total_bbnkb: number;
  total_opsen: number;
  jumlah_transaksi: number;
  jumlah_kendaraan: number;
  jumlah_periode: number;
}

export const agregatPendapatanService = {
  // ...same implementation as agregatService
  
  /**
   * Get list agregat pendapatan bulanan
   */
  async getList(params?: {
    page?: number;
    page_size?: number;
    tahun?: number;
    bulan?: number;
    jenis_kendaraan_id?: number;
  }): Promise<AgregatListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.page_size)
      queryParams.append("page_size", params.page_size.toString());
    if (params?.tahun)
      queryParams.append("tahun", params.tahun.toString());
    if (params?.bulan) queryParams.append("bulan", params.bulan.toString());
    if (params?.jenis_kendaraan_id)
      queryParams.append(
        "jenis_kendaraan_id",
        params.jenis_kendaraan_id.toString()
      );

    const response = await api.get<APIResponse<AgregatListResponse>>(
      `/crud/agregat-pendapatan-bulanan/?${queryParams.toString()}`
    );
    return response.data.results!;
  },

  /**
   * Get detail agregat
   */
  async getDetail(id: number): Promise<AgregatPendapatan> {
    const response = await api.get<APIResponse<AgregatPendapatan>>(
      `/crud/agregat-pendapatan-bulanan/${id}/`
    );
    return response.data.results!;
  },

  /**
   * Regenerate agregat data
   */
  async regenerate(
    data: AgregatRegenerateRequest
  ): Promise<AgregatRegenerateResponse> {
    const response = await api.post<APIResponse<AgregatRegenerateResponse>>(
      `/crud/agregat-pendapatan-bulanan/regenerate/`,
      data
    );
    return response.data.results!;
  },

  /**
   * Get filter options (tahun dan bulan yang tersedia di database)
   */
  async getFilterOptions(): Promise<FilterOptions> {
    const response = await api.get<APIResponse<FilterOptions>>(
      `/crud/agregat-pendapatan-bulanan/filter-options/`
    );
    return response.data.results!;
  },

  /**
   * Get summary agregat (total keseluruhan tanpa pagination)
   */
  async getSummary(params?: {
    tahun?: number;
    bulan?: number;
    jenis_kendaraan_id?: number;
  }): Promise<AgregatSummary> {
    const queryParams = new URLSearchParams();
    if (params?.tahun) queryParams.append("tahun", params.tahun.toString());
    if (params?.bulan) queryParams.append("bulan", params.bulan.toString());
    if (params?.jenis_kendaraan_id)
      queryParams.append(
        "jenis_kendaraan_id",
        params.jenis_kendaraan_id.toString()
      );

    const response = await api.get<APIResponse<AgregatSummary>>(
      `/crud/agregat-pendapatan-bulanan/summary/?${queryParams.toString()}`
    );
    return response.data.results!;
  },
};

// Alias for backward compatibility
export const agregatService = {
  /**
   * Get list agregat pendapatan bulanan
   */
  async getList(params?: {
    page?: number;
    page_size?: number;
    tahun?: number;
    bulan?: number;
    jenis_kendaraan_id?: number;
  }): Promise<AgregatListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.page_size)
      queryParams.append("page_size", params.page_size.toString());
    if (params?.tahun)
      queryParams.append("tahun", params.tahun.toString());
    if (params?.bulan) queryParams.append("bulan", params.bulan.toString());
    if (params?.jenis_kendaraan_id)
      queryParams.append(
        "jenis_kendaraan_id",
        params.jenis_kendaraan_id.toString()
      );

    const response = await api.get<APIResponse<AgregatListResponse>>(
      `/crud/agregat-pendapatan-bulanan/?${queryParams.toString()}`
    );
    return response.data.results!;
  },

  /**
   * Get detail agregat
   */
  async getDetail(id: number): Promise<AgregatPendapatan> {
    const response = await api.get<APIResponse<AgregatPendapatan>>(
      `/crud/agregat-pendapatan-bulanan/${id}/`
    );
    return response.data.results!;
  },

  /**
   * Regenerate agregat data
   */
  async regenerate(
    data: AgregatRegenerateRequest
  ): Promise<AgregatRegenerateResponse> {
    const response = await api.post<APIResponse<AgregatRegenerateResponse>>(
      `/crud/agregat-pendapatan-bulanan/regenerate/`,
      data
    );
    return response.data.results!;
  },

  /**
   * Get filter options (tahun dan bulan yang tersedia di database)
   */
  async getFilterOptions(): Promise<FilterOptions> {
    const response = await api.get<APIResponse<FilterOptions>>(
      `/crud/agregat-pendapatan-bulanan/filter-options/`
    );
    return response.data.results!;
  },

  /**
   * Get summary agregat (total keseluruhan tanpa pagination)
   */
  async getSummary(params?: {
    tahun?: number;
    bulan?: number;
    jenis_kendaraan_id?: number;
  }): Promise<AgregatSummary> {
    const queryParams = new URLSearchParams();
    if (params?.tahun) queryParams.append("tahun", params.tahun.toString());
    if (params?.bulan) queryParams.append("bulan", params.bulan.toString());
    if (params?.jenis_kendaraan_id)
      queryParams.append(
        "jenis_kendaraan_id",
        params.jenis_kendaraan_id.toString()
      );

    const response = await api.get<APIResponse<AgregatSummary>>(
      `/crud/agregat-pendapatan-bulanan/summary/?${queryParams.toString()}`
    );
    return response.data.results!;
  },
};

// Bulan options
export const BULAN_OPTIONS: { value: number; label: string }[] = [
  { value: 1, label: "Januari" },
  { value: 2, label: "Februari" },
  { value: 3, label: "Maret" },
  { value: 4, label: "April" },
  { value: 5, label: "Mei" },
  { value: 6, label: "Juni" },
  { value: 7, label: "Juli" },
  { value: 8, label: "Agustus" },
  { value: 9, label: "September" },
  { value: 10, label: "Oktober" },
  { value: 11, label: "November" },
  { value: 12, label: "Desember" },
];

// Year options (current year - 5 to current year + 1)
const currentYear = new Date().getFullYear();
export const TAHUN_OPTIONS: { value: number; label: string }[] = Array.from(
  { length: 10 },
  (_, i) => {
    const year = currentYear - 5 + i;
    return { value: year, label: year.toString() };
  }
);
