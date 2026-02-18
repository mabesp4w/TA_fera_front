/** @format */

"use client";

import { useRouter } from "next/navigation";
import PimpinanRoute from "@/components/PimpinanRoute";
import SidebarPimpinan from "@/components/SidebarPimpinan";
import Header from "@/components/Header";
import { Card, Button } from "@/components/ui";
import { FileText, Download, Printer, TrendingUp, ArrowRight, Target } from "lucide-react";

export default function LaporanPrediksiPage() {
  const router = useRouter();

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

          <div className="p-4 lg:p-8">
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-6 hover:shadow-lg transition-shadow cursor-pointer bg-base-100 rounded-xl border border-base-200" onClick={() => router.push('/pimpinan/hasil-prediksi')}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Hasil Prediksi</h3>
                    <p className="text-sm text-base-content/70">Lihat dan analisis semua hasil prediksi</p>
                    <ArrowRight className="w-4 h-4 mt-2 text-primary" />
                  </div>
                </div>
              </div>

              <div className="p-6 hover:shadow-lg transition-shadow cursor-pointer bg-base-100 rounded-xl border border-base-200" onClick={() => router.push('/pimpinan/hybrid')}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Prediksi Hybrid</h3>
                    <p className="text-sm text-base-content/70">Buat prediksi dengan metode hybrid</p>
                    <ArrowRight className="w-4 h-4 mt-2 text-secondary" />
                  </div>
                </div>
              </div>

              <div className="p-6 hover:shadow-lg transition-shadow cursor-pointer bg-base-100 rounded-xl border border-base-200" onClick={() => router.push('/pimpinan/evaluasi')}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Evaluasi Metode</h3>
                    <p className="text-sm text-base-content/70">Bandingkan performa metode prediksi</p>
                    <ArrowRight className="w-4 h-4 mt-2 text-accent" />
                  </div>
                </div>
              </div>
            </div>

            {/* Coming Soon */}
            <Card className="p-12 text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Laporan Prediksi Lengkap</h2>
              <p className="text-base-content/70 mb-6 max-w-md mx-auto">
                Fitur laporan prediksi komprehensif dengan grafik perbandingan, analisis akurasi, dan rekomendasi strategis sedang dalam pengembangan.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline" leftIcon={<Printer className="w-4 h-4" />}>
                  Cetak Laporan
                </Button>
                <Button variant="primary" leftIcon={<Download className="w-4 h-4" />}>
                  Export PDF
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PimpinanRoute>
  );
}
