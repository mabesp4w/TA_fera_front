/** @format */

"use client";

import { useCallback, useEffect, useState } from "react";
import AdminRoute from "@/components/AdminRoute";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Card, Button } from "@/components/ui";
import type { SelectOption } from "@/components/ui/types";
import {
  prediksiService,
  BULAN_OPTIONS,
  type CompareResponse,
  type CompareMethodResult,
  type PredictionResult,
} from "@/services/prediksiService";
import { jenisKendaraanService } from "@/services/jenisKendaraanService";
import { toast } from "@/services";
import {
  ClipboardCheck,
  TrendingUp,
  Loader2,
  Info,
  RefreshCw,
  Award,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Crown,
  Gauge,
  Target,
  Zap,
  History,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

// ━━━━━━━━━━━━━━━━━━ Helpers ━━━━━━━━━━━━━━━━━━
const BULAN_NAMES = [
  "",
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const formatRupiah = (val: number): string => {
  if (val >= 1_000_000_000)
    return `Rp ${(val / 1_000_000_000).toFixed(1)}M`;
  if (val >= 1_000_000) return `Rp ${(val / 1_000_000).toFixed(1)}Jt`;
  if (val >= 1_000) return `Rp ${(val / 1_000).toFixed(0)}Rb`;
  return `Rp ${val}`;
};

const formatRupiahFull = (val: number): string =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val);

const formatNumber = (val: number): string =>
  new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);

const getMapeCategory = (
  mape: number
): { label: string; color: string; icon: typeof CheckCircle2 } => {
  if (mape <= 10)
    return {
      label: "Sangat Akurat",
      color: "text-success bg-success/10 border-success/20",
      icon: CheckCircle2,
    };
  if (mape <= 20)
    return {
      label: "Akurat",
      color: "text-info bg-info/10 border-info/20",
      icon: CheckCircle2,
    };
  if (mape <= 30)
    return {
      label: "Cukup Akurat",
      color: "text-warning bg-warning/10 border-warning/20",
      icon: AlertTriangle,
    };
  if (mape <= 50)
    return {
      label: "Kurang Akurat",
      color: "text-orange-500 bg-orange-500/10 border-orange-500/20",
      icon: AlertTriangle,
    };
  return {
    label: "Tidak Akurat",
    color: "text-error bg-error/10 border-error/20",
    icon: XCircle,
  };
};

const METHOD_COLORS: Record<string, string> = {
  SES: "#06b6d4",
  DES: "#f59e0b",
  TES: "#10b981",
  HYBRID: "#8b5cf6",
};

const METHOD_LABELS: Record<string, string> = {
  SES: "Simple Exponential Smoothing",
  DES: "Double Exponential Smoothing (Holt)",
  TES: "Triple Exponential Smoothing (Holt-Winters)",
  HYBRID: "Hybrid (TES + Business Rules)",
};

