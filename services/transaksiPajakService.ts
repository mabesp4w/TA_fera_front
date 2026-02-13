/** @format */

import api from "./api";
import type { APIResponse } from "@/types/auth";

export interface TransaksiPajak {
  id: number;
  kendaraan?: number;
  kendaraan_no_polisi?: string;
  kendaraan_merek_nama?: string;
  kendaraan_type_nama?: string;
  kendaraan_jenis_nama?: string;
  kendaraan_jenis_kategori?: string;
  tahun: number;
  bulan: number;
  tgl_pajak: string;
  jml_tahun_bayar: number;
  jml_bulan_bayar: number;
  tgl_bayar: string;
  // Backend mengirim Decimal sebagai string
  pokok_pkb: number | string | null;
  denda_pkb: number | string | null;
  tunggakan_pokok_pkb: number | string | null;
  tunggakan_denda_pkb: number | string | null;
  opsen_pokok_pkb: number | string | null;
  opsen_denda_pkb: number | string | null;
  pokok_swdkllj: number | string | null;
  denda_swdkllj: number | string | null;
  tunggakan_pokok_swdkllj: number | string | null;
  tunggakan_denda_swdkllj: number | string | null;
  pokok_bbnkb: number | string | null;
  denda_bbnkb: number | string | null;
  total_bbnkb: number | string | null;
  opsen_pokok_bbnkb: number | string | null;
  opsen_denda_bbnkb: number | string | null;
  total_bayar: number | string | null;
  created_at?: string;
  updated_at?: string;
}

export interface TransaksiPajakListResponse {
  data: TransaksiPajak[];
  page: number;
  page_size: number;
  total_pages: number;
  total_count: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface TransaksiPajakFormData {
  kendaraan: number;
  tahun: number;
  bulan: number;
  tgl_pajak: string;
  jml_tahun_bayar: number;
  jml_bulan_bayar: number;
  tgl_bayar: string;
  pokok_pkb: number;
  denda_pkb: number;
  tunggakan_pokok_pkb: number;
  tunggakan_denda_pkb: number;
  opsen_pokok_pkb: number;
  opsen_denda_pkb: number;
  pokok_swdkllj: number;
  denda_swdkllj: number;
  tunggakan_pokok_swdkllj: number;
  tunggakan_denda_swdkllj: number;
  pokok_bbnkb: number;
  denda_bbnkb: number;
  total_bbnkb: number;
  opsen_pokok_bbnkb: number;
  opsen_denda_bbnkb: number;
}

export interface FilterOptions {
  tahun_options: { value: number; label: string }[];
  bulan_options: { value: number; label: string }[];
}

export const transaksiPajakService = {
  /**
   * Get list transaksi pajak dengan pagination dan search
   */
  async getList(params?: {
    page?: number;
    page_size?: number;
    search?: string;
    kendaraan_id?: number;
    jenis_kendaraan_id?: number;
    tahun?: number;
    bulan?: number;
  }): Promise<TransaksiPajakListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.page_size)
      queryParams.append("page_size", params.page_size.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.kendaraan_id)
      queryParams.append("kendaraan_id", params.kendaraan_id.toString());
    if (params?.jenis_kendaraan_id)
      queryParams.append("jenis_kendaraan_id", params.jenis_kendaraan_id.toString());
    if (params?.tahun) queryParams.append("tahun", params.tahun.toString());
    if (params?.bulan) queryParams.append("bulan", params.bulan.toString());

    const response = await api.get<APIResponse<TransaksiPajakListResponse>>(
      `/crud/transaksi-pajak/?${queryParams.toString()}`
    );
    return response.data.results!;
  },

  /**
   * Get detail transaksi pajak by ID
   */
  async getById(id: number): Promise<TransaksiPajak> {
    const response = await api.get<APIResponse<TransaksiPajak>>(
      `/crud/transaksi-pajak/${id}/`
    );
    return response.data.results!;
  },

  /**
   * Create transaksi pajak baru
   */
  async create(data: TransaksiPajakFormData): Promise<TransaksiPajak> {
    const response = await api.post<APIResponse<TransaksiPajak>>(
      `/crud/transaksi-pajak/`,
      data
    );
    return response.data.results!;
  },

  /**
   * Update transaksi pajak
   */
  async update(id: number, data: TransaksiPajakFormData): Promise<TransaksiPajak> {
    const response = await api.put<APIResponse<TransaksiPajak>>(
      `/crud/transaksi-pajak/${id}/`,
      data
    );
    return response.data.results!;
  },

  /**
   * Partial update transaksi pajak
   */
  async partialUpdate(
    id: number,
    data: Partial<TransaksiPajakFormData>
  ): Promise<TransaksiPajak> {
    const response = await api.patch<APIResponse<TransaksiPajak>>(
      `/crud/transaksi-pajak/${id}/`,
      data
    );
    return response.data.results!;
  },

  /**
   * Delete transaksi pajak
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/crud/transaksi-pajak/${id}/`);
  },

  /**
   * Get filter options (tahun dan bulan yang tersedia di database)
   */
  async getFilterOptions(): Promise<FilterOptions> {
    const response = await api.get<APIResponse<FilterOptions>>(
      `/crud/transaksi-pajak/filter-options/`
    );
    return response.data.results!;
  },
};
