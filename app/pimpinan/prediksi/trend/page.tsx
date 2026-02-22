/** @format */

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import PimpinanRoute from "@/components/PimpinanRoute";
import SidebarPimpinan from "@/components/SidebarPimpinan";
import Header from "@/components/Header";
import { Card, Button } from "@/components/ui";
import { agregatService } from "@/services/agregatService";
import { jenisKendaraanService } from "@/services/jenisKendaraanService";
import type { SelectOption } from "@/components/ui/types";
import { toast } from "@/services";
import {
  TrendingUp,
  ArrowLeft,
  Filter,
  RefreshCw,
  BarChart3,
  LineChart as LineChartIcon,
  Activity,
  Loader2,
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
  AreaChart,
  Area,
} from "recharts";

interface TrendData {
  periode: string;
  tahun: number;
  bulan: number;
  total_pendapatan: number;
  jumlah_transaksi: number;
  jumlah_kendaraan: number;
}

const BULAN_NAMES = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

const formatRupiah = (val: number): string => {
  if (val >= 1_000_000_000) return `Rp${(val / 1_000_000_000).toFixed(1)}M`;
  if (val >= 1_000_000) return `Rp${(val / 1_000_000).toFixed(0)}Jt`;
  return `Rp${val}`;
};

const formatRupiahFull = (val: number): string =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);

