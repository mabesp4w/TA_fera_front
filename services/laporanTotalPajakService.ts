/** @format */

import api from "./api";
import type { APIResponse } from "@/types/auth";

export interface LaporanTotalPajak {
  id: string;
  kendaraan_id: number;
  no_polisi: string;
  jenis_kendaraan: string;
  kategori_kendaraan: string;
  merek: string;
  type_kendaraan: string;
  nama_pemilik: string;
  tahun: number;
  bulan: number;
  nama_bulan: string;
  // Backend mengirim Decimal sebagai string
  total_pokok_pkb: number | string;
  total_denda_pkb: number | string;
  total_tunggakan_pokok_pkb: number | string;
  total_tunggakan_denda_pkb: number | string;
  total_opsen_pokok_pkb: number | string;
  total_opsen_denda_pkb: number | string;
  total_pokok_swdkllj: number | string;
  total_denda_swdkllj: number | string;
  total_tunggakan_pokok_swdkllj: number | string;
  total_tunggakan_denda_swdkllj: number | string;
  total_pokok_bbnkb: number | string;
  total_denda_bbnkb: number | string;
  total_opsen_pokok_bbnkb: number | string;
  total_opsen_denda_bbnkb: number | string;
  total_pkb: number | string;
  total_swdkllj: number | string;
  total_bbnkb: number | string;
  total_opsen: number | string;
  total_bayar: number | string;
  jumlah_transaksi: number;
}

export interface LaporanTotalPajakListResponse {
  data: LaporanTotalPajak[];
  page: number;
  page_size: number;
  total_pages: number;
  total_count: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface LaporanTotalPajakSummary {
  // Backend mengirim Decimal sebagai string
  total_pokok_pkb: number | string;
  total_denda_pkb: number | string;
  total_tunggakan_pokok_pkb: number | string;
  total_tunggakan_denda_pkb: number | string;
  total_opsen_pokok_pkb: number | string;
  total_opsen_denda_pkb: number | string;
  total_pokok_swdkllj: number | string;
  total_denda_swdkllj: number | string;
  total_tunggakan_pokok_swdkllj: number | string;
  total_tunggakan_denda_swdkllj: number | string;
  total_pokok_bbnkb: number | string;
  total_denda_bbnkb: number | string;
  total_opsen_pokok_bbnkb: number | string;
  total_opsen_denda_bbnkb: number | string;
  total_pkb: number | string;
  total_swdkllj: number | string;
  total_bbnkb: number | string;
  total_opsen: number | string;
  total_bayar: number | string;
  jumlah_transaksi: number;
  jumlah_kendaraan: number;
}

export interface FilterOptions {
  tahun_options: { value: number; label: string }[];
  bulan_options: { value: number; label: string }[];
}

export const laporanTotalPajakService = {
  /**
   * Get list laporan total pajak dengan pagination dan filter
   */
  async getList(params?: {
    page?: number;
    page_size?: number;
    tahun?: number;
    bulan?: number;
    kendaraan_id?: number;
    jenis_kendaraan_id?: number;
    search?: string;
  }): Promise<LaporanTotalPajakListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.page_size)
      queryParams.append("page_size", params.page_size.toString());
    if (params?.tahun) queryParams.append("tahun", params.tahun.toString());
    if (params?.bulan) queryParams.append("bulan", params.bulan.toString());
    if (params?.kendaraan_id)
      queryParams.append("kendaraan_id", params.kendaraan_id.toString());
    if (params?.jenis_kendaraan_id)
      queryParams.append(
        "jenis_kendaraan_id",
        params.jenis_kendaraan_id.toString()
      );
    if (params?.search) queryParams.append("search", params.search);

    const response = await api.get<APIResponse<LaporanTotalPajakListResponse>>(
      `/crud/laporan-total-pajak/?${queryParams.toString()}`
    );
    return response.data.results!;
  },

  /**
   * Get summary laporan total pajak
   */
  async getSummary(params?: {
    tahun?: number;
    bulan?: number;
    jenis_kendaraan_id?: number;
  }): Promise<LaporanTotalPajakSummary> {
    const queryParams = new URLSearchParams();
    if (params?.tahun) queryParams.append("tahun", params.tahun.toString());
    if (params?.bulan) queryParams.append("bulan", params.bulan.toString());
    if (params?.jenis_kendaraan_id)
      queryParams.append(
        "jenis_kendaraan_id",
        params.jenis_kendaraan_id.toString()
      );

    const response = await api.get<APIResponse<LaporanTotalPajakSummary>>(
      `/crud/laporan-total-pajak/summary/?${queryParams.toString()}`
    );
    return response.data.results!;
  },

  /**
   * Get filter options (tahun dan bulan yang tersedia di database)
   */
  async getFilterOptions(): Promise<FilterOptions> {
    const response = await api.get<APIResponse<FilterOptions>>(
      `/crud/laporan-total-pajak/filter-options/`
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
