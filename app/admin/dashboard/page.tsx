/** @format */

"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { dashboardService, type DashboardData } from "@/services/dashboardService";
import AdminRoute from "@/components/AdminRoute";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Card from "@/components/ui/Card";
import { Animated } from "@/components/ui";
import { 
  Car,
  Receipt,
  Wallet,
  TrendingUp,
  Activity,
  Calendar,
  BarChart3,
  FileText,
  MapPin,
  Database,
  ArrowUp,
  ArrowDown,
  Users,
  Calculator
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "@/services";
import { momentId } from "@/utils/momentIndonesia";
import { formatNumber, formatNumberWithLabel, formatCurrencyWithLabel } from "@/utils/formatNumber";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        const data = await dashboardService.getDashboard();
        setDashboardData(data);
      } catch (error: any) {
        toast.error(error?.message || "Gagal memuat data dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <AdminRoute>
      <div className="min-h-screen bg-base-200 flex overflow-x-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 lg:ml-64 overflow-x-hidden">
          {/* Header */}
          <Header
            variant="admin"
            title="Dashboard Admin"
            subtitle={`Selamat datang, ${user?.first_name || user?.username}`}
            showThemeSwitcher={true}
          />

          {/* Content */}
          <div className="p-4 lg:p-8">
            {/* Project Title */}
            <Animated animation="fade-down">
              <div className="mb-6 p-6 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-xl border border-primary/20 shadow-lg backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-2">
                  <Activity className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-bold text-primary">
                    PREDIKSI PENDAPATAN PAJAK KENDARAAN BERMOTOR DI UPPD/SAMSAT JAYAPURA
                  </h2>
                </div>
                <p className="text-sm text-base-content/70 ml-9">
                  MENGGUNAKAN METODE EXPONENTIAL SMOOTHING
                </p>
                <div className="mt-3 ml-9 flex items-center gap-2 text-xs text-base-content/60">
                  <Calendar className="w-4 h-4" />
                  <span>{momentId().format("dddd, DD MMMM YYYY")}</span>
                </div>
              </div>
            </Animated>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : dashboardData ? (
            <>
              {/* Statistik Cards - Main Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Pendapatan */}
                <Animated animation="fade-up" delay={100}>
                  <Card className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer border-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-emerald-100 text-sm mb-1 font-medium">Total Pendapatan</p>
                        {(() => {
                          const formatted = formatCurrencyWithLabel(dashboardData.pendapatan.total_all_time, true, 1_000_000);
                          return (
                            <>
                              <p className="text-2xl font-bold mb-1">
                                {formatted.value}
                              </p>
                              {formatted.label && (
                                <p className="text-emerald-200 text-xs mb-1">{formatted.label}</p>
                              )}
                              <p className="text-emerald-200 text-xs">Semua waktu</p>
                            </>
                          );
                        })()}
                      </div>
                      <div className="bg-emerald-400/30 p-4 rounded-xl backdrop-blur-sm">
                        <Wallet className="w-10 h-10" />
                      </div>
                    </div>
                  </Card>
                </Animated>

                {/* Pendapatan Bulan Ini */}
                <Animated animation="fade-up" delay={200}>
                  <Card className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer border-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm mb-1 font-medium">Pendapatan Bulan Ini</p>
                        {(() => {
                          const formatted = formatCurrencyWithLabel(dashboardData.pendapatan.bulan_ini, true, 1_000_000);
                          return (
                            <>
                              <p className="text-2xl font-bold mb-1">
                                {formatted.value}
                              </p>
                              {formatted.label && (
                                <p className="text-blue-200 text-xs mb-1">{formatted.label}</p>
                              )}
                              <div className="flex items-center gap-1 text-blue-200 text-xs">
                                {dashboardData.pendapatan.persentase_perubahan >= 0 ? (
                                  <ArrowUp className="w-3 h-3" />
                                ) : (
                                  <ArrowDown className="w-3 h-3" />
                                )}
                                <span>{Math.abs(dashboardData.pendapatan.persentase_perubahan).toFixed(1)}%</span>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                      <div className="bg-blue-400/30 p-4 rounded-xl backdrop-blur-sm">
                        <TrendingUp className="w-10 h-10" />
                      </div>
                    </div>
                  </Card>
                </Animated>

                {/* Total Kendaraan */}
                <Animated animation="fade-up" delay={300}>
                  <Card className="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer border-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm mb-1 font-medium">Total Kendaraan</p>
                        {(() => {
                          const formatted = formatNumberWithLabel(dashboardData.kendaraan.total, true, 1000);
                          return (
                            <>
                              <p className="text-4xl font-bold mb-1">{formatted.value}</p>
                              {formatted.label && (
                                <p className="text-purple-200 text-xs mb-1">{formatted.label}</p>
                              )}
                              <p className="text-purple-200 text-xs">
                                {formatNumber(dashboardData.kendaraan.baru_30_hari)} baru (30 hari)
                              </p>
                            </>
                          );
                        })()}
                      </div>
                      <div className="bg-purple-400/30 p-4 rounded-xl backdrop-blur-sm">
                        <Car className="w-10 h-10" />
                      </div>
                    </div>
                  </Card>
                </Animated>

                {/* Total Transaksi */}
                <Animated animation="fade-up" delay={400}>
                  <Card className="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer border-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100 text-sm mb-1 font-medium">Total Transaksi</p>
                        {(() => {
                          const formatted = formatNumberWithLabel(dashboardData.transaksi.total, true, 1000);
                          return (
                            <>
                              <p className="text-4xl font-bold mb-1">{formatted.value}</p>
                              {formatted.label && (
                                <p className="text-orange-200 text-xs mb-1">{formatted.label}</p>
                              )}
                              <p className="text-orange-200 text-xs">
                                {formatNumber(dashboardData.transaksi.bulan_ini)} bulan ini
                              </p>
                            </>
                          );
                        })()}
                      </div>
                      <div className="bg-orange-400/30 p-4 rounded-xl backdrop-blur-sm">
                        <Receipt className="w-10 h-10" />
                      </div>
                    </div>
                  </Card>
                </Animated>
              </div>

              {/* Second Row - Additional Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Wajib Pajak */}
                <Animated animation="fade-up" delay={500}>
                  <Card className="bg-gradient-to-br from-cyan-500 via-cyan-600 to-cyan-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer border-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-cyan-100 text-sm mb-1 font-medium">Wajib Pajak</p>
                        {(() => {
                          const formatted = formatNumberWithLabel(dashboardData.wajib_pajak.total, true, 1000);
                          return (
                            <>
                              <p className="text-4xl font-bold mb-1">{formatted.value}</p>
                              {formatted.label && (
                                <p className="text-cyan-200 text-xs mb-1">{formatted.label}</p>
                              )}
                              <p className="text-cyan-200 text-xs">Total wajib pajak</p>
                            </>
                          );
                        })()}
                      </div>
                      <div className="bg-cyan-400/30 p-4 rounded-xl backdrop-blur-sm">
                        <Users className="w-10 h-10" />
                      </div>
                    </div>
                  </Card>
                </Animated>

                {/* Total Prediksi */}
                <Animated animation="fade-up" delay={600}>
                  <Card className="bg-gradient-to-br from-pink-500 via-pink-600 to-pink-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer border-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-pink-100 text-sm mb-1 font-medium">Hasil Prediksi</p>
                        {(() => {
                          const formatted = formatNumberWithLabel(dashboardData.prediksi.total, true, 1000);
                          return (
                            <>
                              <p className="text-4xl font-bold mb-1">{formatted.value}</p>
                              {formatted.label && (
                                <p className="text-pink-200 text-xs mb-1">{formatted.label}</p>
                              )}
                              <p className="text-pink-200 text-xs">
                                {dashboardData.prediksi.terbaru ? `${dashboardData.prediksi.terbaru.metode}` : 'Belum ada'}
                              </p>
                            </>
                          );
                        })()}
                      </div>
                      <div className="bg-pink-400/30 p-4 rounded-xl backdrop-blur-sm">
                        <Calculator className="w-10 h-10" />
                      </div>
                    </div>
                  </Card>
                </Animated>

                {/* Master Data */}
                <Animated animation="fade-up" delay={700}>
                  <Card className="bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer border-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-indigo-100 text-sm mb-1 font-medium">Master Data</p>
                        {(() => {
                          const total = dashboardData.master_data.jenis_kendaraan + dashboardData.master_data.kecamatan + dashboardData.master_data.kelurahan;
                          const formatted = formatNumberWithLabel(total, true, 1000);
                          return (
                            <>
                              <p className="text-4xl font-bold mb-1">{formatted.value}</p>
                              {formatted.label && (
                                <p className="text-indigo-200 text-xs mb-1">{formatted.label}</p>
                              )}
                              <p className="text-indigo-200 text-xs">Total master data</p>
                            </>
                          );
                        })()}
                      </div>
                      <div className="bg-indigo-400/30 p-4 rounded-xl backdrop-blur-sm">
                        <Database className="w-10 h-10" />
                      </div>
                    </div>
                  </Card>
                </Animated>

                {/* Transaksi 7 Hari */}
                <Animated animation="fade-up" delay={800}>
                  <Card className="bg-gradient-to-br from-teal-500 via-teal-600 to-teal-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer border-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-teal-100 text-sm mb-1 font-medium">Transaksi 7 Hari</p>
                        {(() => {
                          const formatted = formatNumberWithLabel(dashboardData.transaksi["7_hari_terakhir"], true, 1000);
                          return (
                            <>
                              <p className="text-4xl font-bold mb-1">{formatted.value}</p>
                              {formatted.label && (
                                <p className="text-teal-200 text-xs mb-1">{formatted.label}</p>
                              )}
                              <p className="text-teal-200 text-xs">Terakhir 7 hari</p>
                            </>
                          );
                        })()}
                      </div>
                      <div className="bg-teal-400/30 p-4 rounded-xl backdrop-blur-sm">
                        <BarChart3 className="w-10 h-10" />
                      </div>
                    </div>
                  </Card>
                </Animated>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Pendapatan by Jenis Kendaraan */}
                <Animated animation="fade-right" delay={900}>
                  <Card 
                    title="Pendapatan per Jenis Kendaraan" 
                    subtitle={`Bulan ${momentId().month(dashboardData.periode.bulan_sekarang - 1).format("MMMM")} ${dashboardData.periode.tahun_sekarang}`}
                    className="shadow-lg hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="space-y-4">
                      {dashboardData.pendapatan.by_jenis_kendaraan.length > 0 ? (
                        dashboardData.pendapatan.by_jenis_kendaraan.map((item, index) => {
                          const percentage = (item.total / dashboardData.pendapatan.bulan_ini) * 100;
                          return (
                            <Animated 
                              key={item.jenis} 
                              animation="fade-left" 
                              delay={1000 + (index * 100)}
                            >
                              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-base-200 transition-colors duration-200">
                                <div className="flex items-center gap-3 flex-1">
                                  <div className="badge badge-primary badge-lg capitalize shadow-md">
                                    {item.jenis}
                                  </div>
                                  <div className="flex-1">
                                    <div className="w-full bg-base-200 rounded-full h-3 overflow-hidden">
                                      <div
                                        className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full transition-all duration-500 shadow-sm"
                                        style={{ width: `${percentage}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                </div>
                                <div className="ml-4 flex flex-col items-end gap-1">
                                  {(() => {
                                    const formatted = formatCurrencyWithLabel(item.total, true, 1_000_000);
                                    return (
                                      <>
                                        <span className="font-bold text-lg">{formatted.value}</span>
                                        {formatted.label && (
                                          <span className="text-xs text-base-content/50">{formatted.label}</span>
                                        )}
                                        <span className="text-xs text-base-content/60">{formatNumber(item.count)} transaksi</span>
                                      </>
                                    );
                                  })()}
                                </div>
                              </div>
                            </Animated>
                          );
                        })
                      ) : (
                        <p className="text-center text-base-content/70 py-4">Belum ada data pendapatan</p>
                      )}
                    </div>
                  </Card>
                </Animated>

                {/* Kendaraan by Jenis */}
                <Animated animation="fade-left" delay={900}>
                  <Card 
                    title="Kendaraan per Jenis" 
                    subtitle="Distribusi kendaraan berdasarkan jenis"
                    className="shadow-lg hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="space-y-4">
                      {dashboardData.kendaraan.by_jenis.length > 0 ? (
                        dashboardData.kendaraan.by_jenis.map((item, index) => {
                          const percentage = (item.count / dashboardData.kendaraan.total) * 100;
                          return (
                            <Animated 
                              key={item.jenis} 
                              animation="fade-right" 
                              delay={1000 + (index * 100)}
                            >
                              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-base-200 transition-colors duration-200">
                                <div className="flex items-center gap-3 flex-1">
                                  <div className="badge badge-secondary badge-lg capitalize shadow-md">
                                    {item.jenis}
                                  </div>
                                  <div className="flex-1">
                                    <div className="w-full bg-base-200 rounded-full h-3 overflow-hidden">
                                      <div
                                        className="bg-gradient-to-r from-secondary to-accent h-3 rounded-full transition-all duration-500 shadow-sm"
                                        style={{ width: `${percentage}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                </div>
                                <div className="ml-4 flex items-center gap-2">
                                  {(() => {
                                    const formatted = formatNumberWithLabel(item.count, true, 1000);
                                    return (
                                      <>
                                        <span className="font-bold text-lg w-20 text-right">{formatted.value}</span>
                                        {formatted.label && (
                                          <span className="text-xs text-base-content/50">{formatted.label}</span>
                                        )}
                                        <span className="text-xs text-base-content/60">({percentage.toFixed(1)}%)</span>
                                      </>
                                    );
                                  })()}
                                </div>
                              </div>
                            </Animated>
                          );
                        })
                      ) : (
                        <p className="text-center text-base-content/70 py-4">Belum ada data kendaraan</p>
                      )}
                    </div>
                  </Card>
                </Animated>
              </div>

              {/* Additional Statistics */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Prediksi by Metode */}
                <Animated animation="fade-up" delay={1100}>
                  <Card 
                    title="Prediksi by Metode" 
                    subtitle="Distribusi prediksi berdasarkan metode"
                    className="shadow-lg hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="space-y-3">
                      {dashboardData.prediksi.by_metode.length > 0 ? (
                        dashboardData.prediksi.by_metode.map((item, index) => (
                          <div key={item.metode} className="flex items-center justify-between p-3 bg-base-200 rounded-lg">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-primary" />
                              <span className="font-medium">{item.metode}</span>
                            </div>
                            <span className="badge badge-primary badge-lg">{formatNumber(item.count)}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-base-content/70 py-4">Belum ada prediksi</p>
                      )}
                    </div>
                  </Card>
                </Animated>

                {/* Wajib Pajak by Kecamatan */}
                <Animated animation="fade-up" delay={1200}>
                  <Card 
                    title="Wajib Pajak per Kecamatan" 
                    subtitle="Top 5 kecamatan"
                    className="shadow-lg hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="space-y-3">
                      {dashboardData.wajib_pajak.by_kecamatan.length > 0 ? (
                        dashboardData.wajib_pajak.by_kecamatan.map((item, index) => (
                          <div key={item.kecamatan} className="flex items-center justify-between p-3 bg-base-200 rounded-lg">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <MapPin className="w-4 h-4 text-secondary flex-shrink-0" />
                              <span className="font-medium truncate">{item.kecamatan}</span>
                            </div>
                            <span className="badge badge-secondary badge-lg ml-2">{formatNumber(item.count)}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-base-content/70 py-4">Belum ada data</p>
                      )}
                    </div>
                  </Card>
                </Animated>

                {/* Summary */}
                <Animated animation="fade-up" delay={1300}>
                  <Card 
                    title="Ringkasan" 
                    subtitle="Data master dan sistem"
                    className="shadow-lg hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="space-y-4">
                      <div className="stat bg-base-200 rounded-lg p-4">
                        <div className="stat-title text-xs">Jenis Kendaraan</div>
                        <div className="stat-value text-2xl text-primary">
                          {formatNumber(dashboardData.master_data.jenis_kendaraan)}
                        </div>
                      </div>
                      <div className="stat bg-base-200 rounded-lg p-4">
                        <div className="stat-title text-xs">Kecamatan</div>
                        <div className="stat-value text-2xl text-secondary">
                          {formatNumber(dashboardData.master_data.kecamatan)}
                        </div>
                      </div>
                      <div className="stat bg-base-200 rounded-lg p-4">
                        <div className="stat-title text-xs">Kelurahan</div>
                        <div className="stat-value text-2xl text-accent">
                          {formatNumber(dashboardData.master_data.kelurahan)}
                        </div>
                      </div>
                    </div>
                  </Card>
                </Animated>
              </div>

              {/* Prediksi Terbaru */}
              {dashboardData.prediksi.terbaru && (
                <Animated animation="fade-up" delay={1400}>
                  <Card 
                    title="Prediksi Terbaru" 
                    subtitle={`${momentId().month(dashboardData.prediksi.terbaru.bulan - 1).format("MMMM")} ${dashboardData.prediksi.terbaru.tahun}`}
                    className="shadow-lg hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="flex items-center justify-between p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl">
                      <div>
                        <p className="text-sm text-base-content/70 mb-2">Metode: <span className="font-semibold">{dashboardData.prediksi.terbaru.metode}</span></p>
                        {(() => {
                          const formatted = formatCurrencyWithLabel(dashboardData.prediksi.terbaru.nilai, true, 1_000_000);
                          return (
                            <>
                              <p className="text-3xl font-bold text-primary mb-1">
                                {formatted.value}
                              </p>
                              {formatted.label && (
                                <p className="text-sm text-base-content/60">{formatted.label}</p>
                              )}
                            </>
                          );
                        })()}
                      </div>
                      <div className="bg-primary/20 p-4 rounded-xl">
                        <TrendingUp className="w-12 h-12 text-primary" />
                      </div>
                    </div>
                  </Card>
                </Animated>
              )}
            </>
          ) : (
            <Card>
              <div className="text-center py-8">
                <p className="text-base-content/70">Tidak ada data untuk ditampilkan</p>
              </div>
            </Card>
          )}
          </div>
        </div>
      </div>
    </AdminRoute>
  );
}
