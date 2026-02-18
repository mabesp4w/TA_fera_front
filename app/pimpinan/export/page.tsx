/** @format */

"use client";

import PimpinanRoute from "@/components/PimpinanRoute";
import SidebarPimpinan from "@/components/SidebarPimpinan";
import Header from "@/components/Header";
import { Card, Button } from "@/components/ui";
import { Download, FileSpreadsheet, FileText, FileJson, Database, FileBarChart } from "lucide-react";
import { toast } from "@/services";

export default function ExportPage() {
  const handleExport = (type: string, format: string) => {
    toast.success(`Mempersiapkan export ${type} dalam format ${format}...`);
    // Implementasi export sesungguhnya akan ditambahkan di sini
  };

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
              <span>Sebagai Kepala UPPD/SAMSAT, Anda dapat mengekspor data dalam berbagai format untuk keperluan rapat, presentasi, atau dokumentasi.</span>
            </div>

            {/* Export Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Laporan Pendapatan */}
              <Card className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                    <FileBarChart className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Laporan Pendapatan</h3>
                    <p className="text-sm text-base-content/70">Data agregat pendapatan per periode</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start" leftIcon={<FileSpreadsheet className="w-4 h-4" />} onClick={() => handleExport("Pendapatan", "Excel")}>
                    Download Excel (.xlsx)
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start" leftIcon={<FileText className="w-4 h-4" />} onClick={() => handleExport("Pendapatan", "PDF")}>
                    Download PDF (.pdf)
                  </Button>
                </div>
              </Card>

              {/* Hasil Prediksi */}
              <Card className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                    <FileBarChart className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Hasil Prediksi</h3>
                    <p className="text-sm text-base-content/70">Data prediksi dan evaluasi akurasi</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start" leftIcon={<FileSpreadsheet className="w-4 h-4" />} onClick={() => handleExport("Prediksi", "Excel")}>
                    Download Excel (.xlsx)
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start" leftIcon={<FileText className="w-4 h-4" />} onClick={() => handleExport("Prediksi", "PDF")}>
                    Download PDF (.pdf)
                  </Button>
                </div>
              </Card>

              {/* Data Kendaraan */}
              <Card className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                    <Database className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Data Kendaraan</h3>
                    <p className="text-sm text-base-content/70">Daftar kendaraan terdaftar</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start" leftIcon={<FileSpreadsheet className="w-4 h-4" />} onClick={() => handleExport("Kendaraan", "Excel")}>
                    Download Excel (.xlsx)
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start" leftIcon={<FileJson className="w-4 h-4" />} onClick={() => handleExport("Kendaraan", "JSON")}>
                    Download JSON (.json)
                  </Button>
                </div>
              </Card>

              {/* Data Master */}
              <Card className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                    <Database className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Data Master</h3>
                    <p className="text-sm text-base-content/70">Data referensi jenis, merek, wilayah</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start" leftIcon={<FileSpreadsheet className="w-4 h-4" />} onClick={() => handleExport("Master", "Excel")}>
                    Download Excel (.xlsx)
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start" leftIcon={<FileJson className="w-4 h-4" />} onClick={() => handleExport("Master", "JSON")}>
                    Download JSON (.json)
                  </Button>
                </div>
              </Card>
            </div>

            {/* Export Lengkap */}
            <Card className="mt-6 p-6 bg-gradient-to-r from-primary/5 to-secondary/5">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-lg mb-1">Export Lengkap</h3>
                  <p className="text-sm text-base-content/70">Download seluruh data sistem dalam satu file</p>
                </div>
                <Button variant="primary" size="lg" leftIcon={<Download className="w-5 h-5" />} onClick={() => handleExport("Lengkap", "ZIP")}>
                  Export Semua Data
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PimpinanRoute>
  );
}
