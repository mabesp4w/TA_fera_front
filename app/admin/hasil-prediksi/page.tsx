/** @format */

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AdminRoute from "@/components/AdminRoute";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Card, Button, ModalConfirm } from "@/components/ui";
import type { SelectOption } from "@/components/ui/types";
import {
  prediksiService,
  BULAN_OPTIONS,
  METHOD_OPTIONS,
  type PredictionResult,
  type PredictionMethod,
} from "@/services/prediksiService";
import { jenisKendaraanService } from "@/services/jenisKendaraanService";
import { toast } from "@/services";
import {
  FileText,
  Loader2,
  Trash2,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  Eye,
  EyeOff,
  BarChart3,
  X,
  Download,
  RefreshCw,
} from "lucide-react";

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
    return `Rp ${(val / 1_000_000_000).toFixed(2)}M`;
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

const METHOD_COLORS: Record<string, string> = {
  SES: "#06b6d4",
  DES: "#f59e0b",
  TES: "#10b981",
  HYBRID: "#8b5cf6",
};

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
      label: "Cukup",
      color: "text-warning bg-warning/10 border-warning/20",
      icon: AlertTriangle,
    };
  if (mape <= 50)
    return {
      label: "Kurang",
      color: "text-orange-500 bg-orange-500/10 border-orange-500/20",
      icon: AlertTriangle,
    };
  return {
    label: "Buruk",
    color: "text-error bg-error/10 border-error/20",
    icon: XCircle,
  };
};

