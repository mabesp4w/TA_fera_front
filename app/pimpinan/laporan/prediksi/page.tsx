/** @format */

"use client";

import { useEffect, useState, useCallback } from "react";
import PimpinanRoute from "@/components/PimpinanRoute";
import SidebarPimpinan from "@/components/SidebarPimpinan";
import Header from "@/components/Header";
import { Card, Button } from "@/components/ui";
import {
  prediksiService,
  BULAN_OPTIONS,
  METHOD_OPTIONS,
  type PredictionResult,
} from "@/services/prediksiService";
import { jenisKendaraanService } from "@/services/jenisKendaraanService";
import type { SelectOption } from "@/components/ui/types";
import { toast } from "@/services";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  FileText,
  Download,
  Filter,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  X,
  RefreshCw,
  Target,
} from "lucide-react";

const BULAN_NAMES = [
  "", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const formatRupiahFull = (val: number | string | null | undefined): string => {
  if (val === null || val === undefined || isNaN(Number(val))) return "Rp -";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(val));
};

const formatNumber = (val: number | string | null | undefined): string => {
  if (val === null || val === undefined || isNaN(Number(val))) return "-";
  return new Intl.NumberFormat("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(val));
};

const getMapeCategory = (mape: number) => {
  if (mape <= 10) return { label: "Sangat Akurat", color: "text-success bg-success/10 border-success/20", icon: CheckCircle2 };
  if (mape <= 20) return { label: "Akurat", color: "text-info bg-info/10 border-info/20", icon: CheckCircle2 };
  if (mape <= 30) return { label: "Cukup", color: "text-warning bg-warning/10 border-warning/20", icon: AlertTriangle };
  if (mape <= 50) return { label: "Kurang", color: "text-orange-500 bg-orange-500/10 border-orange-500/20", icon: AlertTriangle };
  return { label: "Buruk", color: "text-error bg-error/10 border-error/20", icon: XCircle };
};

const METHOD_COLORS: Record<string, string> = {
  SES: "#06b6d4",
  DES: "#f59e0b",
  TES: "#10b981",
  HYBRID: "#8b5cf6",
};

export default function LaporanPrediksiPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<PredictionResult[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [jenisKendaraanOptions, setJenisKendaraanOptions] = useState<SelectOption[]>([]);

  const [filterMetode, setFilterMetode] = useState<string>("");
  const [filterJenisKendaraan, setFilterJenisKendaraan] = useState<string>("");
  const [filterTahun, setFilterTahun] = useState<string>("");
  const [filterBulan, setFilterBulan] = useState<string>("");

  const fetchJenisKendaraan = useCallback(async () => {
    try {
      const response = await jenisKendaraanService.getList({ page_size: 1000 });
      setJenisKendaraanOptions(
        (response.data || []).map((item) => ({ value: item.id.toString(), label: item.nama }))
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

  useEffect(() => { fetchJenisKendaraan(); }, [fetchJenisKendaraan]);
  useEffect(() => { setPage(1); fetchData(1); }, [fetchData]);

  // Stats
  const stats = (() => {
    if (data.length === 0) return null;
    const mapes = data.map((d) => Number(d.mape) || 0).filter((v) => v > 0);
    const avgMape = mapes.length > 0 ? mapes.reduce((s, v) => s + v, 0) / mapes.length : 0;
    const bestMape = mapes.length > 0 ? Math.min(...mapes) : 0;
    return { avgMape, bestMape, count: totalCount };
  })();

  const handleExport = async () => {
    try {
      // Fetch all data for export
      const allParams: any = { page: 1, page_size: 10000 };
      if (filterMetode) allParams.metode = filterMetode;
      if (filterJenisKendaraan) allParams.jenis_kendaraan_id = parseInt(filterJenisKendaraan);
      if (filterTahun) allParams.tahun_prediksi = parseInt(filterTahun);
      if (filterBulan) allParams.bulan_prediksi = parseInt(filterBulan);

      const result = await prediksiService.getList(allParams);
      const exportData = result.data || [];

      if (exportData.length === 0) {
        toast.error("Tidak ada data untuk di-export");
        return;
      }

      const headers = [
        "Periode", "Metode", "Jenis Kendaraan", "Nilai Prediksi", "Nilai Aktual",
        "MAPE (%)", "MAE", "RMSE", "Alpha", "Beta", "Gamma", "Akurasi (%)"
      ];

      const rows = exportData.map((item) => {
        const mapeVal = Number(item.mape) || 0;
        return [
          `${BULAN_NAMES[item.bulan_prediksi]} ${item.tahun_prediksi}`,
          item.metode,
          item.jenis_kendaraan_nama || "Semua",
          Number(item.nilai_prediksi) || 0,
          item.nilai_aktual ? Number(item.nilai_aktual) : "",
          mapeVal || "",
          item.mae ? Number(item.mae) : "",
          item.rmse ? Number(item.rmse) : "",
          item.alpha !== undefined ? Number(item.alpha) : "",
          item.beta !== undefined ? Number(item.beta) : "",
          item.gamma !== undefined ? Number(item.gamma) : "",
          mapeVal > 0 ? (100 - mapeVal).toFixed(2) : "",
        ];
      });

      const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `laporan_prediksi${filterTahun ? `_${filterTahun}` : ""}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Data berhasil di-export CSV!");
    } catch (error) {
      toast.error("Gagal mengexport data");
    }
  };

  const handleExportPDF = async () => {
    try {
      const allParams: any = { page: 1, page_size: 10000 };
      if (filterMetode) allParams.metode = filterMetode;
      if (filterJenisKendaraan) allParams.jenis_kendaraan_id = parseInt(filterJenisKendaraan);
      if (filterTahun) allParams.tahun_prediksi = parseInt(filterTahun);
      if (filterBulan) allParams.bulan_prediksi = parseInt(filterBulan);

      const result = await prediksiService.getList(allParams);
      const exportData = result.data || [];

      if (exportData.length === 0) {
        toast.error("Tidak ada data untuk di-export");
        return;
      }

      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Laporan Hasil Prediksi Pendapatan", 148, 15, { align: "center" });
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const filterInfo = filterTahun ? `Tahun ${filterTahun}` : "Semua Tahun";
      doc.text(`${filterInfo} | Dicetak: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`, 148, 22, { align: "center" });

      const pdfHeaders = [["Periode", "Metode", "Jenis", "Nilai Prediksi", "Nilai Aktual", "MAPE (%)", "MAE", "RMSE", "Akurasi (%)"]];
      const fmtRupiah = (v: any) => {
        const num = Number(v);
        if (!num) return "-";
        return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num);
      };

      const pdfRows = exportData.map((item) => [
        `${BULAN_NAMES[item.bulan_prediksi]?.slice(0, 3)} ${item.tahun_prediksi}`,
        item.metode,
        item.jenis_kendaraan_nama || "Semua",
        fmtRupiah(item.nilai_prediksi),
        item.nilai_aktual ? fmtRupiah(item.nilai_aktual) : "-",
        Number(item.mape) ? Number(item.mape).toFixed(2) + "%" : "-",
        item.mae ? fmtRupiah(item.mae) : "-",
        item.rmse ? fmtRupiah(item.rmse) : "-",
        Number(item.mape) ? (100 - Number(item.mape)).toFixed(2) + "%" : "-",
      ]);

      autoTable(doc, {
        head: pdfHeaders,
        body: pdfRows,
        startY: 28,
        styles: { fontSize: 7, cellPadding: 2 },
        headStyles: { fillColor: [139, 92, 246], textColor: 255, fontStyle: "bold" },
        alternateRowStyles: { fillColor: [249, 250, 251] },
        columnStyles: { 0: { cellWidth: 22 }, 1: { cellWidth: 18 }, 2: { cellWidth: 28 } },
      });

      doc.save(`laporan_prediksi${filterTahun ? `_${filterTahun}` : ""}.pdf`);
      toast.success("Data berhasil di-export PDF!");
    } catch (error) {
      toast.error("Gagal mengexport data");
    }
  };

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
            title="Laporan Prediksi"
            subtitle="Laporan analisis dan hasil prediksi pendapatan"
            showThemeSwitcher={true}
          />

          <div className="p-4 lg:p-8 min-w-0">
            {/* Summary Stats */}
            {stats && (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                <Card className="p-4 border-l-4 border-primary">
                  <p className="text-[10px] text-base-content/60 uppercase tracking-wider mb-1">Total Prediksi</p>
                  <p className="text-2xl font-bold text-primary">{stats.count}</p>
                  <p className="text-[9px] text-base-content/40">hasil tersimpan</p>
                </Card>
                <Card className="p-4 border-l-4 border-info">
                  <p className="text-[10px] text-base-content/60 uppercase tracking-wider mb-1">Rata-rata MAPE</p>
                  <p className="text-2xl font-bold">{formatNumber(stats.avgMape)}%</p>
                  <p className="text-[9px] text-base-content/40">tingkat error</p>
                </Card>
                <Card className="p-4 border-l-4 border-success">
                  <p className="text-[10px] text-base-content/60 uppercase tracking-wider mb-1">MAPE Terbaik</p>
                  <p className="text-2xl font-bold text-success">{formatNumber(stats.bestMape)}%</p>
                  <p className="text-[9px] text-base-content/40">prediksi terakurat</p>
                </Card>
              </div>
            )}

            {/* Filters */}
            <Card className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold">Filter & Export</h3>
                {hasFilters && (
                  <button className="btn btn-xs btn-ghost text-error gap-1" onClick={resetFilters}>
                    <X className="w-3 h-3" /> Reset
                  </button>
                )}
                <div className="ml-auto flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleExport} leftIcon={<Download className="w-4 h-4" />}>
                    CSV
                  </Button>
                  <Button variant="primary" size="sm" onClick={handleExportPDF} leftIcon={<FileText className="w-4 h-4" />}>
                    PDF
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="label py-0"><span className="label-text text-[10px] font-medium">Metode</span></label>
                  <select className="select select-bordered select-sm w-full" value={filterMetode} onChange={(e) => setFilterMetode(e.target.value)}>
                    <option value="">Semua Metode</option>
                    {METHOD_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    <option value="HYBRID">HYBRID</option>
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
                    <Target className="w-4 h-4 text-primary" />
                    Hasil Prediksi
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
                    <p className="text-sm text-base-content/60">Tidak ada data ditemukan</p>
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
                          </tr>
                        </thead>
                        <tbody>
                          {data.map((item) => {
                            const mapeVal = Number(item.mape) || 0;
                            const category = mapeVal > 0 ? getMapeCategory(mapeVal) : null;
                            const CategoryIcon = category?.icon;

                            return (
                              <tr key={item.id || `${item.tahun_prediksi}-${item.bulan_prediksi}-${item.metode}`} className="hover:bg-base-200/30 transition-colors">
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
                                <td className="text-right font-mono text-xs font-semibold">{formatRupiahFull(Number(item.nilai_prediksi))}</td>
                                <td className="text-right font-mono text-xs">
                                  {item.nilai_aktual ? formatRupiahFull(Number(item.nilai_aktual)) : "-"}
                                </td>
                                <td className="text-right font-mono text-xs font-semibold">{mapeVal > 0 ? `${formatNumber(mapeVal)}%` : "-"}</td>
                                <td className="text-center">
                                  {category && CategoryIcon ? (
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${category.color}`}>
                                      <CategoryIcon className="w-3 h-3" />
                                      {category.label}
                                    </span>
                                  ) : "-"}
                                </td>
                              </tr>
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
                            <button key={`page-${pageNum}`} className={`btn btn-xs btn-square ${pageNum === page ? "btn-primary" : "btn-ghost"}`} onClick={() => fetchData(pageNum)}>
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
