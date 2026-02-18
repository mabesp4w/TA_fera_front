/** @format */

"use client";

import { useEffect, useState, useCallback } from "react";
import PimpinanRoute from "@/components/PimpinanRoute";
import SidebarPimpinan from "@/components/SidebarPimpinan";
import Header from "@/components/Header";
import { Card, Button } from "@/components/ui";
import { agregatService, AgregatPendapatan } from "@/services/agregatService";
import { jenisKendaraanService } from "@/services/jenisKendaraanService";
import type { SelectOption } from "@/components/ui/types";
import { toast } from "@/services";
import { FileText, Download, Printer, Calendar, TrendingUp, Wallet, ArrowRight } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from "recharts";

const formatRupiah = (val: number | string | undefined | null): string => {
  if (val === undefined || val === null || isNaN(Number(val))) return "Rp -";
  const num = Number(val);
  if (num >= 1_000_000_000) return `Rp ${(num / 1_000_000_000).toFixed(1)}M`;
  if (num >= 1_000_000) return `Rp ${(num / 1_000_000).toFixed(1)}Jt`;
  if (num >= 1_000) return `Rp ${(num / 1_000).toFixed(0)}Rb`;
  return `Rp ${num}`;
};

const formatRupiahFull = (val: number | string | undefined | null): string => {
  if (val === undefined || val === null || isNaN(Number(val))) return "Rp -";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(val));
};

