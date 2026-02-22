/** @format */

"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import PimpinanRoute from "@/components/PimpinanRoute";
import SidebarPimpinan from "@/components/SidebarPimpinan";
import Header from "@/components/Header";
import { Card, Button } from "@/components/ui";
import {
  prediksiService,
  type CompareResponse,
  type CompareMethodResult,
} from "@/services/prediksiService";
import { jenisKendaraanService } from "@/services/jenisKendaraanService";
import { toast } from "@/services";
import {
  BarChart3,
  ArrowLeft,
  Sparkles,
  Trophy,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts";

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

const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined || isNaN(Number(value))) return "Rp -";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(value));
};

const formatRupiah = (val: number | string | null | undefined): string => {
  if (val === null || val === undefined || isNaN(Number(val))) return "Rp -";
  const num = Number(val);
  if (num >= 1_000_000_000) return `Rp ${(num / 1_000_000_000).toFixed(2)}M`;
  if (num >= 1_000_000) return `Rp ${(num / 1_000_000).toFixed(1)}Jt`;
  if (num >= 1_000) return `Rp ${(num / 1_000).toFixed(0)}Rb`;
  return `Rp ${num}`;
};

const formatNumber = (value: number | null | undefined, decimals = 2) => {
  if (value === null || value === undefined || isNaN(Number(value))) return "-";
  return new Intl.NumberFormat("id-ID", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(Number(value));
};

const getMapeCategory = (mape: number) => {
  if (mape <= 10) return { label: "Sangat Akurat", color: "text-success", bgColor: "bg-success/10 border-success/20", icon: CheckCircle2 };
  if (mape <= 20) return { label: "Akurat", color: "text-info", bgColor: "bg-info/10 border-info/20", icon: CheckCircle2 };
  if (mape <= 30) return { label: "Cukup", color: "text-warning", bgColor: "bg-warning/10 border-warning/20", icon: AlertTriangle };
  if (mape <= 50) return { label: "Kurang", color: "text-orange-500", bgColor: "bg-orange-500/10 border-orange-500/20", icon: AlertTriangle };
  return { label: "Buruk", color: "text-error", bgColor: "bg-error/10 border-error/20", icon: XCircle };
};

interface SelectOption {
  value: string;
  label: string;
}

export default function PrediksiEvaluasiPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<CompareResponse | null>(null);
  const [recommendation, setRecommendation] = useState<string>("");
  const [tahun, setTahun] = useState(new Date().getFullYear().toString());
  const [bulan, setBulan] = useState((new Date().getMonth() + 1).toString());
  const [jenisKendaraan, setJenisKendaraan] = useState<string>("");
  const [jenisKendaraanOptions, setJenisKendaraanOptions] = useState<SelectOption[]>([]);

  useEffect(() => {
    const fetchJenisKendaraan = async () => {
      try {
        const response = await jenisKendaraanService.getList({ page_size: 1000 });
        setJenisKendaraanOptions(
          (response.data || []).map((item) => ({
            value: item.id.toString(),
            label: item.nama,
          }))
        );
      } catch (e) {
        console.error(e);
      }
    };
    fetchJenisKendaraan();
  }, []);

  const compareMetode = useCallback(async () => {
    try {
      setIsLoading(true);
      setResults(null);
      setRecommendation("");

      const response = await prediksiService.compare({
        tahun_prediksi: parseInt(tahun),
        bulan_prediksi: parseInt(bulan),
        jenis_kendaraan_id: jenisKendaraan ? parseInt(jenisKendaraan) : undefined,
      });

      setResults(response);
      if (response.recommendation) {
        setRecommendation(response.recommendation);
      }
      toast.success("Perbandingan metode berhasil!");
    } catch (error: any) {
      toast.error(error?.message || "Gagal membandingkan metode");
    } finally {
      setIsLoading(false);
    }
  }, [tahun, bulan, jenisKendaraan]);

  // Build chart data from results
  const metodeKeys = ["SES", "DES", "TES", "HYBRID"] as const;

  const chartData = results
    ? metodeKeys
        .filter((key) => results[key] && !results[key].error)
        .map((key) => {
          const data = results[key] as CompareMethodResult;
          return {
            metode: key,
            nama: METODE_NAMES[key] || key,
            nilai_prediksi: Number(data.nilai_prediksi) || 0,
            mape: Number(data.mape) || 0,
            akurasi: Number(data.akurasi) || 0,
            mae: Number(data.mae) || 0,
            rmse: Number(data.rmse) || 0,
            color: METODE_COLORS[key] || "#6366f1",
          };
        })
    : [];

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 8 }, (_, i) => ({
    value: (currentYear - 3 + i).toString(),
    label: (currentYear - 3 + i).toString(),
  }));

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
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="label"><span className="label-text font-medium">Tahun</span></label>
                    <select className="select select-bordered w-full" value={tahun} onChange={(e) => setTahun(e.target.value)}>
                      {yearOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
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
                  <div>
                    <label className="label"><span className="label-text font-medium">Jenis Kendaraan</span></label>
                    <select className="select select-bordered w-full" value={jenisKendaraan} onChange={(e) => setJenisKendaraan(e.target.value)}>
                      <option value="">Semua Jenis</option>
                      {jenisKendaraanOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
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

            {/* Loading */}
            {isLoading && (
              <Card className="p-12">
                <div className="flex flex-col items-center justify-center">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  <p className="mt-4 text-sm text-base-content/60">Membandingkan keempat metode prediksi...</p>
                  <p className="text-xs text-base-content/40 mt-1">Proses ini memerlukan beberapa saat</p>
                </div>
              </Card>
            )}

            {results && !isLoading && (
              <>
                {/* Best Method */}
                {recommendation && (
                  <Card className="mb-6 bg-gradient-to-r from-success/10 to-primary/10 border-success/30">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-success/20 rounded-xl flex items-center justify-center">
                        <Trophy className="w-7 h-7 text-success" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-base-content/60">Metode Terbaik (Error Terendah)</p>
                        <h3 className="text-2xl font-bold text-success">{METODE_NAMES[recommendation] || recommendation}</h3>
                        {chartData.find(d => d.metode === recommendation) && (
                          <p className="text-xs text-base-content/50 mt-1">
                            MAPE: {formatNumber(chartData.find(d => d.metode === recommendation)?.mape)}% · 
                            Prediksi: {formatCurrency(chartData.find(d => d.metode === recommendation)?.nilai_prediksi)}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                )}

                {!recommendation && (
                  <Card className="mb-6 bg-gradient-to-r from-info/10 to-primary/10 border-info/30">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-info/20 rounded-xl flex items-center justify-center">
                        <Info className="w-7 h-7 text-info" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-base-content/60">Informasi</p>
                        <h3 className="text-lg font-bold text-info">Tidak ada data aktual untuk periode ini</h3>
                        <p className="text-xs text-base-content/50 mt-1">
                          Rekomendasi metode terbaik akan muncul jika data aktual tersedia untuk perbandingan.
                        </p>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <Card>
                    <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-primary" />
                      Perbandingan Nilai Prediksi
                    </h3>
                    <div style={{ width: "100%", height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                          <XAxis dataKey="metode" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => formatRupiah(v)} width={80} />
                          <Tooltip formatter={(value: number | undefined) => formatCurrency(value || 0)} />
                          <Bar dataKey="nilai_prediksi" name="Nilai Prediksi" radius={[4, 4, 0, 0]}>
                            {chartData.map((entry) => (
                              <Cell key={`cell-pred-${entry.metode}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  <Card>
                    <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-warning" />
                      Perbandingan MAPE (Error %)
                    </h3>
                    <div style={{ width: "100%", height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                          <XAxis dataKey="metode" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
                          <Tooltip formatter={(value: number | undefined) => `${formatNumber(value || 0)}%`} />
                          <Bar dataKey="mape" name="MAPE" radius={[4, 4, 0, 0]}>
                            {chartData.map((entry) => (
                              <Cell key={`cell-mape-${entry.metode}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </div>

                {/* Detail Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {metodeKeys.map((key) => {
                    const data = results[key] as CompareMethodResult;
                    if (!data || data.error) {
                      return (
                        <Card key={key} className="p-4 opacity-60">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: METODE_COLORS[key] }} />
                            <h4 className="font-semibold text-sm">{key}</h4>
                          </div>
                          <p className="text-xs text-error">{data?.error || "Gagal"}</p>
                        </Card>
                      );
                    }

                    const mapeVal = Number(data.mape) || 0;
                    const category = mapeVal > 0 ? getMapeCategory(mapeVal) : null;
                    const CategoryIcon = category?.icon;
                    const isRecommended = recommendation === key;

                    return (
                      <Card key={key} className={`p-4 transition-all ${isRecommended ? "border-success/50 bg-success/5 ring-1 ring-success/20" : ""}`}>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: METODE_COLORS[key] }} />
                          <h4 className="font-semibold text-sm">{key}</h4>
                          {isRecommended && <span className="badge badge-xs badge-success">Terbaik</span>}
                        </div>
                        <p className="text-[10px] text-base-content/40 mb-3">{METODE_NAMES[key]}</p>

                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-base-content/60">Prediksi</span>
                            <span className="font-mono font-semibold">{formatCurrency(data.nilai_prediksi)}</span>
                          </div>
                          {data.nilai_aktual !== undefined && data.nilai_aktual !== null && (
                            <div className="flex justify-between">
                              <span className="text-base-content/60">Aktual</span>
                              <span className="font-mono font-semibold">{formatCurrency(data.nilai_aktual)}</span>
                            </div>
                          )}

                          <div className="divider my-1"></div>

                          <div className="flex justify-between">
                            <span className="text-base-content/60">MAPE</span>
                            <div className="flex items-center gap-1">
                              {category && CategoryIcon && <CategoryIcon className={`w-3 h-3 ${category.color}`} />}
                              <span className={`font-mono font-semibold ${category ? category.color : ""}`}>
                                {mapeVal > 0 ? `${formatNumber(mapeVal)}%` : "-"}
                              </span>
                            </div>
                          </div>
                          {data.akurasi !== undefined && data.akurasi !== null && (
                            <div className="flex justify-between">
                              <span className="text-base-content/60">Akurasi</span>
                              <span className="font-mono font-semibold text-info">{formatNumber(data.akurasi)}%</span>
                            </div>
                          )}
                          {data.mae !== undefined && data.mae !== null && (
                            <div className="flex justify-between">
                              <span className="text-base-content/60">MAE</span>
                              <span className="font-mono text-[10px]">{formatCurrency(data.mae)}</span>
                            </div>
                          )}
                          {data.rmse !== undefined && data.rmse !== null && (
                            <div className="flex justify-between">
                              <span className="text-base-content/60">RMSE</span>
                              <span className="font-mono text-[10px]">{formatCurrency(data.rmse)}</span>
                            </div>
                          )}

                          <div className="divider my-1"></div>

                          {/* Parameters */}
                          <p className="text-[10px] text-base-content/40 font-medium uppercase tracking-wider">Parameter</p>
                          {data.alpha !== undefined && (
                            <div className="flex justify-between">
                              <span className="text-base-content/60">Alpha (α)</span>
                              <span className="font-mono">{Number(data.alpha).toFixed(4)}</span>
                            </div>
                          )}
                          {data.beta !== undefined && Number(data.beta) > 0 && (
                            <div className="flex justify-between">
                              <span className="text-base-content/60">Beta (β)</span>
                              <span className="font-mono">{Number(data.beta).toFixed(4)}</span>
                            </div>
                          )}
                          {data.gamma !== undefined && Number(data.gamma) > 0 && (
                            <div className="flex justify-between">
                              <span className="text-base-content/60">Gamma (γ)</span>
                              <span className="font-mono">{Number(data.gamma).toFixed(4)}</span>
                            </div>
                          )}

                          {/* MAPE Category Badge */}
                          {category && (
                            <div className="pt-2">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium border ${category.bgColor} ${category.color}`}>
                                {CategoryIcon && <CategoryIcon className="w-3 h-3" />}
                                {category.label}
                              </span>
                            </div>
                          )}
                        </div>
                      </Card>
                    );
                  })}
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
                  Pilih periode dan klik &quot;Bandingkan Metode&quot; untuk melihat perbandingan performa keempat metode prediksi
                  secara real-time menggunakan data aktual.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </PimpinanRoute>
  );
}
