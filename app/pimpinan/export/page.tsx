/** @format */

"use client";

import { useState } from "react";
import PimpinanRoute from "@/components/PimpinanRoute";
import SidebarPimpinan from "@/components/SidebarPimpinan";
import Header from "@/components/Header";
import { Card, Button } from "@/components/ui";
import { Download, FileBarChart, Loader2, Target, FileText, FileSpreadsheet } from "lucide-react";
import { toast } from "@/services";
import { agregatService } from "@/services/agregatService";
import { prediksiService, type PredictionResult } from "@/services/prediksiService";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const BULAN_NAMES = [
  "", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const formatRupiahNum = (val: number): string =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);

const downloadCSV = (filename: string, csvContent: string) => {
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

// ========== Fetch helpers ==========

const fetchPendapatanData = async () => {
  const response = await agregatService.getList({ page_size: 10000 });
  return response.data || [];
};

const fetchPrediksiData = async (): Promise<PredictionResult[]> => {
  const result = await prediksiService.getList({ page: 1, page_size: 10000 });
  return result.data || [];
};

// ========== CSV builders ==========

const buildPendapatanCSV = (data: any[]): string => {
  const headers = ["Periode", "Tahun", "Bulan", "PKB Pokok", "PKB Denda", "SWDKLLJ", "BBNKB", "Total Pendapatan", "Jumlah Transaksi", "Jumlah Kendaraan"];
  const rows = data.map((item: any) => [
    `${BULAN_NAMES[item.bulan]} ${item.tahun}`, item.tahun, item.bulan,
    Number(item.total_pokok_pkb) || 0, Number(item.total_denda_pkb) || 0,
    Number(item.total_swdkllj) || 0, Number(item.total_bbnkb) || 0,
    Number(item.total_pendapatan) || 0, item.jumlah_transaksi || 0, item.jumlah_kendaraan || 0,
  ]);
  rows.push([
    "TOTAL", "", "",
    data.reduce((s: number, i: any) => s + (Number(i.total_pokok_pkb) || 0), 0),
    data.reduce((s: number, i: any) => s + (Number(i.total_denda_pkb) || 0), 0),
    data.reduce((s: number, i: any) => s + (Number(i.total_swdkllj) || 0), 0),
    data.reduce((s: number, i: any) => s + (Number(i.total_bbnkb) || 0), 0),
    data.reduce((s: number, i: any) => s + (Number(i.total_pendapatan) || 0), 0),
    data.reduce((s: number, i: any) => s + (i.jumlah_transaksi || 0), 0),
    data.reduce((s: number, i: any) => s + (i.jumlah_kendaraan || 0), 0),
  ]);
  return [headers.join(","), ...rows.map((r: any[]) => r.join(","))].join("\n");
};

const buildPrediksiCSV = (data: PredictionResult[]): string => {
  const headers = ["Periode", "Metode", "Jenis Kendaraan", "Nilai Prediksi", "Nilai Aktual", "MAPE (%)", "MAE", "RMSE", "Alpha", "Beta", "Gamma", "Akurasi (%)"];
  const rows = data.map((item) => {
    const mapeVal = Number(item.mape) || 0;
    return [
      `${BULAN_NAMES[item.bulan_prediksi]} ${item.tahun_prediksi}`, item.metode,
      item.jenis_kendaraan_nama || "Semua", Number(item.nilai_prediksi) || 0,
      item.nilai_aktual ? Number(item.nilai_aktual) : "", mapeVal || "",
      item.mae ? Number(item.mae) : "", item.rmse ? Number(item.rmse) : "",
      item.alpha !== undefined ? Number(item.alpha) : "", item.beta !== undefined ? Number(item.beta) : "",
      item.gamma !== undefined ? Number(item.gamma) : "", mapeVal > 0 ? (100 - mapeVal).toFixed(2) : "",
    ];
  });
  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
};

// ========== PDF builders ==========

const buildPendapatanPDF = (data: any[]) => {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  // Title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Laporan Pendapatan Pajak Kendaraan Bermotor", 148, 15, { align: "center" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Dicetak: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`, 148, 22, { align: "center" });

  const headers = [["Periode", "PKB Pokok", "PKB Denda", "SWDKLLJ", "BBNKB", "Total Pendapatan", "Transaksi", "Kendaraan"]];
  const rows = data.map((item: any) => [
    `${BULAN_NAMES[item.bulan]} ${item.tahun}`,
    formatRupiahNum(Number(item.total_pokok_pkb) || 0),
    formatRupiahNum(Number(item.total_denda_pkb) || 0),
    formatRupiahNum(Number(item.total_swdkllj) || 0),
    formatRupiahNum(Number(item.total_bbnkb) || 0),
    formatRupiahNum(Number(item.total_pendapatan) || 0),
    (item.jumlah_transaksi || 0).toLocaleString("id-ID"),
    (item.jumlah_kendaraan || 0).toLocaleString("id-ID"),
  ]);

  // Total row
  rows.push([
    "TOTAL",
    formatRupiahNum(data.reduce((s: number, i: any) => s + (Number(i.total_pokok_pkb) || 0), 0)),
    formatRupiahNum(data.reduce((s: number, i: any) => s + (Number(i.total_denda_pkb) || 0), 0)),
    formatRupiahNum(data.reduce((s: number, i: any) => s + (Number(i.total_swdkllj) || 0), 0)),
    formatRupiahNum(data.reduce((s: number, i: any) => s + (Number(i.total_bbnkb) || 0), 0)),
    formatRupiahNum(data.reduce((s: number, i: any) => s + (Number(i.total_pendapatan) || 0), 0)),
    data.reduce((s: number, i: any) => s + (i.jumlah_transaksi || 0), 0).toLocaleString("id-ID"),
    data.reduce((s: number, i: any) => s + (i.jumlah_kendaraan || 0), 0).toLocaleString("id-ID"),
  ]);

  autoTable(doc, {
    head: headers,
    body: rows,
    startY: 28,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: "bold" },
    footStyles: { fillColor: [243, 244, 246], textColor: 0, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    // Make last row bold (total)
    didParseCell: (data: any) => {
      if (data.row.index === rows.length - 1 && data.section === "body") {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.fillColor = [229, 231, 235];
      }
    },
  });

  doc.save("laporan_pendapatan.pdf");
};

const buildPrediksiPDF = (data: PredictionResult[]) => {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Laporan Hasil Prediksi Pendapatan", 148, 15, { align: "center" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Dicetak: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`, 148, 22, { align: "center" });

  const headers = [["Periode", "Metode", "Jenis", "Nilai Prediksi", "Nilai Aktual", "MAPE (%)", "MAE", "RMSE", "Akurasi (%)"]];
  const rows = data.map((item) => [
    `${BULAN_NAMES[item.bulan_prediksi]?.slice(0, 3)} ${item.tahun_prediksi}`,
    item.metode,
    item.jenis_kendaraan_nama || "Semua",
    formatRupiahNum(Number(item.nilai_prediksi) || 0),
    item.nilai_aktual ? formatRupiahNum(Number(item.nilai_aktual)) : "-",
    Number(item.mape) ? Number(item.mape).toFixed(2) + "%" : "-",
    item.mae ? formatRupiahNum(Number(item.mae)) : "-",
    item.rmse ? formatRupiahNum(Number(item.rmse)) : "-",
    Number(item.mape) ? (100 - Number(item.mape)).toFixed(2) + "%" : "-",
  ]);

  autoTable(doc, {
    head: headers,
    body: rows,
    startY: 28,
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [139, 92, 246], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 18 },
      2: { cellWidth: 30 },
    },
  });

  doc.save("hasil_prediksi.pdf");
};

