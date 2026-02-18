/** @format */

"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import PimpinanRoute from "@/components/PimpinanRoute";
import SidebarPimpinan from "@/components/SidebarPimpinan";
import Header from "@/components/Header";
import { Card, Button } from "@/components/ui";
import { toast } from "@/services";
import {
  BarChart3,
  ArrowLeft,
  Sparkles,
  Trophy,
  Loader2,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface MetodeResult {
  nilai_prediksi: number;
  mape?: number;
  akurasi?: number;
}

const METODE_COLORS: Record<string, string> = {
  SES: "#06b6d4",
  DES: "#f59e0b",
  TES: "#10b981",
  HYBRID: "#8b5cf6",
};

const METODE_NAMES: Record<string, string> = {
  SES: "Simple Exponential Smoothing",
  DES: "Double Exponential Smoothing",
  TES: "Triple Exponential Smoothing",
  HYBRID: "Hybrid Prediction",
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value);

const formatNumber = (value: number, decimals = 2) =>
  new Intl.NumberFormat("id-ID", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value);

export default function PrediksiEvaluasiPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Record<string, MetodeResult> | null>(null);
  const [recommendation, setRecommendation] = useState<string>("");
  const [tahun, setTahun] = useState(new Date().getFullYear().toString());
  const [bulan, setBulan] = useState((new Date().getMonth() + 1).toString());

  const compareMetode = useCallback(async () => {
    try {
      setIsLoading(true);
      // Simulasi hasil perbandingan
      const mockResults: Record<string, MetodeResult> = {
        SES: { nilai_prediksi: 8500000000, mape: 18.5, akurasi: 81.5 },
        DES: { nilai_prediksi: 8750000000, mape: 15.2, akurasi: 84.8 },
        TES: { nilai_prediksi: 8900000000, mape: 12.8, akurasi: 87.2 },
        HYBRID: { nilai_prediksi: 9000000000, mape: 8.5, akurasi: 91.5 },
      };
      setResults(mockResults);
      setRecommendation("HYBRID");
      toast.success("Perbandingan metode berhasil!");
    } catch (error: any) {
      toast.error(error?.message || "Gagal membandingkan metode");
    } finally {
      setIsLoading(false);
    }
  }, [tahun, bulan]);

  const chartData = results
    ? Object.entries(results).map(([metode, data]) => ({
        metode,
        nama: METODE_NAMES[metode] || metode,
        nilai_prediksi: data.nilai_prediksi,
        mape: data.mape || 0,
        akurasi: data.akurasi || 0,
        color: METODE_COLORS[metode] || "#6366f1",
      }))
    : [];

  return (
    <PimpinanRoute>
      <div className="min-h-screen bg-base-200 flex overflow-x-hidden">
        <SidebarPimpinan />

        <div className="flex-1 lg:ml-64 overflow-x-hidden">
          <Header
            variant="admin"
            title="Evaluasi Metode Prediksi"
            subtitle="Bandingkan performa SES, DES, TES, dan Hybrid"
            showThemeSwitcher={true}
          />

          <div className="p-4 lg:p-8 min-w-0">
            <div className="flex items-center gap-2 mb-6">
              <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => router.push("/pimpinan/dashboard")}>
                Kembali
              </Button>
            </div>

            {/* Controls */}
            <Card className="mb-6">
              <div className="flex flex-col md:flex-row items-end gap-4">
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div>
                    <label className="label"><span className="label-text font-medium">Tahun</span></label>
                    <select className="select select-bordered w-full" value={tahun} onChange={(e) => setTahun(e.target.value)}>
                      {Array.from({ length: 8 }, (_, i) => {
                        const year = (new Date().getFullYear() - 3 + i).toString();
                        return <option key={year} value={year}>{year}</option>;
                      })}
                    </select>
                  </div>
                  <div>
                    <label className="label"><span className="label-text font-medium">Bulan</span></label>
                    <select className="select select-bordered w-full" value={bulan} onChange={(e) => setBulan(e.target.value)}>
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {new Date(2024, i).toLocaleString("id-ID", { month: "long" })}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <Button
                  variant="primary"
                  loading={isLoading}
                  leftIcon={isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  onClick={compareMetode}
                >
                  Bandingkan Metode
                </Button>
              </div>
            </Card>

            {results && (
              <>
                {/* Best Method */}
                {recommendation && (
                  <Card className="mb-6 bg-gradient-to-r from-success/10 to-primary/10 border-success/30">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-success/20 rounded-xl flex items-center justify-center">
                        <Trophy className="w-7 h-7 text-success" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-base-content/60">Metode Terbaik</p>
                        <h3 className="text-2xl font-bold text-success">{METODE_NAMES[recommendation] || recommendation}</h3>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <Card>
                    <h3 className="text-sm font-semibold mb-4">Perbandingan Nilai Prediksi</h3>
                    <div style={{ width: "100%", height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                          <XAxis dataKey="metode" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `Rp${(v/1000000).toFixed(0)}M`} width={60} />
                          <Tooltip formatter={(value: number | undefined) => formatCurrency(value || 0)} />
                          <Bar dataKey="nilai_prediksi" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  <Card>
                    <h3 className="text-sm font-semibold mb-4">Perbandingan MAPE (Error)</h3>
                    <div style={{ width: "100%", height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                          <XAxis dataKey="metode" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
                          <Tooltip formatter={(value: number | undefined) => `${formatNumber(value || 0)}%`} />
                          <Bar dataKey="mape" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </div>

                {/* Detail Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {chartData.map((item) => (
                    <Card key={item.metode} className={`p-4 ${recommendation === item.metode ? 'border-success/50 bg-success/5' : ''}`}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <h4 className="font-semibold text-sm">{item.metode}</h4>
                        {recommendation === item.metode && <span className="badge badge-xs badge-success">Terbaik</span>}
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-base-content/60">Prediksi</span>
                          <span className="font-mono font-semibold">{formatCurrency(item.nilai_prediksi)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-base-content/60">MAPE</span>
                          <span className={`font-mono font-semibold ${item.mape <= 20 ? 'text-success' : 'text-warning'}`}>
                            {formatNumber(item.mape)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-base-content/60">Akurasi</span>
                          <span className="font-mono font-semibold text-info">{formatNumber(item.akurasi)}%</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            )}

            {!results && !isLoading && (
              <Card className="p-12 text-center">
                <div className="w-20 h-20 bg-base-300/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-10 h-10 text-base-content/30" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Evaluasi Metode Prediksi</h3>
                <p className="text-sm text-base-content/60 max-w-md mx-auto">
                  Pilih periode dan klik "Bandingkan Metode" untuk melihat perbandingan performa keempat metode prediksi.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </PimpinanRoute>
  );
}
