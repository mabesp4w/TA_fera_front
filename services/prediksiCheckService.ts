/** @format */

import api from "./api";
import type { APIResponse } from "@/types/auth";

export interface DataCheckResponse {
  jumlah_data: number;
  data_dari: string | null;
  data_sampai: string | null;
  available_methods: string[];
  ses_available: boolean;
  des_available: boolean;
  tes_available: boolean;
  hybrid_available: boolean;
  recommendation: string;
}

export const prediksiCheckService = {
  /**
   * Cek ketersediaan data historis
   */
  async checkData(jenisKendaraanId?: number): Promise<DataCheckResponse> {
    const params = new URLSearchParams();
    if (jenisKendaraanId) {
      params.append("jenis_kendaraan_id", jenisKendaraanId.toString());
    }

    const response = await api.get<APIResponse<DataCheckResponse>>(
      `/crud/prediksi/check-data/?${params.toString()}`
    );
    return response.data.results!;
  },
};
