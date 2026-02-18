/** @format */

"use client";

import { useRouter } from "next/navigation";
import PimpinanRoute from "@/components/PimpinanRoute";
import SidebarPimpinan from "@/components/SidebarPimpinan";
import Header from "@/components/Header";
import { Card, Button } from "@/components/ui";
import { 
  FileBarChart, 
  BarChart3, 
  LineChart, 
  Download, 
  ArrowRight,
  FileText,
  Calendar,
  TrendingUp,
  ChevronRight,
} from "lucide-react";

interface LaporanMenuItem {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  path: string;
  features: string[];
}

const LAPORAN_MENU: LaporanMenuItem[] = [
  {
    title: "Laporan Pendapatan",
    description: "Laporan detail pendapatan pajak kendaraan bermotor per periode",
    icon: BarChart3,
    color: "primary",
    path: "/pimpinan/laporan/pendapatan",
    features: ["Periode bulanan", "Per jenis kendaraan", "Grafik trend"],
  },
  {
    title: "Laporan Prediksi",
    description: "Laporan hasil prediksi dan akurasi metode untuk evaluasi",
    icon: LineChart,
    color: "secondary",
    path: "/pimpinan/laporan/prediksi",
    features: ["Perbandingan metode", "Metrik akurasi", "Rekomendasi"],
  },
  {
    title: "Export Data",
    description: "Export data dalam format Excel, PDF, atau CSV untuk keperluan administrasi",
    icon: Download,
    color: "accent",
    path: "/pimpinan/export",
    features: ["Excel", "PDF", "CSV"],
  },
];

export default function LaporanDashboardPage() {
  const router = useRouter();

  return (
    <PimpinanRoute>
      <div className="min-h-screen bg-base-200 flex overflow-x-hidden">
        <SidebarPimpinan />

        <div className="flex-1 lg:ml-64 overflow-x-hidden">
          <Header
            variant="admin"
            title="Laporan & Export"
            subtitle="Laporan pendapatan, prediksi, dan export data"
            showThemeSwitcher={true}
          />

          <div className="p-4 lg:p-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 mb-6">
              <span className="text-sm text-base-content/60">Dashboard Pimpinan</span>
              <ChevronRight className="w-4 h-4 text-base-content/30" />
              <span className="text-sm font-medium">Laporan</span>
            </div>

            {/* Welcome */}
            <div className="mb-8 p-6 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-2xl border border-primary/20">
              <div className="flex flex-col md:flex-row items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                  <FileBarChart className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-2">Laporan & Export Data</h2>
                  <p className="text-sm text-base-content/70 max-w-3xl">
                    Akses berbagai laporan analisis dan export data untuk keperluan administrasi dan pengambilan keputusan. 
                    Laporan tersedia dalam format yang dapat diunduh untuk presentasi atau arsip.
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
              {LAPORAN_MENU.map((item) => (
                <div 
                  key={item.title}
                  className={`p-6 hover:shadow-xl transition-all cursor-pointer group border-l-4 border-${item.color} bg-base-100 rounded-xl border border-base-200`}
                  onClick={() => router.push(item.path)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 bg-${item.color}/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <item.icon className={`w-6 h-6 text-${item.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                      <p className="text-sm text-base-content/70 mb-3">{item.description}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {item.features.map((feature) => (
                          <span key={feature} className="badge badge-xs badge-ghost">
                            {feature}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center text-sm text-primary font-medium">
                        Buka <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 bg-info/5 border-info/20">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-5 h-5 text-info" />
                  <h4 className="font-semibold">Laporan Berkala</h4>
                </div>
                <p className="text-xs text-base-content/70">
                  Laporan dapat dihasilkan untuk periode bulanan, triwulan, atau tahunan sesuai kebutuhan.
                </p>
              </Card>

              <Card className="p-4 bg-warning/5 border-warning/20">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-warning" />
                  <h4 className="font-semibold">Analisis Visual</h4>
                </div>
                <p className="text-xs text-base-content/70">
                  Setiap laporan dilengkapi dengan grafik dan visualisasi data untuk analisis yang lebih mudah.
                </p>
              </Card>

              <Card className="p-4 bg-success/5 border-success/20">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-5 h-5 text-success" />
                  <h4 className="font-semibold">Export Multi-Format</h4>
                </div>
                <p className="text-xs text-base-content/70">
                  Data dapat diekspor dalam format Excel, PDF, atau CSV untuk berbagai keperluan.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </PimpinanRoute>
  );
}
