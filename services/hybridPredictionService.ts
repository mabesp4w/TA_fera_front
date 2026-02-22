/** @format */

import api from "./api";
import type { APIResponse } from "@/types/auth";

export interface HybridPredictionRequest {
  jenis_kendaraan_id?: number;
  tahun_prediksi: number;
  bulan_prediksi: number;
  training_periods?: number;
  selected_scenario?: "conservative" | "base" | "moderate" | "optimistic";
  save_to_db?: boolean;
}

export interface ScenarioResult {
  prediksi: number;
  factor: number;
  monthly_adjustment: number;
  final_factor: number;
  description: string;
}

export interface HybridPredictionResponse {
  nilai_prediksi: number;
  confidence_lower: number;
  confidence_upper: number;
  confidence_interval: number;
  metode: string;
  base_method?: string;
  scenario: string;
  scenarios: {
    conservative: ScenarioResult;
    base: ScenarioResult;
    moderate: ScenarioResult;
    optimistic: ScenarioResult;
  };
  recommended_scenario: string;
  monthly_mape: number | null;
  monthly_adjustment: number;
  tes_prediction: number;
  tes_parameters: {
    alpha: number;
    beta: number;
    gamma: number;
  };
  mape?: number;
  mae?: number;
  rmse?: number;
  data_training_dari: string;
  data_training_sampai: string;
  jumlah_data_training: number;
  training_periods: number;
  used_fallback?: boolean;
  keterangan: string;
  nilai_aktual?: number;
  error_absolut?: number;
  error_persentase?: number;
  akurasi?: number;
  id?: number;
  created_at?: string;
}

export const hybridPredictionService = {
  /**
   * Generate prediction using Hybrid Approach
   */
  async predict(
    data: HybridPredictionRequest
  ): Promise<HybridPredictionResponse> {
    const response = await api.post<APIResponse<HybridPredictionResponse>>(
      "/crud/prediksi/hybrid/generate/",
      data
    );
    return response.data.results!;
  },

  /**
   * Save prediksi hybrid ke database
   */
  async save(data: HybridPredictionRequest & { keterangan?: string; prediction_data?: HybridPredictionResponse }): Promise<HybridPredictionResponse> {
    const response = await api.post<APIResponse<HybridPredictionResponse>>(
      `/crud/prediksi/hybrid/generate/`,
      {
        ...data,
        save_to_db: true,
      }
    );
    return response.data.results!;
  },

  /**
   * Delete prediksi dari database
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/crud/hasil-prediksi/${id}/`);
  },
};