// ━━━━━━━━━━━━━━━━━━ Main Component ━━━━━━━━━━━━━━━━━━
export default function HasilPrediksiPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<PredictionResult[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [jenisKendaraanOptions, setJenisKendaraanOptions] = useState<
    SelectOption[]
  >([]);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Modal confirm states
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    isMultiple: boolean;
    id?: number;
    count?: number;
  }>({ isOpen: false, isMultiple: false });
  const [isDeleting, setIsDeleting] = useState(false);

  // Filters
  const [filterMetode, setFilterMetode] = useState<string>("");
  const [filterJenisKendaraan, setFilterJenisKendaraan] = useState<string>("");
  const [filterTahun, setFilterTahun] = useState<string>("");
  const [filterBulan, setFilterBulan] = useState<string>("");

  // Fetch jenis kendaraan options
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
  const fetchData = useCallback(
    async (p: number = 1) => {
      try {
        setIsLoading(true);
        const params: any = { page: p, page_size: pageSize };
        if (filterMetode) params.metode = filterMetode;
        if (filterJenisKendaraan)
          params.jenis_kendaraan_id = parseInt(filterJenisKendaraan);
        if (filterTahun) params.tahun_prediksi = parseInt(filterTahun);
        if (filterBulan) params.bulan_prediksi = parseInt(filterBulan);

        const result = await prediksiService.getList(params);
        setData(result.data || []);
        setPage(result.page);
        setTotalPages(result.total_pages);
        setTotalCount(result.total_count);
        setSelectedIds(new Set());
      } catch (error) {
        toast.error("Gagal memuat data hasil prediksi");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    },
    [pageSize, filterMetode, filterJenisKendaraan, filterTahun, filterBulan]
  );

  // Delete single - open confirm modal
  const handleDeleteClick = (id: number) => {
    setDeleteModal({ isOpen: true, isMultiple: false, id });
  };

  // Delete selected - open confirm modal
  const handleDeleteSelectedClick = () => {
    if (selectedIds.size === 0) return;
    setDeleteModal({
      isOpen: true,
      isMultiple: true,
      count: selectedIds.size,
    });
  };

  // Confirm delete
  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      if (deleteModal.isMultiple && deleteModal.count) {
        const promises = Array.from(selectedIds).map((id) =>
          prediksiService.delete(id)
        );
        await Promise.all(promises);
        toast.success(`${deleteModal.count} prediksi berhasil dihapus`);
        setSelectedIds(new Set());
      } else if (deleteModal.id) {
        await prediksiService.delete(deleteModal.id);
        toast.success("Prediksi berhasil dihapus");
      }
      setDeleteModal({ isOpen: false, isMultiple: false });
      fetchData(page);
    } catch (error) {
      toast.error("Gagal menghapus prediksi");
    } finally {
      setIsDeleting(false);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteModal({ isOpen: false, isMultiple: false });
  };

  // Toggle select
  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Select all on page
  const toggleSelectAll = () => {
    if (selectedIds.size === data.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data.map((d) => d.id).filter((id): id is number => id !== undefined)));
    }
  };

  // Reset filters
  const resetFilters = () => {
    setFilterMetode("");
    setFilterJenisKendaraan("");
    setFilterTahun("");
    setFilterBulan("");
  };

  const hasFilters =
    filterMetode || filterJenisKendaraan || filterTahun || filterBulan;

  useEffect(() => {
    fetchJenisKendaraan();
  }, [fetchJenisKendaraan]);

  useEffect(() => {
    setPage(1);
    fetchData(1);
  }, [fetchData]);

  // Summary stats
  const stats = useMemo(() => {
    if (data.length === 0)
      return {
        avgMape: 0,
        bestMape: 0,
        worstMape: 0,
        methodCounts: {} as Record<string, number>,
      };

    const mapes = data
      .map((d) => parseFloat((d.mape ?? 0) as any))
      .filter((v) => v > 0);
    const avgMape =
      mapes.length > 0
        ? mapes.reduce((s, v) => s + v, 0) / mapes.length
        : 0;
    const bestMape = mapes.length > 0 ? Math.min(...mapes) : 0;
    const worstMape = mapes.length > 0 ? Math.max(...mapes) : 0;

    const methodCounts: Record<string, number> = {};
    data.forEach((d) => {
      methodCounts[d.metode] = (methodCounts[d.metode] || 0) + 1;
    });

    return { avgMape, bestMape, worstMape, methodCounts };
  }, [data]);

  // Year options for filter
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 8 }, (_, i) => ({
    value: (currentYear - 3 + i).toString(),
    label: (currentYear - 3 + i).toString(),
  }));

  return (
    <AdminRoute>
      <div className="min-h-screen bg-base-200 flex overflow-x-hidden">
        <Sidebar />

        <div className="flex-1 lg:ml-64 overflow-x-hidden">
          <Header
            variant="admin"
            title="Hasil Prediksi"
            subtitle="Riwayat dan manajemen seluruh hasil prediksi yang tersimpan"
            showThemeSwitcher={true}
          />

          <div className="p-4 lg:p-8 min-w-0">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              <Card className="p-4">
                <p className="text-[10px] text-base-content/60 uppercase tracking-wider mb-1">
                  Total Data
                </p>
                <p className="text-2xl font-bold text-primary">
                  {totalCount}
                </p>
                <p className="text-[9px] text-base-content/40">
                  hasil prediksi tersimpan
                </p>
              </Card>

              <Card className="p-4">
                <p className="text-[10px] text-base-content/60 uppercase tracking-wider mb-1">
                  Rata-rata MAPE
                </p>
                <p className="text-2xl font-bold">
                  {formatNumber(stats.avgMape)}%
                </p>
                <p className="text-[9px] text-base-content/40">
                  halaman ini
                </p>
              </Card>

              <Card className="p-4">
                <p className="text-[10px] text-base-content/60 uppercase tracking-wider mb-1">
                  MAPE Terbaik
                </p>
                <p className="text-2xl font-bold text-success">
                  {formatNumber(stats.bestMape)}%
                </p>
                <p className="text-[9px] text-base-content/40">
                  halaman ini
                </p>
              </Card>

              <Card className="p-4">
                <p className="text-[10px] text-base-content/60 uppercase tracking-wider mb-1">
                  Distribusi Metode
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {Object.entries(stats.methodCounts).map(
                    ([method, count]) => (
                      <span
                        key={method}
                        className="badge badge-xs font-mono"
                        style={{
                          backgroundColor:
                            (METHOD_COLORS[method] || "#6366f1") + "20",
                          color: METHOD_COLORS[method] || "#6366f1",
                          borderColor:
                            (METHOD_COLORS[method] || "#6366f1") + "40",
                        }}
                      >
                        {method}: {count}
                      </span>
                    )
                  )}
                </div>
              </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold">Filter</h3>
                {hasFilters && (
                  <button
                    className="btn btn-xs btn-ghost text-error gap-1"
                    onClick={resetFilters}
                  >
                    <X className="w-3 h-3" />
                    Reset
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="label py-0">
                    <span className="label-text text-[10px] font-medium">
                      Metode
                    </span>
                  </label>
                  <select
                    className="select select-bordered select-sm w-full"
                    value={filterMetode}
                    onChange={(e) => setFilterMetode(e.target.value)}
                  >
                    <option value="">Semua Metode</option>
                    {METHOD_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label py-0">
                    <span className="label-text text-[10px] font-medium">
                      Jenis Kendaraan
                    </span>
                  </label>
                  <select
                    className="select select-bordered select-sm w-full"
                    value={filterJenisKendaraan}
                    onChange={(e) =>
                      setFilterJenisKendaraan(e.target.value)
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
                <div>
                  <label className="label py-0">
                    <span className="label-text text-[10px] font-medium">
                      Tahun Prediksi
                    </span>
                  </label>
                  <select
                    className="select select-bordered select-sm w-full"
                    value={filterTahun}
                    onChange={(e) => setFilterTahun(e.target.value)}
                  >
                    <option value="">Semua Tahun</option>
                    {yearOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label py-0">
                    <span className="label-text text-[10px] font-medium">
                      Bulan Prediksi
                    </span>
                  </label>
                  <select
                    className="select select-bordered select-sm w-full"
                    value={filterBulan}
                    onChange={(e) => setFilterBulan(e.target.value)}
                  >
                    <option value="">Semua Bulan</option>
                    {BULAN_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>

            {/* Table Actions */}
            {selectedIds.size > 0 && (
              <div className="mb-4 p-3 bg-error/5 border border-error/20 rounded-xl flex items-center justify-between">
                <span className="text-sm font-medium">
                  {selectedIds.size} item dipilih
                </span>
                <button
                  className="btn btn-sm btn-error gap-1"
                  onClick={handleDeleteSelectedClick}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Hapus Terpilih
                </button>
              </div>
            )}

            {/* Loading */}
            {isLoading && (
              <Card className="p-12">
                <div className="flex flex-col items-center justify-center">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  <p className="mt-4 text-sm text-base-content/60">
                    Memuat data...
                  </p>
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
                    <span className="badge badge-sm badge-ghost">
                      {totalCount}
                    </span>
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fetchData(page)}
                    leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                  >
                    Refresh
                  </Button>
                </div>

                {data.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-16 h-16 bg-base-300/50 rounded-2xl flex items-center justify-center mb-4">
                      <FileText className="w-8 h-8 text-base-content/30" />
                    </div>
                    <p className="text-sm text-base-content/60 mb-1">
                      Tidak ada data ditemukan
                    </p>
                    <p className="text-xs text-base-content/40">
                      {hasFilters
                        ? "Coba ubah filter pencarian"
                        : "Belum ada hasil prediksi tersimpan"}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="table table-sm w-full">
                        <thead>
                          <tr className="bg-base-200/50">
                            <th className="w-10">
                              <input
                                type="checkbox"
                                className="checkbox checkbox-xs checkbox-primary"
                                checked={selectedIds.size === data.length && data.length > 0}
                                onChange={toggleSelectAll}
                              />
                            </th>
                            <th className="text-xs">Periode</th>
                            <th className="text-xs">Metode</th>
                            <th className="text-xs">Jenis Kendaraan</th>
                            <th className="text-xs text-right">
                              Nilai Prediksi
                            </th>
                            <th className="text-xs text-right">
                              Nilai Aktual
                            </th>
                            <th className="text-xs text-right">MAPE</th>
                            <th className="text-xs text-center">
                              Kategori
                            </th>
                            <th className="text-xs text-right">
                              Tanggal
                            </th>
                            <th className="text-xs text-center w-20">
                              Aksi
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.map((item) => {
                            const mapeVal = parseFloat(
                              (item.mape ?? 0) as any
                            );
                            const category = getMapeCategory(mapeVal);
                            const CategoryIcon = category.icon;
                            const isExpanded = expandedRow === (item.id ?? null);

                            // Skip items without id
                            if (item.id === undefined) return null;

                            return (
                              <>
                                <tr
                                  key={item.id}
                                  className={`hover:bg-base-200/30 transition-colors ${
                                    selectedIds.has(item.id)
                                      ? "bg-primary/5"
                                      : ""
                                  } ${isExpanded ? "bg-base-200/20" : ""}`}
                                >
                                  <td>
                                    <input
                                      type="checkbox"
                                      className="checkbox checkbox-xs checkbox-primary"
                                      checked={item.id !== undefined && selectedIds.has(item.id)}
                                      onChange={() =>
                                        item.id !== undefined && toggleSelect(item.id)
                                      }
                                    />
                                  </td>
                                  <td className="text-xs font-medium">
                                    {
                                      BULAN_NAMES[
                                        item.bulan_prediksi
                                      ]?.slice(0, 3)
                                    }{" "}
                                    {item.tahun_prediksi}
                                  </td>
                                  <td>
                                    <span
                                      className="badge badge-sm font-mono font-semibold"
                                      style={{
                                        backgroundColor:
                                          (METHOD_COLORS[item.metode] ||
                                            "#6366f1") + "20",
                                        color:
                                          METHOD_COLORS[item.metode] ||
                                          "#6366f1",
                                        borderColor:
                                          (METHOD_COLORS[item.metode] ||
                                            "#6366f1") + "40",
                                      }}
                                    >
                                      {item.metode}
                                    </span>
                                  </td>
                                  <td className="text-xs text-base-content/70">
                                    {item.jenis_kendaraan_nama || (
                                      <span className="text-base-content/40 italic">
                                        Semua
                                      </span>
                                    )}
                                  </td>
                                  <td className="text-right font-mono text-xs font-semibold">
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
                                            (item.nilai_aktual ??
                                              0) as any
                                          )
                                        )
                                      : (
                                        <span className="text-base-content/30">
                                          -
                                        </span>
                                      )}
                                  </td>
                                  <td className="text-right font-mono text-xs font-semibold">
                                    {mapeVal > 0
                                      ? `${formatNumber(mapeVal)}%`
                                      : (
                                        <span className="text-base-content/30">
                                          -
                                        </span>
                                      )}
                                  </td>
                                  <td className="text-center">
                                    {mapeVal > 0 ? (
                                      <span
                                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${category.color}`}
                                      >
                                        <CategoryIcon className="w-3 h-3" />
                                        {category.label}
                                      </span>
                                    ) : (
                                      <span className="text-base-content/30 text-[10px]">
                                        -
                                      </span>
                                    )}
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
                                    <div className="flex items-center justify-center gap-0.5">
                                      <button
                                        className="btn btn-xs btn-ghost btn-square"
                                        onClick={() =>
                                          setExpandedRow(
                                            isExpanded
                                              ? null
                                              : item.id!
                                          )
                                        }
                                        title="Detail"
                                      >
                                        {isExpanded ? (
                                          <EyeOff className="w-3.5 h-3.5" />
                                        ) : (
                                          <Eye className="w-3.5 h-3.5" />
                                        )}
                                      </button>
                                      <button
                                        className="btn btn-xs btn-ghost btn-square text-error"
                                        onClick={() =>
                                          item.id !== undefined && handleDeleteClick(item.id)
                                        }
                                        title="Hapus"
                                        disabled={item.id === undefined}
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>

                                {/* Expanded Detail Row */}
                                {isExpanded && (
                                  <tr
                                    key={`detail-${item.id}`}
                                    className="bg-base-200/10"
                                  >
                                    <td colSpan={10}>
                                      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {/* Prediction Info */}
                                        <div className="space-y-2">
                                          <p className="text-xs font-semibold text-base-content/80 mb-2">
                                            📊 Detail Prediksi
                                          </p>
                                          <div className="flex justify-between text-xs">
                                            <span className="text-base-content/60">
                                              Nilai Prediksi
                                            </span>
                                            <span className="font-mono font-semibold">
                                              {formatRupiahFull(
                                                parseFloat(
                                                  (item.nilai_prediksi ??
                                                    0) as any
                                                )
                                              )}
                                            </span>
                                          </div>
                                          {item.nilai_aktual && (
                                            <div className="flex justify-between text-xs">
                                              <span className="text-base-content/60">
                                                Nilai Aktual
                                              </span>
                                              <span className="font-mono font-semibold">
                                                {formatRupiahFull(
                                                  parseFloat(
                                                    (item.nilai_aktual ??
                                                      0) as any
                                                  )
                                                )}
                                              </span>
                                            </div>
                                          )}
                                          <div className="flex justify-between text-xs">
                                            <span className="text-base-content/60">
                                              Periode
                                            </span>
                                            <span className="font-semibold">
                                              {
                                                BULAN_NAMES[
                                                  item.bulan_prediksi
                                                ]
                                              }{" "}
                                              {item.tahun_prediksi}
                                            </span>
                                          </div>
                                          <div className="flex justify-between text-xs">
                                            <span className="text-base-content/60">
                                              Tanggal Prediksi
                                            </span>
                                            <span className="font-mono text-[10px]">
                                              {item.tanggal_prediksi
                                                ? new Date(
                                                    item.tanggal_prediksi
                                                  ).toLocaleString("id-ID")
                                                : "-"}
                                            </span>
                                          </div>
                                        </div>

                                        {/* Error Metrics */}
                                        <div className="space-y-2">
                                          <p className="text-xs font-semibold text-base-content/80 mb-2">
                                            📈 Metrik Evaluasi
                                          </p>
                                          <div className="flex justify-between text-xs">
                                            <span className="text-base-content/60">
                                              MAPE
                                            </span>
                                            <span className="font-mono font-semibold">
                                              {formatNumber(mapeVal)}%
                                            </span>
                                          </div>
                                          <div className="flex justify-between text-xs">
                                            <span className="text-base-content/60">
                                              MAE
                                            </span>
                                            <span className="font-mono font-semibold">
                                              {formatRupiah(
                                                parseFloat(
                                                  (item.mae ?? 0) as any
                                                )
                                              )}
                                            </span>
                                          </div>
                                          <div className="flex justify-between text-xs">
                                            <span className="text-base-content/60">
                                              RMSE
                                            </span>
                                            <span className="font-mono font-semibold">
                                              {formatRupiah(
                                                parseFloat(
                                                  (item.rmse ?? 0) as any
                                                )
                                              )}
                                            </span>
                                          </div>
                                          <div className="flex justify-between text-xs">
                                            <span className="text-base-content/60">
                                              Akurasi
                                            </span>
                                            <span className="font-mono font-semibold text-success">
                                              {formatNumber(
                                                100 - mapeVal
                                              )}
                                              %
                                            </span>
                                          </div>
                                        </div>

                                        {/* Parameters */}
                                        <div className="space-y-2">
                                          <p className="text-xs font-semibold text-base-content/80 mb-2">
                                            ⚙️ Parameter
                                          </p>
                                          {item.alpha !== undefined &&
                                            item.alpha !== null && (
                                              <div className="flex justify-between text-xs">
                                                <span className="text-base-content/60">
                                                  Alpha (α)
                                                </span>
                                                <span className="font-mono font-semibold">
                                                  {parseFloat(
                                                    (item.alpha ??
                                                      0) as any
                                                  ).toFixed(4)}
                                                </span>
                                              </div>
                                            )}
                                          {item.beta !== undefined &&
                                            item.beta !== null && (
                                              <div className="flex justify-between text-xs">
                                                <span className="text-base-content/60">
                                                  Beta (β)
                                                </span>
                                                <span className="font-mono font-semibold">
                                                  {parseFloat(
                                                    (item.beta ??
                                                      0) as any
                                                  ).toFixed(4)}
                                                </span>
                                              </div>
                                            )}
                                          {item.gamma !== undefined &&
                                            item.gamma !== null && (
                                              <div className="flex justify-between text-xs">
                                                <span className="text-base-content/60">
                                                  Gamma (γ)
                                                </span>
                                                <span className="font-mono font-semibold">
                                                  {parseFloat(
                                                    (item.gamma ??
                                                      0) as any
                                                  ).toFixed(4)}
                                                </span>
                                              </div>
                                            )}
                                          <div className="flex justify-between text-xs">
                                            <span className="text-base-content/60">
                                              Data Training
                                            </span>
                                            <span className="font-mono text-[10px]">
                                              {item.jumlah_data_training}{" "}
                                              periode
                                            </span>
                                          </div>
                                          <div className="flex justify-between text-xs">
                                            <span className="text-base-content/60">
                                              Rentang Training
                                            </span>
                                            <span className="font-mono text-[10px]">
                                              {item.data_training_dari} s/d{" "}
                                              {item.data_training_sampai}
                                            </span>
                                          </div>
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
                        Menampilkan{" "}
                        <span className="font-semibold">
                          {(page - 1) * pageSize + 1}
                        </span>
                        -
                        <span className="font-semibold">
                          {Math.min(page * pageSize, totalCount)}
                        </span>{" "}
                        dari{" "}
                        <span className="font-semibold">{totalCount}</span>{" "}
                        data
                      </p>
                      <div className="flex items-center gap-1">
                        <button
                          className="btn btn-xs btn-ghost btn-square"
                          onClick={() => fetchData(1)}
                          disabled={page <= 1}
                          title="Halaman pertama"
                        >
                          <ChevronsLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          className="btn btn-xs btn-ghost btn-square"
                          onClick={() => fetchData(page - 1)}
                          disabled={page <= 1}
                          title="Sebelumnya"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>

                        {/* Page numbers */}
                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
                            let pageNum: number;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (page <= 3) {
                              pageNum = i + 1;
                            } else if (page >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = page - 2 + i;
                            }
                            return (
                              <button
                                key={`page-${pageNum}-${i}`}
                                className={`btn btn-xs btn-square ${
                                  pageNum === page
                                    ? "btn-primary"
                                    : "btn-ghost"
                                }`}
                                onClick={() => fetchData(pageNum)}
                              >
                                {pageNum}
                              </button>
                            );
                          }
                        )}

                        <button
                          className="btn btn-xs btn-ghost btn-square"
                          onClick={() => fetchData(page + 1)}
                          disabled={page >= totalPages}
                          title="Selanjutnya"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          className="btn btn-xs btn-ghost btn-square"
                          onClick={() => fetchData(totalPages)}
                          disabled={page >= totalPages}
                          title="Halaman terakhir"
                        >
                          <ChevronsRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ModalConfirm
        isOpen={deleteModal.isOpen}
        title={
          deleteModal.isMultiple
            ? "Hapus Beberapa Prediksi"
            : "Hapus Hasil Prediksi"
        }
        message={
          deleteModal.isMultiple
            ? `Yakin ingin menghapus ${deleteModal.count || 0} hasil prediksi yang dipilih?`
            : "Yakin ingin menghapus hasil prediksi ini?"
        }
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        isLoading={isDeleting}
      />
    </AdminRoute>
  );
}
