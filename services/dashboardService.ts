/** @format */

import api from "./api";
import type { APIResponse } from "@/types/auth";

export interface DashboardData {
  users: {
    total: number;
    active: number;
    inactive: number;
    by_role: Record<string, number>;
  };
  kendaraan: {
    total: number;
    baru_30_hari: number;
    by_jenis: Array<{
      jenis: string;
      count: number;
    }>;
  };
  wajib_pajak: {
    total: number;
    by_kecamatan: Array<{
      kecamatan: string;
      count: number;
    }>;
  };
  transaksi: {
    total: number;
    bulan_ini: number;
    "7_hari_terakhir": number;
  };
  pendapatan: {
    total_all_time: number;
    bulan_ini: number;
    bulan_lalu: number;
    selisih_bulan_ini: number;
    persentase_perubahan: number;
    by_jenis_kendaraan: Array<{
      jenis: string;
      total: number;
      count: number;
    }>;
  };
  agregat: {
    total: number;
    bulan_ini: number;
  };
  prediksi: {
    total: number;
    by_metode: Array<{
      metode: string;
      count: number;
    }>;
    terbaru: {
      tahun: number;
      bulan: number;
      metode: string;
      nilai: number;
    } | null;
  };
  master_data: {
    jenis_kendaraan: number;
    kecamatan: number;
    kelurahan: number;
  };
  periode: {
    tahun_sekarang: number;
    bulan_sekarang: number;
    bulan_lalu: number;
    tahun_lalu: number;
  };
}

export const dashboardService = {
  /**
   * Get dashboard data
   */
  async getDashboard(): Promise<DashboardData> {
    const response = await api.get<APIResponse<DashboardData>>("/crud/dashboard/");
    return response.data.results!;
  },
};