// ========== Component ==========

export default function ExportPage() {
  const [loadingType, setLoadingType] = useState<string | null>(null);

  const handleExport = async (dataType: "pendapatan" | "prediksi", format: "csv" | "pdf") => {
    const key = `${dataType}-${format}`;
    try {
      setLoadingType(key);

      if (dataType === "pendapatan") {
        const data = await fetchPendapatanData();
        if (data.length === 0) { toast.error("Tidak ada data pendapatan"); return; }
        if (format === "csv") {
          downloadCSV("laporan_pendapatan.csv", buildPendapatanCSV(data));
        } else {
          buildPendapatanPDF(data);
        }
        toast.success(`Laporan pendapatan (${format.toUpperCase()}) berhasil di-download! (${data.length} baris)`);
      } else {
        const data = await fetchPrediksiData();
        if (data.length === 0) { toast.error("Tidak ada data prediksi"); return; }
        if (format === "csv") {
          downloadCSV("hasil_prediksi.csv", buildPrediksiCSV(data));
        } else {
          buildPrediksiPDF(data);
        }
        toast.success(`Hasil prediksi (${format.toUpperCase()}) berhasil di-download! (${data.length} baris)`);
      }
    } catch (error) {
      toast.error(`Gagal mengexport data ${dataType}`);
    } finally {
      setLoadingType(null);
    }
  };

  const exportCards = [
    {
      key: "pendapatan",
      title: "Laporan Pendapatan",
      description: "Data agregat pendapatan PKB, SWDKLLJ, BBNKB per periode",
      icon: FileBarChart,
      iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
      iconColor: "text-emerald-600",
      columns: ["Periode", "PKB Pokok", "PKB Denda", "SWDKLLJ", "BBNKB", "Total Pendapatan", "Transaksi", "Kendaraan"],
    },
    {
      key: "prediksi",
      title: "Hasil Prediksi",
      description: "Data prediksi SES, DES, TES, Hybrid beserta metrik evaluasi",
      icon: Target,
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
      iconColor: "text-purple-600",
      columns: ["Periode", "Metode", "Jenis Kendaraan", "Nilai Prediksi", "MAPE", "MAE", "RMSE", "Akurasi"],
    },
  ];

  return (
    <PimpinanRoute>
      <div className="min-h-screen bg-base-200 flex overflow-x-hidden">
        <SidebarPimpinan />

        <div className="flex-1 lg:ml-64 overflow-x-hidden">
          <Header
            variant="admin"
            title="Export Data"
            subtitle="Ekspor data untuk keperluan rapat dan presentasi"
            showThemeSwitcher={true}
          />

          <div className="p-4 lg:p-8">
            {/* Info */}
            <div className="alert alert-info mb-6">
              <span>Sebagai Kepala UPPD/SAMSAT, Anda dapat mengekspor data dalam format CSV (untuk Excel) dan PDF (untuk cetak/presentasi).</span>
            </div>

            {/* Export Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {exportCards.map((card) => {
                const Icon = card.icon;
                const csvKey = `${card.key}-csv`;
                const pdfKey = `${card.key}-pdf`;

                return (
                  <Card key={card.key} className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-12 h-12 ${card.iconBg} rounded-xl flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${card.iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{card.title}</h3>
                        <p className="text-sm text-base-content/70">{card.description}</p>
                      </div>
                    </div>

                    {/* Columns preview */}
                    <div className="bg-base-200/50 rounded-lg p-3 mb-4">
                      <p className="text-[10px] text-base-content/50 uppercase tracking-wider mb-2">Kolom yang disertakan:</p>
                      <div className="flex flex-wrap gap-1">
                        {card.columns.map((col) => (
                          <span key={col} className="badge badge-xs badge-ghost">{col}</span>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        loading={loadingType === csvKey}
                        leftIcon={loadingType === csvKey ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
                        onClick={() => handleExport(card.key as "pendapatan" | "prediksi", "csv")}
                        disabled={loadingType !== null}
                      >
                        {loadingType === csvKey ? "Mengunduh..." : "CSV"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        loading={loadingType === pdfKey}
                        leftIcon={loadingType === pdfKey ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                        onClick={() => handleExport(card.key as "pendapatan" | "prediksi", "pdf")}
                        disabled={loadingType !== null}
                      >
                        {loadingType === pdfKey ? "Mengunduh..." : "PDF"}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Export Semua */}
            <Card className="mt-6 p-6 bg-gradient-to-r from-primary/5 to-secondary/5">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-lg mb-1">Export Semua Data</h3>
                  <p className="text-sm text-base-content/70">Download semua laporan pendapatan dan hasil prediksi sekaligus</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="lg"
                    leftIcon={loadingType === "semua-csv" ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileSpreadsheet className="w-5 h-5" />}
                    onClick={async () => {
                      setLoadingType("semua-csv");
                      try {
                        await handleExport("pendapatan", "csv");
                        await handleExport("prediksi", "csv");
                      } finally { setLoadingType(null); }
                    }}
                    loading={loadingType === "semua-csv"}
                    disabled={loadingType !== null}
                  >
                    Semua CSV
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    leftIcon={loadingType === "semua-pdf" ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                    onClick={async () => {
                      setLoadingType("semua-pdf");
                      try {
                        await handleExport("pendapatan", "pdf");
                        await handleExport("prediksi", "pdf");
                      } finally { setLoadingType(null); }
                    }}
                    loading={loadingType === "semua-pdf"}
                    disabled={loadingType !== null}
                  >
                    Semua PDF
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PimpinanRoute>
  );
}