const BULAN_NAMES = ["", "Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];

export default function LaporanPendapatanPage() {
  const [data, setData] = useState<AgregatPendapatan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tahunOptions, setTahunOptions] = useState<SelectOption[]>([]);
  const [jenisOptions, setJenisOptions] = useState<SelectOption[]>([]);
  const [selectedTahun, setSelectedTahun] = useState<string>("");
  const [selectedJenis, setSelectedJenis] = useState<string>("");

  const fetchFilterOptions = async () => {
    try {
      const [filterOptions, jenisResponse] = await Promise.all([
        agregatService.getFilterOptions(),
        jenisKendaraanService.getList({ page_size: 1000 }),
      ]);
      setTahunOptions(filterOptions.tahun_options.map((opt) => ({ value: opt.value.toString(), label: opt.label })));
      setJenisOptions((jenisResponse.data || []).map((item) => ({ value: item.id.toString(), label: item.nama })));
    } catch (error) {
      console.error("Failed to fetch filter options:", error);
    }
  };

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await agregatService.getList({
        page_size: 1000,
        tahun: selectedTahun ? parseInt(selectedTahun) : undefined,
        jenis_kendaraan_id: selectedJenis ? parseInt(selectedJenis) : undefined,
      });
      setData(response?.data || []);
    } catch (error: any) {
      toast.error(error?.message || "Gagal memuat data");
    } finally {
      setIsLoading(false);
    }
  }, [selectedTahun, selectedJenis]);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Chart data
  const chartData = data.map(item => ({
    periode: `${BULAN_NAMES[item.bulan] || item.bulan} ${item.tahun}`,
    pokok_pkb: Number(item.total_pokok_pkb) || 0,
    denda_pkb: Number(item.total_denda_pkb) || 0,
    swdkllj: Number(item.total_swdkllj) || 0,
    bbnkb: Number(item.total_bbnkb) || 0,
    total_pendapatan: Number(item.total_pendapatan) || 0,
  }));

  // Summary - parse to number and handle undefined/null
  const totalPendapatan = data.reduce((sum, item) => sum + (Number(item.total_pendapatan) || 0), 0);
  const totalPKB = data.reduce((sum, item) => sum + (Number(item.total_pokok_pkb) || 0) + (Number(item.total_denda_pkb) || 0), 0);
  const totalSWDKLLJ = data.reduce((sum, item) => sum + (Number(item.total_swdkllj) || 0), 0);
  const totalBBNKB = data.reduce((sum, item) => sum + (Number(item.total_bbnkb) || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    toast.success("Fitur export sedang dalam pengembangan");
  };

  return (
    <PimpinanRoute>
      <div className="min-h-screen bg-base-200 flex overflow-x-hidden">
        <SidebarPimpinan />

        <div className="flex-1 lg:ml-64 overflow-x-hidden">
          <Header
            variant="admin"
            title="Laporan Pendapatan"
            subtitle="Laporan komprehensif pendapatan pajak kendaraan bermotor"
            showThemeSwitcher={true}
          />

          <div className="p-4 lg:p-8">
            {/* Filter */}
            <Card className="mb-6">
              <div className="flex flex-col lg:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                  <label className="label"><span className="label-text text-xs font-medium">Tahun</span></label>
                  <select 
                    className="select select-bordered select-sm w-full" 
                    value={selectedTahun} 
                    onChange={(e) => setSelectedTahun(e.target.value)}
                  >
                    <option value="">Semua Tahun</option>
                    {tahunOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
                <div className="flex-1 w-full">
                  <label className="label"><span className="label-text text-xs font-medium">Jenis Kendaraan</span></label>
                  <select 
                    className="select select-bordered select-sm w-full" 
                    value={selectedJenis} 
                    onChange={(e) => setSelectedJenis(e.target.value)}
                  >
                    <option value="">Semua Jenis</option>
                    {jenisOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handlePrint} leftIcon={<Printer className="w-4 h-4" />}>
                    Cetak
                  </Button>
                  <Button variant="primary" size="sm" onClick={handleExport} leftIcon={<Download className="w-4 h-4" />}>
                    Export
                  </Button>
                </div>
              </div>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="p-4 border-l-4 border-primary">
                <p className="text-[10px] text-base-content/60 uppercase">Total Pendapatan</p>
                <p className="text-xl font-bold text-primary">{formatRupiah(totalPendapatan)}</p>
              </Card>
              <Card className="p-4 border-l-4 border-success">
                <p className="text-[10px] text-base-content/60 uppercase">Total PKB</p>
                <p className="text-xl font-bold text-success">{formatRupiah(totalPKB)}</p>
              </Card>
              <Card className="p-4 border-l-4 border-info">
                <p className="text-[10px] text-base-content/60 uppercase">Total SWDKLLJ</p>
                <p className="text-xl font-bold text-info">{formatRupiah(totalSWDKLLJ)}</p>
              </Card>
              <Card className="p-4 border-l-4 border-warning">
                <p className="text-[10px] text-base-content/60 uppercase">Total BBNKB</p>
                <p className="text-xl font-bold text-warning">{formatRupiah(totalBBNKB)}</p>
              </Card>
            </div>

            {/* Chart */}
            <Card className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold">Grafik Pendapatan per Periode</h3>
              </div>
              <div style={{ width: "100%", height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                    <XAxis dataKey="periode" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => formatRupiah(v)} width={80} />
                    <Tooltip formatter={(value: number | undefined) => formatRupiahFull(value || 0)} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="pokok_pkb" name="PKB Pokok" stackId="a" fill="#10b981" />
                    <Bar dataKey="denda_pkb" name="PKB Denda" stackId="a" fill="#34d399" />
                    <Bar dataKey="swdkllj" name="SWDKLLJ" stackId="a" fill="#3b82f6" />
                    <Bar dataKey="bbnkb" name="BBNKB" stackId="a" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Data Table */}
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold">Detail Laporan</h3>
                <span className="badge badge-sm badge-ghost">{data.length} periode</span>
              </div>
              <div className="overflow-x-auto">
                <table className="table table-sm w-full">
                  <thead>
                    <tr className="bg-base-200/50">
                      <th className="text-xs">Periode</th>
                      <th className="text-xs text-right">PKB Pokok</th>
                      <th className="text-xs text-right">PKB Denda</th>
                      <th className="text-xs text-right">SWDKLLJ</th>
                      <th className="text-xs text-right">BBNKB</th>
                      <th className="text-xs text-right font-bold">Grand Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item, index) => (
                      <tr key={index} className="hover:bg-base-200/30">
                        <td className="text-xs font-medium">{BULAN_NAMES[item.bulan]} {item.tahun}</td>
                        <td className="text-xs text-right font-mono">{formatRupiahFull(item.total_pokok_pkb)}</td>
                        <td className="text-xs text-right font-mono">{formatRupiahFull(item.total_denda_pkb)}</td>
                        <td className="text-xs text-right font-mono">{formatRupiahFull(item.total_swdkllj)}</td>
                        <td className="text-xs text-right font-mono">{formatRupiahFull(item.total_bbnkb)}</td>
                        <td className="text-xs text-right font-mono font-bold text-primary">{formatRupiahFull(item.total_pendapatan)}</td>
                      </tr>
                    ))}
                    {data.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-base-content/50">
                          Tidak ada data untuk ditampilkan
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className="bg-base-200/50 font-bold">
                    <tr>
                      <td className="text-xs">TOTAL</td>
                      <td className="text-xs text-right font-mono">{formatRupiahFull(data.reduce((s, i) => s + (Number(i.total_pokok_pkb) || 0), 0))}</td>
                      <td className="text-xs text-right font-mono">{formatRupiahFull(data.reduce((s, i) => s + (Number(i.total_denda_pkb) || 0), 0))}</td>
                      <td className="text-xs text-right font-mono">{formatRupiahFull(totalSWDKLLJ)}</td>
                      <td className="text-xs text-right font-mono">{formatRupiahFull(totalBBNKB)}</td>
                      <td className="text-xs text-right font-mono text-primary">{formatRupiahFull(totalPendapatan)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PimpinanRoute>
  );
}
