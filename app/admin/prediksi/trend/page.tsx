/** @format */

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AdminRoute from "@/components/AdminRoute";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Card, Button } from "@/components/ui";
import type { SelectOption } from "@/components/ui/types";
import {
  agregatService,
  type AgregatPendapatan,
} from "@/services/agregatService";
import { jenisKendaraanService } from "@/services/jenisKendaraanService";
import { toast } from "@/services";
import {
  TrendingUp,
  TrendingDown,
  Loader2,
  RefreshCw,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Calendar,
  Layers,
  Activity,
  Sun,
  Snowflake,
  Flame,
  Filter,
  Info,
} from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  LineChart,
  Line,
  Bar,
  BarChart,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ReferenceLine,
} from "recharts";

// ━━━━━━━━━━━━━━━━━━ Constants ━━━━━━━━━━━━━━━━━━
const BULAN_SHORT = [
  "",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

const BULAN_FULL = [
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

const YEAR_COLORS = [
  "#6366f1", // indigo
  "#06b6d4", // cyan
  "#f59e0b", // amber
  "#10b981", // emerald
  "#ef4444", // red
  "#8b5cf6", // violet
  "#ec4899", // pink
];

const COMPONENT_COLORS: Record<string, { color: string; label: string }> = {
  total_pokok_pkb: { color: "#6366f1", label: "PKB" },
  total_denda_pkb: { color: "#ef4444", label: "Denda PKB" },
  total_swdkllj: { color: "#f59e0b", label: "SWDKLLJ" },
  total_bbnkb: { color: "#10b981", label: "BBNKB" },
  total_opsen: { color: "#8b5cf6", label: "Opsen" },
};

// ━━━━━━━━━━━━━━━━━━ Helpers ━━━━━━━━━━━━━━━━━━
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

const formatPct = (val: number): string =>
  new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(val);

// ━━━━━━━━━━━━━━━━━━ Custom Tooltip ━━━━━━━━━━━━━━━━━━
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-base-100 border border-base-300 rounded-xl shadow-2xl p-4 min-w-[220px]">
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
            {typeof entry.value === "number"
              ? entry.name?.includes("%") || entry.name?.includes("Growth") || entry.name?.includes("Pertumbuhan")
                ? `${formatPct(entry.value)}%`
                : formatRupiahFull(entry.value)
              : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

// ━━━━━━━━━━━━━━━━━━ Processed Data Types ━━━━━━━━━━━━━━━━━━
interface DataPoint {
  periode: string;
  bulan: number;
  tahun: number;
  total_pendapatan: number;
  jumlah_transaksi: number;
  total_pokok_pkb: number;
  total_denda_pkb: number;
  total_swdkllj: number;
  total_bbnkb: number;
  total_opsen: number;
}

// ━━━━━━━━━━━━━━━━━━ Main Component ━━━━━━━━━━━━━━━━━━
export default function TrendAnalysisPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [rawData, setRawData] = useState<DataPoint[]>([]);
  const [jenisKendaraanOptions, setJenisKendaraanOptions] = useState<
    SelectOption[]
  >([]);
  const [selectedJenisKendaraan, setSelectedJenisKendaraan] =
    useState<string>("");

  // Fetch jenis kendaraan
  const fetchJenisKendaraan = useCallback(async () => {
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
      console.error(e);
    }
  }, []);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const params: any = { page_size: 1000 };
      if (selectedJenisKendaraan)
        params.jenis_kendaraan_id = parseInt(selectedJenisKendaraan);

      const response = await agregatService.getList(params);
      const rawItems = (response.data || []).map(
        (item: AgregatPendapatan) => ({
          periode: `${BULAN_SHORT[item.bulan]} ${item.tahun}`,
          bulan: item.bulan,
          tahun: item.tahun,
          total_pendapatan: parseFloat(item.total_pendapatan as any) || 0,
          jumlah_transaksi: item.jumlah_transaksi || 0,
          total_pokok_pkb: parseFloat(item.total_pokok_pkb as any) || 0,
          total_denda_pkb: parseFloat(item.total_denda_pkb as any) || 0,
          total_swdkllj: parseFloat(item.total_swdkllj as any) || 0,
          total_bbnkb: parseFloat(item.total_bbnkb as any) || 0,
          total_opsen: parseFloat(item.total_opsen as any) || 0,
        })
      );

      // When no jenis_kendaraan selected, the API returns separate rows
      // per vehicle type for each month. We must aggregate (SUM) by tahun+bulan.
      let data: DataPoint[];
      if (!selectedJenisKendaraan) {
        const grouped = new Map<string, DataPoint>();
        rawItems.forEach((item: DataPoint) => {
          const key = `${item.tahun}-${item.bulan}`;
          const existing = grouped.get(key);
          if (existing) {
            existing.total_pendapatan += item.total_pendapatan;
            existing.jumlah_transaksi += item.jumlah_transaksi;
            existing.total_pokok_pkb += item.total_pokok_pkb;
            existing.total_denda_pkb += item.total_denda_pkb;
            existing.total_swdkllj += item.total_swdkllj;
            existing.total_bbnkb += item.total_bbnkb;
            existing.total_opsen += item.total_opsen;
          } else {
            grouped.set(key, { ...item });
          }
        });
        data = Array.from(grouped.values());
      } else {
        data = rawItems;
      }

      data.sort(
        (a: DataPoint, b: DataPoint) =>
          a.tahun * 100 + a.bulan - (b.tahun * 100 + b.bulan)
      );

      setRawData(data);
    } catch (error) {
      toast.error("Gagal memuat data trend");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedJenisKendaraan]);

  useEffect(() => {
    fetchJenisKendaraan();
  }, [fetchJenisKendaraan]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ━━━ Derived Data ━━━

  // Available years
  const years = useMemo(
    () => [...new Set(rawData.map((d) => d.tahun))].sort(),
    [rawData]
  );

  // 1) Year-over-Year comparison data
  const yoyData = useMemo(() => {
    const result: any[] = [];
    for (let bulan = 1; bulan <= 12; bulan++) {
      const point: any = { bulan: BULAN_SHORT[bulan] };
      years.forEach((year) => {
        const d = rawData.find((r) => r.tahun === year && r.bulan === bulan);
        point[`${year}`] = d ? d.total_pendapatan : null;
      });
      result.push(point);
    }
    return result;
  }, [rawData, years]);

  // 2) Growth rate data (MoM and YoY)
  const growthData = useMemo(() => {
    return rawData.map((d, idx) => {
      const prev = idx > 0 ? rawData[idx - 1] : null;
      const momGrowth =
        prev && prev.total_pendapatan > 0
          ? ((d.total_pendapatan - prev.total_pendapatan) /
              prev.total_pendapatan) *
            100
          : null;

      // Year-over-year
      const sameMonthPrevYear = rawData.find(
        (r) => r.tahun === d.tahun - 1 && r.bulan === d.bulan
      );
      const yoyGrowth =
        sameMonthPrevYear && sameMonthPrevYear.total_pendapatan > 0
          ? ((d.total_pendapatan - sameMonthPrevYear.total_pendapatan) /
              sameMonthPrevYear.total_pendapatan) *
            100
          : null;

      return {
        periode: d.periode,
        mom: momGrowth,
        yoy: yoyGrowth,
      };
    });
  }, [rawData]);

  // 3) Moving averages
  const maData = useMemo(() => {
    return rawData.map((d, idx) => {
      const calcMA = (window: number) => {
        if (idx < window - 1) return null;
        const slice = rawData.slice(idx - window + 1, idx + 1);
        return slice.reduce((sum, s) => sum + s.total_pendapatan, 0) / window;
      };

      return {
        periode: d.periode,
        aktual: d.total_pendapatan,
        ma3: calcMA(3),
        ma6: calcMA(6),
        ma12: calcMA(12),
      };
    });
  }, [rawData]);

  // 4) Seasonal pattern
  const seasonalData = useMemo(() => {
    const result: any[] = [];
    for (let bulan = 1; bulan <= 12; bulan++) {
      const monthData = rawData.filter((d) => d.bulan === bulan);
      if (monthData.length === 0) continue;
      const avg =
        monthData.reduce((s, d) => s + d.total_pendapatan, 0) /
        monthData.length;
      const min = Math.min(...monthData.map((d) => d.total_pendapatan));
      const max = Math.max(...monthData.map((d) => d.total_pendapatan));
      result.push({
        bulan: BULAN_SHORT[bulan],
        bulanFull: BULAN_FULL[bulan],
        rata_rata: avg,
        minimum: min,
        maksimum: max,
        range: max - min,
        count: monthData.length,
      });
    }
    return result;
  }, [rawData]);

  // 5) Composition trend (% share)
  const compositionData = useMemo(() => {
    return rawData.map((d) => {
      const total = d.total_pendapatan || 1;
      return {
        periode: d.periode,
        PKB: (d.total_pokok_pkb / total) * 100,
        "Denda PKB": (d.total_denda_pkb / total) * 100,
        SWDKLLJ: (d.total_swdkllj / total) * 100,
        BBNKB: (d.total_bbnkb / total) * 100,
        Opsen: (d.total_opsen / total) * 100,
      };
    });
  }, [rawData]);

  // 6) Summary stats
  const stats = useMemo(() => {
    if (rawData.length === 0)
      return {
        overallGrowth: 0,
        avgMomGrowth: 0,
        peakMonth: "",
        lowMonth: "",
        peakValue: 0,
        lowValue: 0,
        volatility: 0,
        totalPeriods: 0,
      };

    // Overall growth
    const first = rawData[0].total_pendapatan;
    const last = rawData[rawData.length - 1].total_pendapatan;
    const overallGrowth = first > 0 ? ((last - first) / first) * 100 : 0;

    // Average MoM growth
    const momValues = growthData
      .map((g) => g.mom)
      .filter((v): v is number => v !== null);
    const avgMomGrowth =
      momValues.length > 0
        ? momValues.reduce((s, v) => s + v, 0) / momValues.length
        : 0;

    // Peak & Low seasonal
    const peak = seasonalData.reduce(
      (best, d) => (d.rata_rata > best.rata_rata ? d : best),
      seasonalData[0] || { bulanFull: "-", rata_rata: 0 }
    );
    const low = seasonalData.reduce(
      (worst, d) => (d.rata_rata < worst.rata_rata ? d : worst),
      seasonalData[0] || { bulanFull: "-", rata_rata: 0 }
    );

    // Volatility (coefficient of variation)
    const values = rawData.map((d) => d.total_pendapatan);
    const mean = values.reduce((s, v) => s + v, 0) / values.length;
    const variance =
      values.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const volatility = mean > 0 ? (stdDev / mean) * 100 : 0;

    return {
      overallGrowth,
      avgMomGrowth,
      peakMonth: peak?.bulanFull || "-",
      lowMonth: low?.bulanFull || "-",
      peakValue: peak?.rata_rata || 0,
      lowValue: low?.rata_rata || 0,
      volatility,
      totalPeriods: rawData.length,
    };
  }, [rawData, growthData, seasonalData]);

  return (
    <AdminRoute>
      <div className="min-h-screen bg-base-200 flex overflow-x-hidden">
        <Sidebar />

        <div className="flex-1 lg:ml-64 overflow-x-hidden">
          <Header
            variant="admin"
            title="Trend Analysis"
            subtitle="Analisis tren dan pola pendapatan pajak kendaraan bermotor"
            showThemeSwitcher={true}
          />

          <div className="p-4 lg:p-8 min-w-0">
            {/* Filter */}
            <Card className="mb-6">
              <div className="flex flex-col sm:flex-row gap-3 items-end">
                <div className="flex-1">
                  <label className="label">
                    <span className="label-text text-xs font-medium">
                      <Filter className="w-3 h-3 inline mr-1" />
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
                    <option value="">Semua Jenis Kendaraan</option>
                    {jenisKendaraanOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fetchData}
                  leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                >
                  Refresh
                </Button>
              </div>
            </Card>

            {/* Loading */}
            {isLoading && (
              <Card className="p-12">
                <div className="flex flex-col items-center justify-center">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  <p className="mt-4 text-sm text-base-content/60">
                    Memuat data trend...
                  </p>
                </div>
              </Card>
            )}

            {!isLoading && rawData.length > 0 && (
              <>
                {/* Summary Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          stats.overallGrowth >= 0
                            ? "bg-success/10"
                            : "bg-error/10"
                        }`}
                      >
                        {stats.overallGrowth >= 0 ? (
                          <ArrowUpRight className="w-5 h-5 text-success" />
                        ) : (
                          <ArrowDownRight className="w-5 h-5 text-error" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-base-content/60 uppercase tracking-wider">
                          Pertumbuhan Total
                        </p>
                        <p
                          className={`text-lg font-bold ${
                            stats.overallGrowth >= 0
                              ? "text-success"
                              : "text-error"
                          }`}
                        >
                          {stats.overallGrowth >= 0 ? "+" : ""}
                          {formatPct(stats.overallGrowth)}%
                        </p>
                        <p className="text-[9px] text-base-content/40">
                          {stats.totalPeriods} periode
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-info/10 rounded-lg flex items-center justify-center">
                        <Activity className="w-5 h-5 text-info" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-base-content/60 uppercase tracking-wider">
                          Rata-rata Pertumbuhan/Bln
                        </p>
                        <p
                          className={`text-lg font-bold ${
                            stats.avgMomGrowth >= 0
                              ? "text-info"
                              : "text-error"
                          }`}
                        >
                          {stats.avgMomGrowth >= 0 ? "+" : ""}
                          {formatPct(stats.avgMomGrowth)}%
                        </p>
                        <p className="text-[9px] text-base-content/40">
                          Volatilitas: {formatPct(stats.volatility)}%
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                        <Flame className="w-5 h-5 text-warning" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-base-content/60 uppercase tracking-wider">
                          Bulan Tertinggi
                        </p>
                        <p className="text-sm font-bold truncate">
                          {stats.peakMonth}
                        </p>
                        <p className="text-[9px] text-base-content/40">
                          Rata-rata: {formatRupiah(stats.peakValue)}
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                        <Snowflake className="w-5 h-5 text-secondary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-base-content/60 uppercase tracking-wider">
                          Bulan Terendah
                        </p>
                        <p className="text-sm font-bold truncate">
                          {stats.lowMonth}
                        </p>
                        <p className="text-[9px] text-base-content/40">
                          Rata-rata: {formatRupiah(stats.lowValue)}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Year-over-Year Comparison */}
                <Card className="mb-6">
                  <h3 className="text-base font-semibold mb-1 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Perbandingan Antar Tahun (Year-over-Year)
                  </h3>
                  <p className="text-xs text-base-content/60 mb-4">
                    Perbandingan pendapatan per bulan di setiap tahun untuk
                    melihat pola musiman dan tren pertumbuhan
                  </p>
                  <div style={{ width: "100%", height: 400, minWidth: 0 }}>
                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                      minWidth={0}
                    >
                      <LineChart data={yoyData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(148,163,184,0.15)"
                        />
                        <XAxis
                          dataKey="bulan"
                          tick={{ fontSize: 11, fontWeight: 500 }}
                        />
                        <YAxis
                          tick={{ fontSize: 10 }}
                          tickFormatter={(v) => formatRupiah(v)}
                          width={80}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                          wrapperStyle={{ fontSize: 11, paddingTop: 10 }}
                        />
                        {years.map((year, i) => (
                          <Line
                            key={year}
                            type="monotone"
                            dataKey={`${year}`}
                            name={`${year}`}
                            stroke={YEAR_COLORS[i % YEAR_COLORS.length]}
                            strokeWidth={
                              year === years[years.length - 1] ? 3 : 1.5
                            }
                            dot={{
                              r: year === years[years.length - 1] ? 4 : 2.5,
                              fill: YEAR_COLORS[i % YEAR_COLORS.length],
                            }}
                            opacity={
                              year === years[years.length - 1] ? 1 : 0.6
                            }
                            connectNulls={false}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Moving Average Analysis */}
                <Card className="mb-6">
                  <h3 className="text-base font-semibold mb-1 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-accent" />
                    Moving Average & Trend
                  </h3>
                  <p className="text-xs text-base-content/60 mb-4">
                    Tren jangka pendek (MA-3), menengah (MA-6), dan panjang
                    (MA-12) untuk melihat arah pergerakan pendapatan
                  </p>
                  <div style={{ width: "100%", height: 400, minWidth: 0 }}>
                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                      minWidth={0}
                    >
                      <ComposedChart data={maData}>
                        <defs>
                          <linearGradient
                            id="gradAktual"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#94a3b8"
                              stopOpacity={0.15}
                            />
                            <stop
                              offset="95%"
                              stopColor="#94a3b8"
                              stopOpacity={0.02}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(148,163,184,0.15)"
                        />
                        <XAxis
                          dataKey="periode"
                          tick={{ fontSize: 9 }}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis
                          tick={{ fontSize: 10 }}
                          tickFormatter={(v) => formatRupiah(v)}
                          width={80}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                          wrapperStyle={{ fontSize: 11, paddingTop: 10 }}
                        />
                        <Area
                          type="monotone"
                          dataKey="aktual"
                          name="Aktual"
                          stroke="#94a3b8"
                          strokeWidth={1}
                          fill="url(#gradAktual)"
                          dot={false}
                          opacity={0.5}
                        />
                        <Line
                          type="monotone"
                          dataKey="ma3"
                          name="MA-3 (3 bulan)"
                          stroke="#06b6d4"
                          strokeWidth={2}
                          dot={false}
                          connectNulls={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="ma6"
                          name="MA-6 (6 bulan)"
                          stroke="#f59e0b"
                          strokeWidth={2}
                          dot={false}
                          connectNulls={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="ma12"
                          name="MA-12 (12 bulan)"
                          stroke="#10b981"
                          strokeWidth={2.5}
                          dot={false}
                          connectNulls={false}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Growth Rate & Seasonal Pattern Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Growth Rate */}
                  <Card>
                    <h3 className="text-base font-semibold mb-1 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-info" />
                      Laju Pertumbuhan
                    </h3>
                    <p className="text-xs text-base-content/60 mb-4">
                      Pertumbuhan bulanan (MoM) vs tahunan (YoY)
                    </p>
                    <div
                      style={{ width: "100%", height: 300, minWidth: 0 }}
                    >
                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                        minWidth={0}
                      >
                        <ComposedChart data={growthData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="rgba(148,163,184,0.15)"
                          />
                          <XAxis
                            dataKey="periode"
                            tick={{ fontSize: 8 }}
                            angle={-45}
                            textAnchor="end"
                            height={50}
                          />
                          <YAxis
                            tick={{ fontSize: 10 }}
                            tickFormatter={(v) => `${v.toFixed(0)}%`}
                            width={50}
                          />
                          <Tooltip
                            content={({ active, payload, label }: any) => {
                              if (!active || !payload || !payload.length)
                                return null;
                              return (
                                <div className="bg-base-100 border border-base-300 rounded-xl shadow-2xl p-4 min-w-[200px]">
                                  <p className="text-xs font-bold text-base-content/80 mb-2 border-b border-base-200 pb-2">
                                    {label}
                                  </p>
                                  {payload.map(
                                    (entry: any, index: number) => (
                                      <div
                                        key={index}
                                        className="flex items-center justify-between gap-4 py-0.5"
                                      >
                                        <div className="flex items-center gap-2">
                                          <div
                                            className="w-2.5 h-2.5 rounded-full"
                                            style={{
                                              backgroundColor: entry.color,
                                            }}
                                          />
                                          <span className="text-xs text-base-content/70">
                                            {entry.name}
                                          </span>
                                        </div>
                                        <span className="text-xs font-semibold font-mono">
                                          {entry.value !== null
                                            ? `${formatPct(entry.value)}%`
                                            : "-"}
                                        </span>
                                      </div>
                                    )
                                  )}
                                </div>
                              );
                            }}
                          />
                          <Legend
                            wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                          />
                          <ReferenceLine
                            y={0}
                            stroke="#64748b"
                            strokeDasharray="4 4"
                          />
                          <Bar
                            dataKey="mom"
                            name="Pertumbuhan MoM (%)"
                            fill="#6366f1"
                            radius={[2, 2, 0, 0]}
                            opacity={0.6}
                          >
                            {growthData.map((entry, index) => (
                              <Cell
                                key={index}
                                fill={
                                  entry.mom !== null && entry.mom >= 0
                                    ? "#10b981"
                                    : "#ef4444"
                                }
                                opacity={0.6}
                              />
                            ))}
                          </Bar>
                          <Line
                            type="monotone"
                            dataKey="yoy"
                            name="Pertumbuhan YoY (%)"
                            stroke="#f59e0b"
                            strokeWidth={2}
                            dot={{
                              r: 2,
                              fill: "#f59e0b",
                            }}
                            connectNulls={false}
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  {/* Seasonal Pattern */}
                  <Card>
                    <h3 className="text-base font-semibold mb-1 flex items-center gap-2">
                      <Sun className="w-5 h-5 text-warning" />
                      Pola Musiman (Seasonal Pattern)
                    </h3>
                    <p className="text-xs text-base-content/60 mb-4">
                      Rata-rata pendapatan per bulan sepanjang semua tahun
                    </p>
                    <div
                      style={{ width: "100%", height: 300, minWidth: 0 }}
                    >
                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                        minWidth={0}
                      >
                        <BarChart data={seasonalData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="rgba(148,163,184,0.15)"
                          />
                          <XAxis
                            dataKey="bulan"
                            tick={{ fontSize: 11, fontWeight: 500 }}
                          />
                          <YAxis
                            tick={{ fontSize: 10 }}
                            tickFormatter={(v) => formatRupiah(v)}
                            width={75}
                          />
                          <Tooltip
                            content={({ active, payload, label }: any) => {
                              if (!active || !payload || !payload.length)
                                return null;
                              const data = payload[0]?.payload;
                              return (
                                <div className="bg-base-100 border border-base-300 rounded-xl shadow-2xl p-4 min-w-[200px]">
                                  <p className="text-xs font-bold text-base-content/80 mb-2 border-b border-base-200 pb-2">
                                    {data?.bulanFull || label}
                                  </p>
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                      <span className="text-base-content/60">
                                        Rata-rata
                                      </span>
                                      <span className="font-mono font-semibold">
                                        {formatRupiahFull(
                                          data?.rata_rata || 0
                                        )}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                      <span className="text-base-content/60">
                                        Min
                                      </span>
                                      <span className="font-mono">
                                        {formatRupiahFull(
                                          data?.minimum || 0
                                        )}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                      <span className="text-base-content/60">
                                        Max
                                      </span>
                                      <span className="font-mono">
                                        {formatRupiahFull(
                                          data?.maksimum || 0
                                        )}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                      <span className="text-base-content/60">
                                        Jumlah data
                                      </span>
                                      <span className="font-mono">
                                        {data?.count || 0} tahun
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            }}
                          />
                          <Bar
                            dataKey="rata_rata"
                            name="Rata-rata Pendapatan"
                            radius={[6, 6, 0, 0]}
                          >
                            {seasonalData.map((entry, index) => {
                              const maxAvg = Math.max(
                                ...seasonalData.map((s) => s.rata_rata)
                              );
                              const minAvg = Math.min(
                                ...seasonalData.map((s) => s.rata_rata)
                              );
                              const intensity =
                                maxAvg > minAvg
                                  ? (entry.rata_rata - minAvg) /
                                    (maxAvg - minAvg)
                                  : 0.5;
                              // Gradient from cool blue to warm orange
                              const hue = 220 - intensity * 190; // 220 (blue) to 30 (orange)
                              return (
                                <Cell
                                  key={index}
                                  fill={`hsl(${hue}, 75%, 55%)`}
                                  opacity={0.85}
                                />
                              );
                            })}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </div>

                {/* Revenue Composition Trend */}
                <Card className="mb-6">
                  <h3 className="text-base font-semibold mb-1 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-secondary" />
                    Komposisi Pendapatan (% Share)
                  </h3>
                  <p className="text-xs text-base-content/60 mb-4">
                    Proporsi masing-masing komponen pendapatan (PKB, Denda,
                    SWDKLLJ, BBNKB, Opsen) dari waktu ke waktu
                  </p>
                  <div style={{ width: "100%", height: 350, minWidth: 0 }}>
                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                      minWidth={0}
                    >
                      <AreaChart data={compositionData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(148,163,184,0.15)"
                        />
                        <XAxis
                          dataKey="periode"
                          tick={{ fontSize: 9 }}
                          angle={-45}
                          textAnchor="end"
                          height={55}
                        />
                        <YAxis
                          tick={{ fontSize: 10 }}
                          tickFormatter={(v) => `${v.toFixed(0)}%`}
                          domain={[0, 100]}
                          width={45}
                        />
                        <Tooltip
                          content={({ active, payload, label }: any) => {
                            if (!active || !payload || !payload.length)
                              return null;
                            return (
                              <div className="bg-base-100 border border-base-300 rounded-xl shadow-2xl p-4 min-w-[200px]">
                                <p className="text-xs font-bold text-base-content/80 mb-2 border-b border-base-200 pb-2">
                                  {label}
                                </p>
                                {payload.map(
                                  (entry: any, index: number) => (
                                    <div
                                      key={index}
                                      className="flex items-center justify-between gap-4 py-0.5"
                                    >
                                      <div className="flex items-center gap-2">
                                        <div
                                          className="w-2.5 h-2.5 rounded-full"
                                          style={{
                                            backgroundColor: entry.color,
                                          }}
                                        />
                                        <span className="text-xs text-base-content/70">
                                          {entry.name}
                                        </span>
                                      </div>
                                      <span className="text-xs font-semibold font-mono">
                                        {formatPct(entry.value)}%
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            );
                          }}
                        />
                        <Legend
                          wrapperStyle={{ fontSize: 11, paddingTop: 10 }}
                        />
                        {Object.entries(COMPONENT_COLORS).map(
                          ([key, { color, label }]) => (
                            <Area
                              key={key}
                              type="monotone"
                              dataKey={label}
                              name={label}
                              stackId="1"
                              stroke={color}
                              fill={color}
                              fillOpacity={0.7}
                            />
                          )
                        )}
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Seasonal Table */}
                <Card className="mb-6">
                  <h3 className="text-base font-semibold mb-1 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Statistik Musiman Detail
                  </h3>
                  <p className="text-xs text-base-content/60 mb-4">
                    Ringkasan statistik per bulan dari seluruh data historis
                  </p>
                  <div className="overflow-x-auto">
                    <table className="table table-sm w-full">
                      <thead>
                        <tr className="bg-base-200/50">
                          <th className="text-xs">Bulan</th>
                          <th className="text-xs text-right">Rata-rata</th>
                          <th className="text-xs text-right">Minimum</th>
                          <th className="text-xs text-right">Maksimum</th>
                          <th className="text-xs text-right">Range</th>
                          <th className="text-xs text-center">Data</th>
                          <th className="text-xs">Intensitas</th>
                        </tr>
                      </thead>
                      <tbody>
                        {seasonalData.map((item) => {
                          const maxAvg = Math.max(
                            ...seasonalData.map((s) => s.rata_rata)
                          );
                          const minAvg = Math.min(
                            ...seasonalData.map((s) => s.rata_rata)
                          );
                          const intensity =
                            maxAvg > minAvg
                              ? ((item.rata_rata - minAvg) /
                                  (maxAvg - minAvg)) *
                                100
                              : 50;

                          return (
                            <tr key={item.bulan}>
                              <td className="text-xs font-semibold">
                                {item.bulanFull}
                              </td>
                              <td className="text-right font-mono text-xs font-semibold">
                                {formatRupiah(item.rata_rata)}
                              </td>
                              <td className="text-right font-mono text-xs text-base-content/60">
                                {formatRupiah(item.minimum)}
                              </td>
                              <td className="text-right font-mono text-xs text-base-content/60">
                                {formatRupiah(item.maksimum)}
                              </td>
                              <td className="text-right font-mono text-xs text-base-content/60">
                                {formatRupiah(item.range)}
                              </td>
                              <td className="text-center text-xs">
                                <span className="badge badge-xs badge-ghost">
                                  {item.count} thn
                                </span>
                              </td>
                              <td>
                                <div className="flex items-center gap-2">
                                  <div className="w-16 h-2 bg-base-300 rounded-full overflow-hidden">
                                    <div
                                      className="h-full rounded-full transition-all"
                                      style={{
                                        width: `${intensity}%`,
                                        backgroundColor:
                                          intensity > 66
                                            ? "#ef4444"
                                            : intensity > 33
                                            ? "#f59e0b"
                                            : "#06b6d4",
                                      }}
                                    />
                                  </div>
                                  <span className="text-[10px] font-mono text-base-content/50">
                                    {formatPct(intensity)}%
                                  </span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </Card>

                {/* Info Guide */}
                <Card className="bg-info/5 border-info/20">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-info shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-info mb-2">
                        Panduan Interpretasi Trend
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-base-content/70">
                        <div>
                          <p className="font-semibold text-base-content/80 mb-1">
                            📈 Year-over-Year
                          </p>
                          <p>
                            Membandingkan pendapatan setiap bulan antar tahun.
                            Garis yang lebih tinggi di tahun terbaru menunjukkan
                            pertumbuhan positif.
                          </p>
                        </div>
                        <div>
                          <p className="font-semibold text-base-content/80 mb-1">
                            📊 Moving Average
                          </p>
                          <p>
                            MA-3 (3 bulan) untuk tren jangka pendek, MA-6 untuk
                            menengah, dan MA-12 untuk jangka panjang. Jika MA
                            pendek di atas MA panjang = tren naik.
                          </p>
                        </div>
                        <div>
                          <p className="font-semibold text-base-content/80 mb-1">
                            📉 Laju Pertumbuhan
                          </p>
                          <p>
                            MoM (Month-over-Month): pertumbuhan vs bulan
                            sebelumnya. YoY (Year-over-Year): pertumbuhan vs
                            bulan yang sama tahun lalu.
                          </p>
                        </div>
                        <div>
                          <p className="font-semibold text-base-content/80 mb-1">
                            🌡️ Pola Musiman
                          </p>
                          <p>
                            Menunjukkan bulan mana yang cenderung memiliki
                            pendapatan tinggi atau rendah. Berguna untuk
                            perencanaan anggaran dan alokasi SDM.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </>
            )}

            {/* Empty state */}
            {!isLoading && rawData.length === 0 && (
              <Card className="p-8">
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                    <TrendingUp className="w-10 h-10 text-primary/40" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">
                    Belum Ada Data
                  </h3>
                  <p className="text-sm text-base-content/60 text-center max-w-md">
                    Data agregat pendapatan belum tersedia. Silakan lakukan
                    regenerasi data agregat terlebih dahulu.
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminRoute>
  );
}
