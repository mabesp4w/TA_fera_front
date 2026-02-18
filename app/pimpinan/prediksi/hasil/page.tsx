/** @format */

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import PimpinanRoute from "@/components/PimpinanRoute";
import SidebarPimpinan from "@/components/SidebarPimpinan";
import Header from "@/components/Header";
import { Card, Button } from "@/components/ui";
import type { SelectOption } from "@/components/ui/types";
import {
  prediksiService,
  BULAN_OPTIONS,
  METHOD_OPTIONS,
  type PredictionResult,
} from "@/services/prediksiService";
import { jenisKendaraanService } from "@/services/jenisKendaraanService";
import { toast } from "@/services";
import {
  FileText,
  Loader2,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  BarChart3,
  X,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const BULAN_NAMES = [
  "", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const formatRupiah = (val: number | string | null | undefined): string => {
  if (val === null || val === undefined || isNaN(Number(val))) return "Rp -";
  const num = Number(val);
  if (num >= 1_000_000_000) return `Rp ${(num / 1_000_000_000).toFixed(2)}M`;
  if (num >= 1_000_000) return `Rp ${(num / 1_000_000).toFixed(1)}Jt`;
  if (num >= 1_000) return `Rp ${(num / 1_000).toFixed(0)}Rb`;
  return `Rp ${num}`;
};

const formatRupiahFull = (val: number | string | null | undefined): string => {
  if (val === null || val === undefined || isNaN(Number(val))) return "Rp -";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(val));
};

const formatNumber = (val: number | string | null | undefined): string => {
  if (val === null || val === undefined || isNaN(Number(val))) return "-";
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(val));
};

const METHOD_COLORS: Record<string, string> = {
  SES: "#06b6d4",
  DES: "#f59e0b",
  TES: "#10b981",
  HYBRID: "#8b5cf6",
};

const getMapeCategory = (mape: number) => {
  if (mape <= 10) return { label: "Sangat Akurat", color: "text-success bg-success/10 border-success/20", icon: CheckCircle2 };
  if (mape <= 20) return { label: "Akurat", color: "text-info bg-info/10 border-info/20", icon: CheckCircle2 };
  if (mape <= 30) return { label: "Cukup", color: "text-warning bg-warning/10 border-warning/20", icon: AlertTriangle };
  if (mape <= 50) return { label: "Kurang", color: "text-orange-500 bg-orange-500/10 border-orange-500/20", icon: AlertTriangle };
  return { label: "Buruk", color: "text-error bg-error/10 border-error/20", icon: XCircle };
};