export default function PrediksiTrendPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<TrendData[]>([]);
  const [jenisKendaraanOptions, setJenisKendaraanOptions] = useState<SelectOption[]>([]);
  const [filterJenisKendaraan, setFilterJenisKendaraan] = useState<string>("");
  const [filterTahun, setFilterTahun] = useState<string>("");
  const [filterBulan, setFilterBulan] = useState<string>("");
  const [chartType, setChartType] = useState<"line" | "area">("line");

  const fetchJenisKendaraan = useCallback(async () => {
    try {
      const response = await jenisKendaraanService.getList({ page_size: 1000 });
      setJenisKendaraanOptions([
        { value: "", label: "Semua Jenis" },
        ...(response.data || []).map((item: any) => ({ value: item.id.toString(), label: item.nama }))
      ]);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await agregatService.getList({
        page_size: 1000,
        tahun: filterTahun ? parseInt(filterTahun) : undefined,
        bulan: filterBulan ? parseInt(filterBulan) : undefined,
        jenis_kendaraan_id: filterJenisKendaraan ? parseInt(filterJenisKendaraan) : undefined,
      });
      const rawData = (response.data || [])
        .sort((a: any, b: any) => {
          if (a.tahun !== b.tahun) return a.tahun - b.tahun;
          return a.bulan - b.bulan;
        });

      // Group by tahun+bulan dan agregasikan nilainya
      // (supaya tidak muncul duplikat saat tidak filter jenis kendaraan)
      const grouped = new Map<string, TrendData>();
      rawData.forEach((item: any) => {
        const key = `${item.tahun}-${item.bulan}`;
        const existing = grouped.get(key);
        if (existing) {
          existing.total_pendapatan += Number(item.total_pendapatan) || 0;
          existing.jumlah_transaksi += item.jumlah_transaksi || 0;
          existing.jumlah_kendaraan += item.jumlah_kendaraan || 0;
        } else {
          grouped.set(key, {
            periode: `${BULAN_NAMES[item.bulan - 1]} ${item.tahun}`,
            tahun: item.tahun,
            bulan: item.bulan,
            total_pendapatan: Number(item.total_pendapatan) || 0,
            jumlah_transaksi: item.jumlah_transaksi || 0,
            jumlah_kendaraan: item.jumlah_kendaraan || 0,
          });
        }
      });

      const sortedData = Array.from(grouped.values()).sort((a, b) => {
        if (a.tahun !== b.tahun) return a.tahun - b.tahun;
        return a.bulan - b.bulan;
      });
      setData(sortedData);
    } catch (error) {
      toast.error("Gagal memuat data trend");
    } finally {
      setIsLoading(false);
    }
  }, [filterJenisKendaraan, filterTahun, filterBulan]);

  useEffect(() => {
    fetchJenisKendaraan();
  }, [fetchJenisKendaraan]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const stats = useMemo(() => {
    if (data.length === 0) return null;
    const pendapatanValues = data.map(d => d.total_pendapatan);
    const totalPendapatan = pendapatanValues.reduce((a, b) => a + b, 0);
    const avgPendapatan = totalPendapatan / data.length;
    const firstValue = pendapatanValues[0];
    const lastValue = pendapatanValues[pendapatanValues.length - 1];
    const trendPercent = firstValue > 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;
    return { totalPendapatan, avgPendapatan, trendPercent };
  }, [data]);

  const yearOptions = Array.from({ length: 8 }, (_, i) => {
    const year = (new Date().getFullYear() - 5 + i).toString();
    return { value: year, label: year };
  });

  return (
    <PimpinanRoute>
      <div className="min-h-screen bg-base-200 flex overflow-x-hidden">
        <SidebarPimpinan />

        <div className="flex-1 lg:ml-64 overflow-x-hidden">
          <Header
            variant="admin"
            title="Analisis Trend"
            subtitle="Visualisasi pola dan trend pendapatan historis"
            showThemeSwitcher={true}
          />

          <div className="p-4 lg:p-8 min-w-0">
            <div className="flex items-center gap-2 mb-6">
              <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => router.push("/pimpinan/dashboard")}>
                Kembali
              </Button>
            </div>

            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                <Card className="p-4 border-l-4 border-primary">
                  <p className="text-[10px] text-base-content/60 uppercase">Total Pendapatan</p>
                  <p className="text-lg font-bold text-primary">{formatRupiah(stats.totalPendapatan)}</p>
                </Card>
                <Card className="p-4 border-l-4 border-info">
                  <p className="text-[10px] text-base-content/60 uppercase">Rata-rata/Bulan</p>
                  <p className="text-lg font-bold text-info">{formatRupiah(stats.avgPendapatan)}</p>
                </Card>
                <Card className="p-4 border-l-4 border-success">
                  <p className="text-[10px] text-base-content/60 uppercase">Trend</p>
                  <p className={`text-lg font-bold ${stats.trendPercent >= 0 ? 'text-success' : 'text-error'}`}>
                    {stats.trendPercent >= 0 ? '+' : ''}{stats.trendPercent.toFixed(1)}%
                  </p>
                </Card>
              </div>
            )}

            {/* Filters */}
            <Card className="mb-6">
              <div className="flex flex-col md:flex-row items-end gap-4">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
                  <div>
                    <label className="label"><span className="label-text font-medium">Jenis Kendaraan</span></label>
                    <select className="select select-bordered w-full select-sm" value={filterJenisKendaraan} onChange={(e) => setFilterJenisKendaraan(e.target.value)}>
                      {jenisKendaraanOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label"><span className="label-text font-medium">Tahun</span></label>
                    <select className="select select-bordered w-full select-sm" value={filterTahun} onChange={(e) => setFilterTahun(e.target.value)}>
                      <option value="">Semua Tahun</option>
                      {yearOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label"><span className="label-text font-medium">Bulan</span></label>
                    <select className="select select-bordered w-full select-sm" value={filterBulan} onChange={(e) => setFilterBulan(e.target.value)}>
                      <option value="">Semua Bulan</option>
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {new Date(2024, i).toLocaleString("id-ID", { month: "long" })}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label"><span className="label-text font-medium">Tipe Chart</span></label>
                    <div className="flex gap-2">
                      <button className={`btn btn-sm flex-1 ${chartType === 'line' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setChartType("line")}>
                        <LineChartIcon className="w-4 h-4" />
                      </button>
                      <button className={`btn btn-sm flex-1 ${chartType === 'area' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setChartType("area")}>
                        <Activity className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" leftIcon={<RefreshCw className="w-4 h-4" />} onClick={fetchData} loading={isLoading}>
                  Refresh
                </Button>
              </div>
            </Card>

            {/* Chart */}
            <Card className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Trend Pendapatan Historis
                </h3>
              </div>
              {isLoading ? (
                <div className="h-[350px] flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
              ) : data.length > 0 ? (
                <div style={{ width: "100%", height: 350 }}>
                  <ResponsiveContainer key={chartType} width="100%" height="100%">
                    {chartType === "area" ? (
                      <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                        <XAxis dataKey="periode" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => formatRupiah(v)} width={70} />
                        <Tooltip formatter={(value: number | undefined) => formatRupiahFull(value || 0)} />
                        <Area type="monotone" dataKey="total_pendapatan" name="Pendapatan" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} strokeWidth={2} />
                      </AreaChart>
                    ) : (
                      <LineChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                        <XAxis dataKey="periode" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => formatRupiah(v)} width={70} />
                        <Tooltip formatter={((value: any, name: any) => name === "Transaksi" ? Number(value || 0).toLocaleString("id-ID") + " transaksi" : formatRupiahFull(value || 0)) as any} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Line type="monotone" dataKey="total_pendapatan" name="Pendapatan" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="jumlah_transaksi" name="Transaksi" stroke="#10b981" strokeWidth={2} dot={{ r: 2 }} />
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[350px] flex flex-col items-center justify-center text-base-content/60">
                  <BarChart3 className="w-12 h-12 mb-2 opacity-50" />
                  <p>Tidak ada data untuk ditampilkan</p>
                </div>
              )}
            </Card>

            {/* Data Table */}
            {data.length > 0 && (
              <Card>
                <h3 className="text-sm font-semibold mb-4">Detail Data</h3>
                <div className="overflow-x-auto">
                  <table className="table table-sm w-full">
                    <thead>
                      <tr className="bg-base-200/50">
                        <th className="text-xs">Periode</th>
                        <th className="text-xs text-right">Pendapatan</th>
                        <th className="text-xs text-right">Transaksi</th>
                        <th className="text-xs text-right">Kendaraan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.slice(-12).map((item, index) => (
                        <tr key={index} className="hover:bg-base-200/30">
                          <td className="text-xs font-medium">{item.periode}</td>
                          <td className="text-xs text-right font-mono">{formatRupiahFull(item.total_pendapatan)}</td>
                          <td className="text-xs text-right font-mono">{item.jumlah_transaksi.toLocaleString("id-ID")}</td>
                          <td className="text-xs text-right font-mono">{item.jumlah_kendaraan.toLocaleString("id-ID")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </PimpinanRoute>
  );
}
