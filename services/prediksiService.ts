/** @format */

import api from "./api";
import type { APIResponse } from "@/types/auth";

export type PredictionMethod = "SES" | "DES" | "TES";

export interface PredictionResult {
  id?: number;
  jenis_kendaraan?: number;
  jenis_kendaraan_nama?: string;
  tahun_prediksi: number;
  bulan_prediksi: number;
  metode: PredictionMethod;
  nilai_prediksi: number;
  alpha?: number;
  beta?: number;
  gamma?: number;
  seasonal_periods?: number;
  mape?: number;
  mae?: number;
  rmse?: number;
  nilai_aktual?: number;
  tanggal_prediksi?: string;
  data_training_dari?: string;
  data_training_sampai?: string;
  jumlah_data_training?: number;
  debug?: {
    prediction_only?: boolean;
    actual_value_found?: boolean;
    actual_value?: number;
    prediction?: number;
    note?: string;
  };
}

export interface PredictionListResponse {
  data: PredictionResult[];
  page: number;
  page_size: number;
  total_pages: number;
  total_count: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface PredictionGenerateRequest {
  metode?: PredictionMethod;
  jenis_kendaraan_id?: number;
  tahun_prediksi: number;
  bulan_prediksi: number;
  alpha?: number;
  beta?: number;
  gamma?: number;
  seasonal_periods?: number;
}

export interface CompareMethodResult {
  nilai_prediksi: number;
  mape?: number;
  mae?: number;
  rmse?: number;
  alpha?: number;
  beta?: number;
  gamma?: number;
  seasonal_periods?: number;
  data_training_dari?: string;
  data_training_sampai?: string;
  jumlah_data_training?: number;
  keterangan?: string;
  nilai_aktual?: number;
  error_absolut?: number;
  error_persentase?: number;
  akurasi?: number;
  error?: string;
  // Hybrid-specific fields
  scenario?: string;
  scenarios?: Record<string, {
    prediksi: number;
    factor: number;
    monthly_adjustment: number;
    final_factor: number;
  }>;
  recommended_scenario?: string;
  monthly_mape?: number | null;
  monthly_adjustment?: number;
  tes_prediction?: number;
  tes_parameters?: {
    alpha: number;
    beta: number;
    gamma: number;
  };
  confidence_lower?: number;
  confidence_upper?: number;
}

export interface CompareResponse {
  SES: CompareMethodResult;
  DES: CompareMethodResult;
  TES: CompareMethodResult;
  HYBRID: CompareMethodResult;
  recommendation?: string;
}

export interface PredictionComparison {
  metode: PredictionMethod;
  nilai_prediksi: number;
  mape: number;
  mae: number;
  rmse: number;
  alpha?: number;
  beta?: number;
  gamma?: number;
}

export interface PredictionChartData {
  actual: { periode: string; nilai: number }[];
  predictions: { metode: string; data: { periode: string; nilai: number }[] };
}

export const prediksiService = {
  /**
   * Generate prediksi
   */
  async generate(data: PredictionGenerateRequest): Promise<PredictionResult> {
    const response = await api.post<APIResponse<PredictionResult>>(
      `/crud/prediksi/generate/`,
      data
    );
    return response.data.results!;
  },

  /**
   * Compare prediction methods
   */
  async compare(params: {
    tahun_prediksi: number;
    bulan_prediksi: number;
    jenis_kendaraan_id?: number;
    seasonal_periods?: number;
  }): Promise<CompareResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append("tahun_prediksi", params.tahun_prediksi.toString());
    queryParams.append("bulan_prediksi", params.bulan_prediksi.toString());
    if (params.jenis_kendaraan_id) {
      queryParams.append("jenis_kendaraan_id", params.jenis_kendaraan_id.toString());
    }
    if (params.seasonal_periods) {
      queryParams.append("seasonal_periods", params.seasonal_periods.toString());
    }

    const response = await api.get<APIResponse<CompareResponse>>(
      `/crud/prediksi/compare/?${queryParams.toString()}`
    );
    return response.data.results!;
  },

  /**
   * Get chart data
   */
  async getChartData(jenis_kendaraan_id?: number): Promise<PredictionChartData> {
    const params = new URLSearchParams();
    if (jenis_kendaraan_id) {
      params.append("jenis_kendaraan_id", jenis_kendaraan_id.toString());
    }

    const response = await api.get<APIResponse<PredictionChartData>>(
      `/crud/prediksi/chart/?${params.toString()}`
    );
    return response.data.results!;
  },

  /**
   * Get evaluation metrics
   */
  async getEvaluation(jenis_kendaraan_id?: number): Promise<{
    best_method: string;
    comparisons: PredictionComparison[];
  }> {
    const params = new URLSearchParams();
    if (jenis_kendaraan_id) {
      params.append("jenis_kendaraan_id", jenis_kendaraan_id.toString());
    }

    const response = await api.get<APIResponse<{best_method: string; comparisons: PredictionComparison[]}>>(
      `/crud/prediksi/evaluation/?${params.toString()}`
    );
    return response.data.results!;
  },

  /**
   * Get list hasil prediksi
   */
  async getList(params?: {
    page?: number;
    page_size?: number;
    jenis_kendaraan_id?: number;
    metode?: PredictionMethod;
    tahun_prediksi?: number;
    bulan_prediksi?: number;
  }): Promise<PredictionListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.page_size)
      queryParams.append("page_size", params.page_size.toString());
    if (params?.jenis_kendaraan_id)
      queryParams.append("jenis_kendaraan_id", params.jenis_kendaraan_id.toString());
    if (params?.metode) queryParams.append("metode", params.metode);
    if (params?.tahun_prediksi)
      queryParams.append("tahun_prediksi", params.tahun_prediksi.toString());
    if (params?.bulan_prediksi)
      queryParams.append("bulan_prediksi", params.bulan_prediksi.toString());

    const response = await api.get<APIResponse<PredictionListResponse>>(
      `/crud/hasil-prediksi/?${queryParams.toString()}`
    );
    return response.data.results!;
  },

  /**
   * Delete prediksi
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/crud/hasil-prediksi/${id}/`);
  },

  /**
   * Save prediksi ke database (tanpa generate ulang)
   */
  async save(data: PredictionGenerateRequest & { keterangan?: string; prediction_data?: PredictionResult }): Promise<PredictionResult> {
    const response = await api.post<APIResponse<PredictionResult>>(
      `/crud/prediksi/generate/`,
      {
        ...data,
        save_to_db: true,
      }
    );
    return response.data.results!;
  },
};

// Method options
export const METHOD_OPTIONS: { value: PredictionMethod; label: string; description: string }[] = [
  { value: "SES", label: "SES", description: "Simple Exponential Smoothing - Untuk data tanpa tren dan musiman" },
  { value: "DES", label: "DES", description: "Double Exponential Smoothing - Untuk data dengan tren" },
  { value: "TES", label: "TES", description: "Triple Exponential Smoothing - Untuk data dengan tren dan musiman" },
];

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
