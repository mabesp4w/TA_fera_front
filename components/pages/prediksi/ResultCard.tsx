/** @format */

"use client";

import { Card, Button } from "@/components/ui";
import { TrendingUp, Calendar, Calculator, Trash2, TrendingDown, Brain, BarChart3 } from "lucide-react";
import type { PredictionResult } from "@/services/prediksiService";

interface ResultCardProps {
  result: PredictionResult;
  onDelete?: (result: PredictionResult) => void;
}

const METODE_LABEL: Record<string, string> = {
  SES: "Simple Exponential Smoothing",
  DES: "Double Exponential Smoothing",
  TES: "Triple Exponential Smoothing",
};

// Helper untuk format currency
const formatRupiah = (amount: number | string | null | undefined) => {
  if (amount === null || amount === undefined) return "Rp 0";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

// Helper untuk format number
const formatNumber = (num: number | string | null | undefined) => {
  if (num === null || num === undefined) return "0";
  const n = typeof num === "string" ? parseFloat(num) : num;
  if (isNaN(n)) return "0";
  return new Intl.NumberFormat("id-ID").format(n);
};

export default function ResultCard({ result, onDelete }: ResultCardProps) {
  const mapeValue = typeof result.mape === "string" ? parseFloat(result.mape) : result.mape;
  const maeValue = typeof result.mae === "string" ? parseFloat(result.mae) : result.mae;
  const rmseValue = typeof result.rmse === "string" ? parseFloat(result.rmse) : result.rmse;
  const nilaiPrediksi = typeof result.nilai_prediksi === "string" ? parseFloat(result.nilai_prediksi) : result.nilai_prediksi;
  const nilaiAktual = typeof result.nilai_aktual === "string" ? parseFloat(result.nilai_aktual) : result.nilai_aktual;

  // Cek apakah ini prediksi murni (tanpa nilai aktual)
  const isPredictionOnly = result.debug?.prediction_only === true || (!result.nilai_aktual && !mapeValue);
  
  // Hitung selisih dan error percentage
  const selisih = nilaiAktual ? nilaiPrediksi - nilaiAktual : null;
  const errorPercent = nilaiAktual && selisih ? Math.abs(selisih) / nilaiAktual : null;

  const accuracy = mapeValue ? (100 - mapeValue).toFixed(2) : null;
  const accuracyColor = mapeValue && mapeValue <= 10
      ? "text-success"
      : mapeValue && mapeValue <= 20
        ? "text-warning"
        : "text-error";

  return (
    <Card className="p-0 overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="badge badge-primary badge-sm whitespace-nowrap">
                <Brain className="w-3 h-3 mr-1" />
                {METODE_LABEL[result.metode] || result.metode}
              </span>
              {result.jenis_kendaraan_nama && (
                <span className="badge badge-secondary badge-sm whitespace-nowrap">
                  <BarChart3 className="w-3 h-3 mr-1" />
                  {result.jenis_kendaraan_nama}
                </span>
              )}
              {result.nilai_aktual ? (
                <span className="badge badge-success badge-sm whitespace-nowrap" title="Nilai aktual sudah tersedia - untuk validasi model">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Validasi
                </span>
              ) : (
                <span className="badge badge-warning badge-sm whitespace-nowrap" title="Nilai aktual belum tersedia - prediksi murni">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Prediksi
                </span>
              )}
            </div>
            <div className="text-sm text-base-content/70 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Periode: {result.bulan_prediksi}/{result.tahun_prediksi}
            </div>
          </div>
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(result)}
              className="btn-circle text-error shrink-0"
              title="Hapus"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Nilai Prediksi vs Aktual */}
        <div className="bg-primary/10 p-4 rounded-xl mb-4">
          {nilaiAktual ? (
            // Mode Validasi: Tampilkan Prediksi vs Aktual
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  Prediksi:
                </span>
                <span className="text-lg sm:text-xl font-bold text-primary whitespace-nowrap">
                  {formatRupiah(nilaiPrediksi)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm pt-2 border-t border-primary/20">
                <span className="text-base-content/70 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Aktual:
                </span>
                <span className="font-semibold text-success">
                  {formatRupiah(nilaiAktual)}
                </span>
              </div>
              {/* Selisih */}
              {selisih !== null && errorPercent !== null && (
                <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-primary/20">
                  <span className="text-base-content/50">Selisih:</span>
                  <span className={`font-medium ${
                    errorPercent < 0.1 ? "text-success" : errorPercent < 0.2 ? "text-warning" : "text-error"
                  }`}>
                    {formatRupiah(selisih)}
                    {selisih > 0 ? " (Over)" : " (Under)"}
                  </span>
                </div>
              )}
            </>
          ) : (
            // Mode Prediksi Murni
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                Nilai Prediksi:
              </span>
              <span className="text-xl sm:text-2xl font-bold text-primary whitespace-nowrap">
                {formatRupiah(nilaiPrediksi)}
              </span>
            </div>
          )}
        </div>

        {/* Metrik Evaluasi */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
          <div className="bg-base-200 p-3 rounded-xl">
            <div className="flex items-center justify-center mb-1">
              <Calculator className="w-4 h-4 text-primary" />
            </div>
            <div className="text-[10px] text-base-content/70">MAPE</div>
            <div className={`text-sm font-semibold ${isPredictionOnly ? "text-base-content/50" : ""}`}>
              {isPredictionOnly ? "Prediksi" : mapeValue ? `${mapeValue.toFixed(2)}%` : "-"}
            </div>
          </div>
          <div className="bg-base-200 p-3 rounded-xl">
            <div className="flex items-center justify-center mb-1">
              <TrendingDown className="w-4 h-4 text-secondary" />
            </div>
            <div className="text-[10px] text-base-content/70">MAE</div>
            <div className={`text-sm font-semibold ${isPredictionOnly ? "text-base-content/50" : ""}`}>
              {isPredictionOnly ? "Murni" : formatNumber(maeValue)}
            </div>
          </div>
          <div className="bg-base-200 p-3 rounded-xl">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="w-4 h-4 text-accent" />
            </div>
            <div className="text-[10px] text-base-content/70">RMSE</div>
            <div className={`text-sm font-semibold ${isPredictionOnly ? "text-base-content/50" : ""}`}>
              {isPredictionOnly ? "N/A" : formatNumber(rmseValue)}
            </div>
          </div>
          <div className="bg-base-200 p-3 rounded-xl">
            <div className="flex items-center justify-center mb-1">
              <Brain className="w-4 h-4" />
            </div>
            <div className="text-[10px] text-base-content/70">Akurasi</div>
            <div className={`text-sm font-semibold ${isPredictionOnly ? "text-info" : accuracyColor}`}>
              {isPredictionOnly ? "Test Set" : accuracy ? `${accuracy}%` : "N/A"}
            </div>
          </div>
        </div>
        
        {isPredictionOnly ? (
          <div className="mt-3 p-2 bg-info/10 rounded-lg text-xs text-info text-center">
            <strong>Mode: Prediksi</strong> - Periode yang belum terjadi. 
            Simpan dan bandingkan dengan nilai aktual nanti untuk evaluasi.
          </div>
        ) : (
          <div className="mt-3 p-2 bg-success/10 rounded-lg text-xs text-success text-center">
            <strong>Mode: Validasi</strong> - Nilai aktual sudah tersedia. 
            MAPE menunjukkan seberapa akurat model memprediksi data historis.
          </div>
        )}
        
        {/* Info khusus untuk masing-masing metode */}
        {result.metode === "SES" && isPredictionOnly && (
          <div className="mt-3 p-2 bg-warning/10 rounded-lg text-xs text-warning flex items-start gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <strong>Simple Exponential Smoothing</strong> menghasilkan prediksi yang{' '}
              <strong>sama (flat)</strong> untuk semua periode ke depan karena tidak{' '}
              memperhitungkan trend. Gunakan DES atau TES untuk prediksi dengan variasi.
            </div>
          </div>
        )}
        
        {result.metode === "DES" && isPredictionOnly && (
          <div className="mt-3 p-2 bg-info/10 rounded-lg text-xs text-info flex items-start gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <strong>Double Exponential Smoothing (Holt)</strong> memperhitungkan{' '}
              <strong>trend</strong> dalam data, sehingga prediksi dapat naik atau turun sesuai pola trend historis.
            </div>
          </div>
        )}
        
        {result.metode === "TES" && isPredictionOnly && (
          <div className="mt-3 p-2 bg-success/10 rounded-lg text-xs text-success flex items-start gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <strong>Triple Exponential Smoothing (Holt-Winters)</strong> memperhitungkan{' '}
              <strong>trend dan musiman</strong>, cocok untuk data dengan pola berulang (seasonal).
            </div>
          </div>
        )}
        
        {result.metode === "SES" && !isPredictionOnly && mapeValue && mapeValue > 20 && (
          <div className="mt-3 p-2 bg-error/10 rounded-lg text-xs text-error flex items-start gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <strong>MAPE tinggi ({mapeValue.toFixed(2)}%)</strong> menunjukkan SES tidak cocok untuk data ini. 
              Data mungkin memiliki <strong>trend</strong> atau <strong>fluktuasi</strong> yang tidak dapat ditangkap SES. 
              Pertimbangkan untuk menggunakan DES (Double) atau TES (Triple) Exponential Smoothing.
            </div>
          </div>
        )}

        {/* Parameter Model */}
        <div className="text-xs text-base-content/70 mt-4 pt-3 border-t border-base-200">
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <span className="bg-base-200 px-2 py-0.5 rounded">α: {result.alpha ? (typeof result.alpha === "string" ? parseFloat(result.alpha) : result.alpha).toFixed(3) : "auto"}</span>
            {result.beta !== undefined && result.beta !== null && (
              <span className="bg-base-200 px-2 py-0.5 rounded">β: {(typeof result.beta === "string" ? parseFloat(result.beta) : result.beta).toFixed(3)}</span>
            )}
            {result.gamma !== undefined && result.gamma !== null && (
              <span className="bg-base-200 px-2 py-0.5 rounded">γ: {(typeof result.gamma === "string" ? parseFloat(result.gamma) : result.gamma).toFixed(3)}</span>
            )}
            {result.seasonal_periods && (
              <span className="bg-base-200 px-2 py-0.5 rounded">Periode: {result.seasonal_periods}</span>
            )}
            <span className="bg-base-200 px-2 py-0.5 rounded">
              Data Training: {result.jumlah_data_training} periode
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