export default function PrediksiHasilPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<PredictionResult[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [jenisKendaraanOptions, setJenisKendaraanOptions] = useState<SelectOption[]>([]);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const [filterMetode, setFilterMetode] = useState<string>("");
  const [filterJenisKendaraan, setFilterJenisKendaraan] = useState<string>("");
  const [filterTahun, setFilterTahun] = useState<string>("");
  const [filterBulan, setFilterBulan] = useState<string>("");

  const fetchJenisKendaraan = useCallback(async () => {
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
  }, []);

  const fetchData = useCallback(async (p: number = 1) => {
    try {
      setIsLoading(true);
      const params: any = { page: p, page_size: pageSize };
      if (filterMetode) params.metode = filterMetode;
      if (filterJenisKendaraan) params.jenis_kendaraan_id = parseInt(filterJenisKendaraan);
      if (filterTahun) params.tahun_prediksi = parseInt(filterTahun);
      if (filterBulan) params.bulan_prediksi = parseInt(filterBulan);

      const result = await prediksiService.getList(params);
      setData(result.data || []);
      setPage(result.page);
      setTotalPages(result.total_pages);
      setTotalCount(result.total_count);
    } catch (error) {
      toast.error("Gagal memuat data hasil prediksi");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [pageSize, filterMetode, filterJenisKendaraan, filterTahun, filterBulan]);

  const resetFilters = () => {
    setFilterMetode("");
    setFilterJenisKendaraan("");
    setFilterTahun("");
    setFilterBulan("");
  };

  const hasFilters = filterMetode || filterJenisKendaraan || filterTahun || filterBulan;

  useEffect(() => {
    fetchJenisKendaraan();
  }, [fetchJenisKendaraan]);

  useEffect(() => {
    setPage(1);
    fetchData(1);
  }, [fetchData]);

  const stats = useMemo(() => {
    if (data.length === 0) return { avgMape: 0, bestMape: 0, worstMape: 0, methodCounts: {} as Record<string, number> };
    const mapes = data.map((d) => Number(d.mape) || 0).filter((v) => v > 0);
    const avgMape = mapes.length > 0 ? mapes.reduce((s, v) => s + v, 0) / mapes.length : 0;
    const bestMape = mapes.length > 0 ? Math.min(...mapes) : 0;
    const methodCounts: Record<string, number> = {};
    data.forEach((d) => { methodCounts[d.metode] = (methodCounts[d.metode] || 0) + 1; });
    return { avgMape, bestMape, worstMape: mapes.length > 0 ? Math.max(...mapes) : 0, methodCounts };
  }, [data]);

  const chartData = useMemo(() => {
    return data.map(item => ({
      periode: `${BULAN_NAMES[item.bulan_prediksi]?.slice(0, 3)} ${item.tahun_prediksi}`,
      prediksi: Number(item.nilai_prediksi) || 0,
      aktual: item.nilai_aktual ? Number(item.nilai_aktual) : null,
      mape: Number(item.mape) || 0,
      metode: item.metode,
    }));
  }, [data]);

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
            title="Hasil Prediksi"
            subtitle="Monitoring dan analisis hasil prediksi pendapatan"
            showThemeSwitcher={true}
          />

          <div className="p-4 lg:p-8 min-w-0">
            <div className="flex items-center gap-2 mb-6">
              <Button 
                variant="ghost" 
                size="sm" 
                leftIcon={<ArrowLeft className="w-4 h-4" />}
                onClick={() => router.push("/pimpinan/dashboard")}
              >
                Kembali
              </Button>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              <Card className="p-4 border-l-4 border-primary">
                <p className="text-[10px] text-base-content/60 uppercase tracking-wider mb-1">Total Prediksi</p>
                <p className="text-2xl font-bold text-primary">{totalCount}</p>
                <p className="text-[9px] text-base-content/40">hasil tersimpan</p>
              </Card>

              <Card className="p-4 border-l-4 border-info">
                <p className="text-[10px] text-base-content/60 uppercase tracking-wider mb-1">Rata-rata MAPE</p>
                <p className="text-2xl font-bold">{formatNumber(stats.avgMape)}%</p>
                <p className="text-[9px] text-base-content/40">tingkat akurasi</p>
              </Card>

              <Card className="p-4 border-l-4 border-success">
                <p className="text-[10px] text-base-content/60 uppercase tracking-wider mb-1">MAPE Terbaik</p>
                <p className="text-2xl font-bold text-success">{formatNumber(stats.bestMape)}%</p>
                <p className="text-[9px] text-base-content/40">prediksi terakurat</p>
              </Card>

              <Card className="p-4 border-l-4 border-warning">
                <p className="text-[10px] text-base-content/60 uppercase tracking-wider mb-1">Distribusi Metode</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {Object.entries(stats.methodCounts).slice(0, 3).map(([method, count]) => (
                    <span key={method} className="badge badge-xs font-mono" style={{
                      backgroundColor: (METHOD_COLORS[method] || "#6366f1") + "20",
                      color: METHOD_COLORS[method] || "#6366f1",
                    }}>
                      {method}: {count}
                    </span>
                  ))}
                </div>
              </Card>
            </div>

            {/* Chart */}
            {data.length > 0 && (
              <Card className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    Trend Prediksi vs Aktual
                  </h3>
                </div>
                <div style={{ width: "100%", height: 250 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                      <XAxis dataKey="periode" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => formatRupiah(v)} width={80} />
                      <Tooltip formatter={(value: number | undefined) => formatRupiahFull(value || 0)} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line type="monotone" dataKey="prediksi" name="Prediksi" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="aktual" name="Aktual" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            )}

            {/* Filters */}
            <Card className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold">Filter Data</h3>
                {hasFilters && (
                  <button className="btn btn-xs btn-ghost text-error gap-1" onClick={resetFilters}>
                    <X className="w-3 h-3" />
                    Reset
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="label py-0"><span className="label-text text-[10px] font-medium">Metode</span></label>
                  <select className="select select-bordered select-sm w-full" value={filterMetode} onChange={(e) => setFilterMetode(e.target.value)}>
                    <option value="">Semua Metode</option>
                    {METHOD_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label py-0"><span className="label-text text-[10px] font-medium">Jenis Kendaraan</span></label>
                  <select className="select select-bordered select-sm w-full" value={filterJenisKendaraan} onChange={(e) => setFilterJenisKendaraan(e.target.value)}>
                    <option value="">Semua Jenis</option>
                    {jenisKendaraanOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label py-0"><span className="label-text text-[10px] font-medium">Tahun</span></label>
                  <select className="select select-bordered select-sm w-full" value={filterTahun} onChange={(e) => setFilterTahun(e.target.value)}>
                    <option value="">Semua Tahun</option>
                    {yearOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label py-0"><span className="label-text text-[10px] font-medium">Bulan</span></label>
                  <select className="select select-bordered select-sm w-full" value={filterBulan} onChange={(e) => setFilterBulan(e.target.value)}>
                    <option value="">Semua Bulan</option>
                    {BULAN_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
              </div>
            </Card>

            {/* Loading */}
            {isLoading && (
              <Card className="p-12">
                <div className="flex flex-col items-center justify-center">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  <p className="mt-4 text-sm text-base-content/60">Memuat data...</p>
                </div>
              </Card>
            )}

            {/* Data Table */}
            {!isLoading && (
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    Data Hasil Prediksi
                    <span className="badge badge-sm badge-ghost">{totalCount}</span>
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => fetchData(page)} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
                    Refresh
                  </Button>
                </div>

                {data.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-16 h-16 bg-base-300/50 rounded-2xl flex items-center justify-center mb-4">
                      <FileText className="w-8 h-8 text-base-content/30" />
                    </div>
                    <p className="text-sm text-base-content/60 mb-1">Tidak ada data ditemukan</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="table table-sm w-full">
                        <thead>
                          <tr className="bg-base-200/50">
                            <th className="text-xs">Periode</th>
                            <th className="text-xs">Metode</th>
                            <th className="text-xs">Jenis</th>
                            <th className="text-xs text-right">Prediksi</th>
                            <th className="text-xs text-right">Aktual</th>
                            <th className="text-xs text-right">MAPE</th>
                            <th className="text-xs text-center">Akurasi</th>
                            <th className="text-xs text-center">Detail</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.map((item) => {
                            const mapeVal = Number(item.mape) || 0;
                            const category = getMapeCategory(mapeVal);
                            const CategoryIcon = category.icon;
                            const isExpanded = expandedRow === (item.id ?? null);
                            if (item.id === undefined) return null;

                            return (
                              <>
                                <tr key={item.id} className={`hover:bg-base-200/30 transition-colors ${isExpanded ? "bg-base-200/20" : ""}`}>
                                  <td className="text-xs font-medium">
                                    {BULAN_NAMES[item.bulan_prediksi]?.slice(0, 3)} {item.tahun_prediksi}
                                  </td>
                                  <td>
                                    <span className="badge badge-sm font-mono font-semibold" style={{
                                      backgroundColor: (METHOD_COLORS[item.metode] || "#6366f1") + "20",
                                      color: METHOD_COLORS[item.metode] || "#6366f1",
                                    }}>
                                      {item.metode}
                                    </span>
                                  </td>
                                  <td className="text-xs text-base-content/70">{item.jenis_kendaraan_nama || "Semua"}</td>
                                  <td className="text-right font-mono text-xs font-semibold">{formatRupiah(Number(item.nilai_prediksi))}</td>
                                  <td className="text-right font-mono text-xs">
                                    {item.nilai_aktual ? formatRupiah(Number(item.nilai_aktual)) : "-"}
                                  </td>
                                  <td className="text-right font-mono text-xs font-semibold">{mapeVal > 0 ? `${formatNumber(mapeVal)}%` : "-"}</td>
                                  <td className="text-center">
                                    {mapeVal > 0 ? (
                                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${category.color}`}>
                                        <CategoryIcon className="w-3 h-3" />
                                        {category.label}
                                      </span>
                                    ) : "-"}
                                  </td>
                                  <td className="text-center">
                                    <button className="btn btn-xs btn-ghost btn-square" onClick={() => setExpandedRow(isExpanded ? null : item.id!)}>
                                      {isExpanded ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                    </button>
                                  </td>
                                </tr>

                                {isExpanded && (
                                  <tr key={`detail-${item.id}`} className="bg-base-200/10">
                                    <td colSpan={8}>
                                      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                          <p className="text-xs font-semibold text-base-content/80 mb-2">Detail Prediksi</p>
                                          <div className="flex justify-between text-xs">
                                            <span className="text-base-content/60">Nilai Prediksi</span>
                                            <span className="font-mono font-semibold">{formatRupiahFull(Number(item.nilai_prediksi))}</span>
                                          </div>
                                          {item.nilai_aktual && (
                                            <div className="flex justify-between text-xs">
                                              <span className="text-base-content/60">Nilai Aktual</span>
                                              <span className="font-mono font-semibold">{formatRupiahFull(Number(item.nilai_aktual))}</span>
                                            </div>
                                          )}
                                        </div>
                                        <div className="space-y-2">
                                          <p className="text-xs font-semibold text-base-content/80 mb-2">Metrik Evaluasi</p>
                                          <div className="flex justify-between text-xs"><span className="text-base-content/60">MAPE</span><span className="font-mono font-semibold">{formatNumber(mapeVal)}%</span></div>
                                          <div className="flex justify-between text-xs"><span className="text-base-content/60">MAE</span><span className="font-mono font-semibold">{formatRupiah(item.mae)}</span></div>
                                          <div className="flex justify-between text-xs"><span className="text-base-content/60">RMSE</span><span className="font-mono font-semibold">{formatRupiah(item.rmse)}</span></div>
                                        </div>
                                        <div className="space-y-2">
                                          <p className="text-xs font-semibold text-base-content/80 mb-2">Parameter</p>
                                          {item.alpha !== undefined && <div className="flex justify-between text-xs"><span className="text-base-content/60">Alpha</span><span className="font-mono">{Number(item.alpha).toFixed(4)}</span></div>}
                                          {item.beta !== undefined && <div className="flex justify-between text-xs"><span className="text-base-content/60">Beta</span><span className="font-mono">{Number(item.beta).toFixed(4)}</span></div>}
                                          {item.gamma !== undefined && <div className="flex justify-between text-xs"><span className="text-base-content/60">Gamma</span><span className="font-mono">{Number(item.gamma).toFixed(4)}</span></div>}
                                          <div className="flex justify-between text-xs"><span className="text-base-content/60">Data Training</span><span className="font-mono text-[10px]">{item.jumlah_data_training} periode</span></div>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex flex-col sm:flex-row items-center justify-between mt-4 pt-4 border-t border-base-200 gap-3">
                      <p className="text-xs text-base-content/60">
                        Menampilkan <span className="font-semibold">{(page - 1) * pageSize + 1}</span>-<span className="font-semibold">{Math.min(page * pageSize, totalCount)}</span> dari <span className="font-semibold">{totalCount}</span> data
                      </p>
                      <div className="flex items-center gap-1">
                        <button className="btn btn-xs btn-ghost btn-square" onClick={() => fetchData(1)} disabled={page <= 1}><ChevronsLeft className="w-3.5 h-3.5" /></button>
                        <button className="btn btn-xs btn-ghost btn-square" onClick={() => fetchData(page - 1)} disabled={page <= 1}><ChevronLeft className="w-3.5 h-3.5" /></button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum: number;
                          if (totalPages <= 5) pageNum = i + 1;
                          else if (page <= 3) pageNum = i + 1;
                          else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                          else pageNum = page - 2 + i;
                          return (
                            <button key={`page-${pageNum}-${i}`} className={`btn btn-xs btn-square ${pageNum === page ? "btn-primary" : "btn-ghost"}`} onClick={() => fetchData(pageNum)}>
                              {pageNum}
                            </button>
                          );
                        })}
                        <button className="btn btn-xs btn-ghost btn-square" onClick={() => fetchData(page + 1)} disabled={page >= totalPages}><ChevronRight className="w-3.5 h-3.5" /></button>
                        <button className="btn btn-xs btn-ghost btn-square" onClick={() => fetchData(totalPages)} disabled={page >= totalPages}><ChevronsRight className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  </>
                )}
              </Card>
            )}
          </div>
        </div>
      </div>
    </PimpinanRoute>
  );
}