// ━━━━━━━━━━━━━━━━━━ Custom Tooltip ━━━━━━━━━━━━━━━━━━
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-base-100 border border-base-300 rounded-xl shadow-2xl p-4 min-w-[200px]">
      <p className="text-xs font-bold text-base-content/80 mb-2 border-b border-base-200 pb-2">
        {label}
      </p>
      {payload.map((entry: any, index: number) => (
        <div
          key={index}
          className="flex items-center justify-between gap-4 py-0.5"
        >
          <div className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-base-content/70">{entry.name}</span>
          </div>
          <span className="text-xs font-semibold font-mono">
            {typeof entry.value === "number" ? formatNumber(entry.value) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

// ━━━━━━━━━━━━━━━━━━ Main Component ━━━━━━━━━━━━━━━━━━
export default function EvaluasiPrediksiPage() {
  // State
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [compareResult, setCompareResult] = useState<CompareResponse | null>(
    null
  );
  const [jenisKendaraanOptions, setJenisKendaraanOptions] = useState<
    SelectOption[]
  >([]);
  const [history, setHistory] = useState<PredictionResult[]>([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [showHistory, setShowHistory] = useState(false);

  // Filters
  const [prediksiTahun, setPrediksiTahun] = useState(
    new Date().getFullYear()
  );
  const [prediksiBulan, setPrediksiBulan] = useState(
    new Date().getMonth() + 1
  );
  const [selectedJenisKendaraan, setSelectedJenisKendaraan] =
    useState<string>("");

  // Fetch jenis kendaraan
  const fetchJenisKendaraanOptions = useCallback(async () => {
    try {
      const response = await jenisKendaraanService.getList({
        page_size: 1000,
      });
      setJenisKendaraanOptions(
        (response.data || []).map((item) => ({
          value: item.id.toString(),
          label: item.nama,
        }))
      );
    } catch (e) {
      console.error("Error fetching jenis kendaraan:", e);
    }
  }, []);

  // Run evaluation
  const runEvaluation = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await prediksiService.compare({
        tahun_prediksi: prediksiTahun,
        bulan_prediksi: prediksiBulan,
        jenis_kendaraan_id: selectedJenisKendaraan
          ? parseInt(selectedJenisKendaraan)
          : undefined,
      });
      setCompareResult(result);
      toast.success("Evaluasi prediksi berhasil dilakukan");
    } catch (error) {
      toast.error("Gagal menjalankan evaluasi");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [prediksiTahun, prediksiBulan, selectedJenisKendaraan]);

  // Fetch riwayat prediksi
  const fetchHistory = useCallback(
    async (page: number = 1) => {
      try {
        setIsLoadingHistory(true);
        const result = await prediksiService.getList({
          page,
          page_size: 10,
          jenis_kendaraan_id: selectedJenisKendaraan
            ? parseInt(selectedJenisKendaraan)
            : undefined,
        });
        setHistory(result.data || []);
        setHistoryPage(result.page);
        setHistoryTotalPages(result.total_pages);
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setIsLoadingHistory(false);
      }
    },
    [selectedJenisKendaraan]
  );

  // Delete prediction
  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus hasil prediksi ini?")) return;
    try {
      await prediksiService.delete(id);
      toast.success("Prediksi berhasil dihapus");
      fetchHistory(historyPage);
    } catch (error) {
      toast.error("Gagal menghapus prediksi");
    }
  };

  useEffect(() => {
    fetchJenisKendaraanOptions();
  }, [fetchJenisKendaraanOptions]);

  // Build method entries from compare result
  const getMethodEntries = (): {
    key: string;
    data: CompareMethodResult;
    isRecommended: boolean;
  }[] => {
    if (!compareResult) return [];

    const methods = ["SES", "DES", "TES", "HYBRID"] as const;
    return methods
      .filter((m) => compareResult[m] && !compareResult[m].error)
      .map((m) => ({
        key: m,
        data: compareResult[m],
        isRecommended: compareResult.recommendation === m,
      }));
  };

  // Build chart data for bar comparison
  const getMetricsChartData = () => {
    const entries = getMethodEntries();
    return entries.map((e) => ({
      metode: e.key,
      MAPE: parseFloat((e.data.mape ?? 0) as any),
      Akurasi: parseFloat((e.data.akurasi ?? (100 - (parseFloat((e.data.mape ?? 0) as any)))) as any),
    }));
  };

  // Build radar chart data
  const getRadarData = () => {
    const entries = getMethodEntries();
    if (entries.length === 0) return [];

    // Normalize metrics (lower MAPE/MAE/RMSE = better = higher score)
    const maxMape = Math.max(
      ...entries.map((e) => parseFloat((e.data.mape ?? 100) as any))
    );
    const maxMae = Math.max(
      ...entries.map((e) => parseFloat((e.data.mae ?? 0) as any))
    );
    const maxRmse = Math.max(
      ...entries.map((e) => parseFloat((e.data.rmse ?? 0) as any))
    );

    const criteria = [
      { name: "Akurasi (MAPE)", key: "mape" },
      { name: "Presisi (MAE)", key: "mae" },
      { name: "Stabilitas (RMSE)", key: "rmse" },
    ];

    return criteria.map((c) => {
      const point: any = { metric: c.name };
      entries.forEach((e) => {
        const val = parseFloat((e.data[c.key as keyof CompareMethodResult] ?? 0) as any);
        if (c.key === "mape") {
          point[e.key] = maxMape > 0 ? Math.max(0, ((maxMape - val) / maxMape) * 100) : 100;
        } else if (c.key === "mae") {
          point[e.key] = maxMae > 0 ? Math.max(0, ((maxMae - val) / maxMae) * 100) : 100;
        } else {
          point[e.key] = maxRmse > 0 ? Math.max(0, ((maxRmse - val) / maxRmse) * 100) : 100;
        }
      });
      return point;
    });
  };

  // Predictions value chart data
  const getPrediksiChartData = () => {
    const entries = getMethodEntries();
    const data: any[] = [];
    
    // Actual value if exists
    const firstWithActual = entries.find((e) => e.data.nilai_aktual);
    if (firstWithActual) {
      data.push({
        name: "Nilai Aktual",
        value: parseFloat((firstWithActual.data.nilai_aktual ?? 0) as any),
        fill: "#64748b",
      });
    }

    entries.forEach((e) => {
      data.push({
        name: e.key,
        value: parseFloat((e.data.nilai_prediksi ?? 0) as any),
        fill: METHOD_COLORS[e.key] || "#6366f1",
      });
    });

    return data;
  };

  const methodEntries = getMethodEntries();
  const recommended = methodEntries.find((e) => e.isRecommended);
  const metricsChartData = getMetricsChartData();
  const radarData = getRadarData();
  const prediksiChartData = getPrediksiChartData();

  return (
    <AdminRoute>
      <div className="min-h-screen bg-base-200 flex overflow-x-hidden">
        <Sidebar />

        <div className="flex-1 lg:ml-64 overflow-x-hidden">
          <Header
            variant="admin"
            title="Evaluasi Metode Prediksi"
            subtitle="Bandingkan performa SES, DES, TES, dan Hybrid untuk menentukan metode terbaik"
            showThemeSwitcher={true}
          />

          <div className="p-4 lg:p-8 min-w-0">
            {/* Evaluation Params Card */}
            <Card className="mb-6">
              <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-primary" />
                Parameter Evaluasi
              </h3>
              <p className="text-xs text-base-content/60 mb-4">
                Pilih periode dan jenis kendaraan untuk menjalankan evaluasi
                perbandingan metode prediksi.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 items-end">
                <div className="flex-1">
                  <label className="label">
                    <span className="label-text text-xs font-medium">
                      Tahun Prediksi
                    </span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered input-sm w-full"
                    value={prediksiTahun}
                    onChange={(e) =>
                      setPrediksiTahun(parseInt(e.target.value) || 2025)
                    }
                    min={2020}
                    max={2030}
                  />
                </div>
                <div className="flex-1">
                  <label className="label">
                    <span className="label-text text-xs font-medium">
                      Bulan Prediksi
                    </span>
                  </label>
                  <select
                    className="select select-bordered select-sm w-full"
                    value={prediksiBulan}
                    onChange={(e) =>
                      setPrediksiBulan(parseInt(e.target.value))
                    }
                  >
                    {BULAN_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="label">
                    <span className="label-text text-xs font-medium">
                      Jenis Kendaraan
                    </span>
                  </label>
                  <select
                    className="select select-bordered select-sm w-full"
                    value={selectedJenisKendaraan}
                    onChange={(e) =>
                      setSelectedJenisKendaraan(e.target.value)
                    }
                  >
                    <option value="">Semua Jenis</option>
                    {jenisKendaraanOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={runEvaluation}
                  loading={isLoading}
                  leftIcon={<Zap className="w-4 h-4" />}
                >
                  Jalankan Evaluasi
                </Button>
              </div>
            </Card>

            {/* Loading */}
            {isLoading && (
              <Card className="p-12">
                <div className="flex flex-col items-center justify-center">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  <p className="mt-4 text-sm text-base-content/60">
                    Menjalankan evaluasi 4 metode prediksi...
                  </p>
                  <p className="text-xs text-base-content/40 mt-1">
                    Proses ini memerlukan beberapa detik
                  </p>
                </div>
              </Card>
            )}

            {/* Results */}
            {!isLoading && compareResult && (
              <>
                {/* Recommendation Banner */}
                {recommended && (
                  <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border border-amber-500/20">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-amber-500/15 rounded-xl flex items-center justify-center shrink-0">
                        <Crown className="w-6 h-6 text-amber-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-amber-600 dark:text-amber-400">
                          Rekomendasi: {recommended.key}
                        </h3>
                        <p className="text-xs text-base-content/70 mt-0.5">
                          {METHOD_LABELS[recommended.key]}
                        </p>
                        <div className="flex flex-wrap gap-3 mt-2">
                          <span className="badge badge-sm bg-amber-500/10 text-amber-600 border-amber-500/20">
                            MAPE:{" "}
                            {formatNumber(
                              parseFloat(
                                (recommended.data.mape ?? 0) as any
                              )
                            )}
                            %
                          </span>
                          <span className="badge badge-sm bg-amber-500/10 text-amber-600 border-amber-500/20">
                            Prediksi:{" "}
                            {formatRupiah(
                              parseFloat(
                                (recommended.data.nilai_prediksi ??
                                  0) as any
                              )
                            )}
                          </span>
                          {recommended.data.akurasi !== undefined && (
                            <span className="badge badge-sm bg-amber-500/10 text-amber-600 border-amber-500/20">
                              Akurasi:{" "}
                              {formatNumber(
                                parseFloat(
                                  (recommended.data.akurasi ?? 0) as any
                                )
                              )}
                              %
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Method Comparison Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                  {methodEntries.map(({ key, data, isRecommended }) => {
                    const mapeVal = parseFloat((data.mape ?? 0) as any);
                    const category = getMapeCategory(mapeVal);
                    const CategoryIcon = category.icon;
                    const prediksiVal = parseFloat(
                      (data.nilai_prediksi ?? 0) as any
                    );

                    return (
                      <Card
                        key={key}
                        className={`relative overflow-hidden ${
                          isRecommended
                            ? "ring-2 ring-amber-400/50 shadow-lg shadow-amber-500/10"
                            : ""
                        }`}
                      >
                        {isRecommended && (
                          <div className="absolute top-0 right-0">
                            <div className="bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg">
                              TERBAIK
                            </div>
                          </div>
                        )}

                        {/* Header */}
                        <div className="flex items-center gap-2 mb-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor:
                                METHOD_COLORS[key] || "#6366f1",
                            }}
                          />
                          <h4 className="text-sm font-bold">{key}</h4>
                        </div>

                        {/* Prediction Value */}
                        <p className="text-xl font-bold mb-1">
                          {formatRupiah(prediksiVal)}
                        </p>
                        <p className="text-[10px] text-base-content/50 mb-3">
                          {METHOD_LABELS[key]}
                        </p>

                        {/* MAPE Category Badge */}
                        <div
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${category.color}`}
                        >
                          <CategoryIcon className="w-3.5 h-3.5" />
                          {category.label}
                        </div>

                        {/* Metrics */}
                        <div className="mt-3 pt-3 border-t border-base-200 space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="text-base-content/60">
                              MAPE
                            </span>
                            <span className="font-mono font-semibold">
                              {formatNumber(mapeVal)}%
                            </span>
                          </div>
                          {data.mae !== undefined && data.mae !== null && (
                            <div className="flex justify-between text-xs">
                              <span className="text-base-content/60">
                                MAE
                              </span>
                              <span className="font-mono font-semibold">
                                {formatRupiah(
                                  parseFloat((data.mae ?? 0) as any)
                                )}
                              </span>
                            </div>
                          )}
                          {data.rmse !== undefined && data.rmse !== null && (
                            <div className="flex justify-between text-xs">
                              <span className="text-base-content/60">
                                RMSE
                              </span>
                              <span className="font-mono font-semibold">
                                {formatRupiah(
                                  parseFloat((data.rmse ?? 0) as any)
                                )}
                              </span>
                            </div>
                          )}
                          {data.nilai_aktual !== undefined && data.nilai_aktual !== null && (
                            <div className="flex justify-between text-xs">
                              <span className="text-base-content/60">
                                Aktual
                              </span>
                              <span className="font-mono font-semibold">
                                {formatRupiah(
                                  parseFloat(
                                    (data.nilai_aktual ?? 0) as any
                                  )
                                )}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Parameters */}
                        <div className="mt-3 pt-3 border-t border-base-200">
                          <p className="text-[10px] text-base-content/40 mb-1">
                            Parameter
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {data.alpha !== undefined &&
                              data.alpha !== null && (
                                <span className="badge badge-xs badge-ghost font-mono">
                                  α={parseFloat((data.alpha ?? 0) as any).toFixed(4)}
                                </span>
                              )}
                            {data.beta !== undefined &&
                              data.beta !== null && (
                                <span className="badge badge-xs badge-ghost font-mono">
                                  β={parseFloat((data.beta ?? 0) as any).toFixed(4)}
                                </span>
                              )}
                            {data.gamma !== undefined &&
                              data.gamma !== null && (
                                <span className="badge badge-xs badge-ghost font-mono">
                                  γ={parseFloat((data.gamma ?? 0) as any).toFixed(4)}
                                </span>
                              )}
                            {/* Hybrid-specific */}
                            {data.tes_parameters && (
                              <>
                                <span className="badge badge-xs badge-ghost font-mono">
                                  α=
                                  {parseFloat(
                                    (data.tes_parameters.alpha ?? 0) as any
                                  ).toFixed(4)}
                                </span>
                                <span className="badge badge-xs badge-ghost font-mono">
                                  β=
                                  {parseFloat(
                                    (data.tes_parameters.beta ?? 0) as any
                                  ).toFixed(4)}
                                </span>
                                <span className="badge badge-xs badge-ghost font-mono">
                                  γ=
                                  {parseFloat(
                                    (data.tes_parameters.gamma ?? 0) as any
                                  ).toFixed(4)}
                                </span>
                              </>
                            )}
                          </div>
                          {data.jumlah_data_training && (
                            <p className="text-[10px] text-base-content/40 mt-1">
                              Data training: {data.jumlah_data_training} periode
                            </p>
                          )}
                        </div>
                      </Card>
                    );
                  })}

                  {/* Error methods */}
                  {(["SES", "DES", "TES", "HYBRID"] as const)
                    .filter(
                      (m) => compareResult[m] && compareResult[m].error
                    )
                    .map((m) => (
                      <Card key={m} className="opacity-60">
                        <div className="flex items-center gap-2 mb-3">
                          <div
                            className="w-3 h-3 rounded-full opacity-40"
                            style={{
                              backgroundColor:
                                METHOD_COLORS[m] || "#6366f1",
                            }}
                          />
                          <h4 className="text-sm font-bold text-base-content/50">
                            {m}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2 text-error">
                          <XCircle className="w-4 h-4" />
                          <span className="text-xs">Error</span>
                        </div>
                        <p className="text-[10px] text-base-content/40 mt-2 break-all">
                          {compareResult[m].error}
                        </p>
                      </Card>
                    ))}
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* MAPE & Akurasi Comparison */}
                  <Card>
                    <h3 className="text-base font-semibold mb-1 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      Perbandingan MAPE & Akurasi
                    </h3>
                    <p className="text-xs text-base-content/60 mb-4">
                      Semakin rendah MAPE, semakin akurat prediksi
                    </p>
                    <div style={{ width: "100%", height: 300, minWidth: 0 }}>
                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                        minWidth={0}
                      >
                        <BarChart
                          data={metricsChartData}
                          layout="vertical"
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="rgba(148,163,184,0.15)"
                          />
                          <XAxis type="number" tick={{ fontSize: 10 }} />
                          <YAxis
                            dataKey="metode"
                            type="category"
                            tick={{ fontSize: 11, fontWeight: 600 }}
                            width={60}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend
                            wrapperStyle={{ fontSize: 11, paddingTop: 10 }}
                          />
                          <Bar
                            dataKey="MAPE"
                            name="MAPE (%)"
                            fill="#ef4444"
                            radius={[0, 4, 4, 0]}
                            opacity={0.8}
                          />
                          <Bar
                            dataKey="Akurasi"
                            name="Akurasi (%)"
                            fill="#10b981"
                            radius={[0, 4, 4, 0]}
                            opacity={0.8}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  {/* Radar Chart */}
                  <Card>
                    <h3 className="text-base font-semibold mb-1 flex items-center gap-2">
                      <Gauge className="w-5 h-5 text-secondary" />
                      Profil Performa Metode
                    </h3>
                    <p className="text-xs text-base-content/60 mb-4">
                      Perbandingan relatif antar metode (semakin luas = semakin
                      baik)
                    </p>
                    <div style={{ width: "100%", height: 300, minWidth: 0 }}>
                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                        minWidth={0}
                      >
                        <RadarChart data={radarData}>
                          <PolarGrid
                            stroke="rgba(148,163,184,0.2)"
                          />
                          <PolarAngleAxis
                            dataKey="metric"
                            tick={{ fontSize: 10 }}
                          />
                          <PolarRadiusAxis
                            angle={90}
                            domain={[0, 100]}
                            tick={{ fontSize: 9 }}
                          />
                          {methodEntries.map(({ key }) => (
                            <Radar
                              key={key}
                              name={key}
                              dataKey={key}
                              stroke={METHOD_COLORS[key] || "#6366f1"}
                              fill={METHOD_COLORS[key] || "#6366f1"}
                              fillOpacity={0.15}
                              strokeWidth={2}
                            />
                          ))}
                          <Legend
                            wrapperStyle={{ fontSize: 11, paddingTop: 10 }}
                          />
                          <Tooltip content={<CustomTooltip />} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </div>

                {/* Prediction Values Comparison Chart */}
                <Card className="mb-6">
                  <h3 className="text-base font-semibold mb-1 flex items-center gap-2">
                    <Target className="w-5 h-5 text-accent" />
                    Perbandingan Nilai Prediksi
                  </h3>
                  <p className="text-xs text-base-content/60 mb-4">
                    Nilai prediksi masing-masing metode untuk{" "}
                    <strong>
                      {BULAN_NAMES[prediksiBulan]} {prediksiTahun}
                    </strong>
                  </p>
                  <div style={{ width: "100%", height: 300, minWidth: 0 }}>
                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                      minWidth={0}
                    >
                      <BarChart data={prediksiChartData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(148,163,184,0.15)"
                        />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 11, fontWeight: 600 }}
                        />
                        <YAxis
                          tick={{ fontSize: 10 }}
                          tickFormatter={(v) => formatRupiah(v)}
                          width={80}
                        />
                        <Tooltip
                          content={({ active, payload, label }: any) => {
                            if (!active || !payload || !payload.length) return null;
                            return (
                              <div className="bg-base-100 border border-base-300 rounded-xl shadow-2xl p-4 min-w-[200px]">
                                <p className="text-xs font-bold text-base-content/80 mb-1">
                                  {label}
                                </p>
                                <p className="text-sm font-bold font-mono">
                                  {formatRupiahFull(payload[0]?.value || 0)}
                                </p>
                              </div>
                            );
                          }}
                        />
                        <Bar
                          dataKey="value"
                          name="Nilai"
                          radius={[6, 6, 0, 0]}
                          opacity={0.85}
                        >
                          {prediksiChartData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.fill}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Detailed Evaluation Table */}
                <Card className="mb-6">
                  <h3 className="text-base font-semibold mb-1 flex items-center gap-2">
                    <ClipboardCheck className="w-5 h-5 text-primary" />
                    Tabel Evaluasi Detail
                  </h3>
                  <p className="text-xs text-base-content/60 mb-4">
                    Ringkasan lengkap metrik evaluasi semua metode untuk periode{" "}
                    <strong>
                      {BULAN_NAMES[prediksiBulan]} {prediksiTahun}
                    </strong>
                  </p>

                  <div className="overflow-x-auto">
                    <table className="table table-sm w-full">
                      <thead>
                        <tr className="bg-base-200/50">
                          <th className="text-xs">Metode</th>
                          <th className="text-xs text-right">
                            Nilai Prediksi
                          </th>
                          <th className="text-xs text-right">
                            Nilai Aktual
                          </th>
                          <th className="text-xs text-right">MAPE</th>
                          <th className="text-xs text-right">MAE</th>
                          <th className="text-xs text-right">RMSE</th>
                          <th className="text-xs text-right">Akurasi</th>
                          <th className="text-xs text-center">Kategori</th>
                        </tr>
                      </thead>
                      <tbody>
                        {methodEntries.map(
                          ({ key, data, isRecommended }) => {
                            const mapeVal = parseFloat(
                              (data.mape ?? 0) as any
                            );
                            const category = getMapeCategory(mapeVal);
                            const CategoryIcon = category.icon;

                            return (
                              <tr
                                key={key}
                                className={
                                  isRecommended
                                    ? "bg-amber-500/5"
                                    : ""
                                }
                              >
                                <td>
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="w-2.5 h-2.5 rounded-full"
                                      style={{
                                        backgroundColor:
                                          METHOD_COLORS[key],
                                      }}
                                    />
                                    <span className="font-semibold text-xs">
                                      {key}
                                    </span>
                                    {isRecommended && (
                                      <Crown className="w-3 h-3 text-amber-500" />
                                    )}
                                  </div>
                                </td>
                                <td className="text-right font-mono text-xs">
                                  {formatRupiahFull(
                                    parseFloat(
                                      (data.nilai_prediksi ?? 0) as any
                                    )
                                  )}
                                </td>
                                <td className="text-right font-mono text-xs">
                                  {data.nilai_aktual
                                    ? formatRupiahFull(
                                        parseFloat(
                                          (data.nilai_aktual ?? 0) as any
                                        )
                                      )
                                    : "-"}
                                </td>
                                <td className="text-right font-mono text-xs font-semibold">
                                  {formatNumber(mapeVal)}%
                                </td>
                                <td className="text-right font-mono text-xs">
                                  {data.mae !== undefined && data.mae !== null
                                    ? formatRupiah(
                                        parseFloat(
                                          (data.mae ?? 0) as any
                                        )
                                      )
                                    : "-"}
                                </td>
                                <td className="text-right font-mono text-xs">
                                  {data.rmse !== undefined && data.rmse !== null
                                    ? formatRupiah(
                                        parseFloat(
                                          (data.rmse ?? 0) as any
                                        )
                                      )
                                    : "-"}
                                </td>
                                <td className="text-right font-mono text-xs font-semibold">
                                  {data.akurasi !== undefined
                                    ? formatNumber(
                                        parseFloat(
                                          (data.akurasi ?? 0) as any
                                        )
                                      ) + "%"
                                    : formatNumber(100 - mapeVal) + "%"}
                                </td>
                                <td className="text-center">
                                  <span
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${category.color}`}
                                  >
                                    <CategoryIcon className="w-3 h-3" />
                                    {category.label}
                                  </span>
                                </td>
                              </tr>
                            );
                          }
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>

                {/* MAPE Interpretation Guide */}
                <Card className="mb-6 bg-info/5 border-info/20">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-info shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-info mb-2">
                        Interpretasi MAPE (Mean Absolute Percentage Error)
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                        {[
                          {
                            range: "≤ 10%",
                            label: "Sangat Akurat",
                            desc: "Prediksi sangat baik",
                            color: "bg-success/10 text-success border-success/20",
                          },
                          {
                            range: "10-20%",
                            label: "Akurat",
                            desc: "Prediksi baik",
                            color: "bg-info/10 text-info border-info/20",
                          },
                          {
                            range: "20-30%",
                            label: "Cukup",
                            desc: "Prediksi cukup baik",
                            color: "bg-warning/10 text-warning border-warning/20",
                          },
                          {
                            range: "30-50%",
                            label: "Kurang",
                            desc: "Perlu perbaikan",
                            color: "bg-orange-500/10 text-orange-500 border-orange-500/20",
                          },
                          {
                            range: "> 50%",
                            label: "Buruk",
                            desc: "Tidak direkomendasikan",
                            color: "bg-error/10 text-error border-error/20",
                          },
                        ].map((item) => (
                          <div
                            key={item.range}
                            className={`p-2 rounded-lg border ${item.color}`}
                          >
                            <p className="text-xs font-bold">{item.range}</p>
                            <p className="text-[10px] font-medium">
                              {item.label}
                            </p>
                            <p className="text-[9px] opacity-70">
                              {item.desc}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </>
            )}

            {/* Empty State */}
            {!isLoading && !compareResult && (
              <Card className="p-8">
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                    <ClipboardCheck className="w-10 h-10 text-primary/40" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">
                    Mulai Evaluasi Metode
                  </h3>
                  <p className="text-sm text-base-content/70 mb-4 text-center max-w-md">
                    Pilih periode prediksi dan klik{" "}
                    <strong>&quot;Jalankan Evaluasi&quot;</strong> untuk
                    membandingkan performa SES, DES, TES, dan Hybrid.
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={runEvaluation}
                    leftIcon={<Zap className="w-4 h-4" />}
                  >
                    Jalankan Evaluasi Sekarang
                  </Button>
                </div>
              </Card>
            )}

            {/* Prediction History */}
            <Card className="mt-6">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => {
                  setShowHistory(!showHistory);
                  if (!showHistory && history.length === 0) fetchHistory();
                }}
              >
                <h3 className="text-base font-semibold flex items-center gap-2">
                  <History className="w-5 h-5 text-secondary" />
                  Riwayat Prediksi Tersimpan
                </h3>
                {showHistory ? (
                  <ChevronUp className="w-4 h-4 text-base-content/50" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-base-content/50" />
                )}
              </div>

              {showHistory && (
                <div className="mt-4">
                  {isLoadingHistory ? (
                    <div className="flex items-center justify-center p-8">
                      <Loader2 className="w-6 h-6 text-primary animate-spin" />
                    </div>
                  ) : history.length === 0 ? (
                    <p className="text-sm text-base-content/60 text-center py-6">
                      Belum ada riwayat prediksi tersimpan.
                    </p>
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <table className="table table-sm w-full">
                          <thead>
                            <tr className="bg-base-200/50">
                              <th className="text-xs">Periode</th>
                              <th className="text-xs">Metode</th>
                              <th className="text-xs">Jenis</th>
                              <th className="text-xs text-right">
                                Prediksi
                              </th>
                              <th className="text-xs text-right">
                                Aktual
                              </th>
                              <th className="text-xs text-right">MAPE</th>
                              <th className="text-xs text-right">
                                Tanggal
                              </th>
                              <th className="text-xs text-center">Aksi</th>
                            </tr>
                          </thead>
                          <tbody>
                            {history.map((item) => (
                              <tr key={item.id}>
                                <td className="text-xs font-medium">
                                  {BULAN_NAMES[item.bulan_prediksi]?.slice(
                                    0,
                                    3
                                  )}{" "}
                                  {item.tahun_prediksi}
                                </td>
                                <td>
                                  <span
                                    className="badge badge-xs font-mono"
                                    style={{
                                      backgroundColor:
                                        (METHOD_COLORS[
                                          item.metode
                                        ] || "#6366f1") + "20",
                                      color:
                                        METHOD_COLORS[item.metode] ||
                                        "#6366f1",
                                      borderColor:
                                        (METHOD_COLORS[
                                          item.metode
                                        ] || "#6366f1") + "40",
                                    }}
                                  >
                                    {item.metode}
                                  </span>
                                </td>
                                <td className="text-xs text-base-content/70">
                                  {item.jenis_kendaraan_nama || "Semua"}
                                </td>
                                <td className="text-right font-mono text-xs">
                                  {formatRupiah(
                                    parseFloat(
                                      (item.nilai_prediksi ?? 0) as any
                                    )
                                  )}
                                </td>
                                <td className="text-right font-mono text-xs">
                                  {item.nilai_aktual
                                    ? formatRupiah(
                                        parseFloat(
                                          (item.nilai_aktual ?? 0) as any
                                        )
                                      )
                                    : "-"}
                                </td>
                                <td className="text-right font-mono text-xs">
                                  {item.mape
                                    ? formatNumber(
                                        parseFloat(
                                          (item.mape ?? 0) as any
                                        )
                                      ) + "%"
                                    : "-"}
                                </td>
                                <td className="text-right text-xs text-base-content/60">
                                  {item.tanggal_prediksi
                                    ? new Date(
                                        item.tanggal_prediksi
                                      ).toLocaleDateString("id-ID", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                      })
                                    : "-"}
                                </td>
                                <td className="text-center">
                                  <button
                                    className="btn btn-xs btn-ghost btn-square text-error"
                                    onClick={() =>
                                      item.id !== undefined && handleDelete(item.id)
                                    }
                                    title="Hapus"
                                    disabled={item.id === undefined}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      {historyTotalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-4">
                          <button
                            className="btn btn-xs btn-ghost"
                            onClick={() =>
                              fetchHistory(historyPage - 1)
                            }
                            disabled={historyPage <= 1}
                          >
                            Prev
                          </button>
                          <span className="text-xs flex items-center px-2">
                            {historyPage} / {historyTotalPages}
                          </span>
                          <button
                            className="btn btn-xs btn-ghost"
                            onClick={() =>
                              fetchHistory(historyPage + 1)
                            }
                            disabled={
                              historyPage >= historyTotalPages
                            }
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </AdminRoute>
  );
}
