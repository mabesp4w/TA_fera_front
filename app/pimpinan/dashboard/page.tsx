/** @format */

"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { dashboardService, type DashboardData } from "@/services/dashboardService";
import PimpinanRoute from "@/components/PimpinanRoute";
import SidebarPimpinan from "@/components/SidebarPimpinan";
import Header from "@/components/Header";
import Card from "@/components/ui/Card";
import { Animated } from "@/components/ui";
import { 
  TrendingUp,
  BarChart3,
  PieChart,
  Calendar,
  Download,
  FileText,
  Target,
  Activity,
  Wallet,
  Car,
  Receipt,
  Crown,
  ArrowUpRight,
  ArrowDownRight,
  Lightbulb,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "@/services";
import { momentId } from "@/utils/momentIndonesia";
import { formatNumber, formatNumberWithLabel, formatCurrencyWithLabel } from "@/utils/formatNumber";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart as RePieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

// Warna untuk chart
const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function PimpinanDashboardPage() {
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

  // Data untuk chart distribusi pendapatan
  const getPendapatanChartData = () => {
    if (!dashboardData) return [];
    return dashboardData.pendapatan.by_jenis_kendaraan.map((item, index) => ({
      name: item.jenis,
      value: item.total,
      count: item.count,
      fill: COLORS[index % COLORS.length]
    }));
  };

  // Data untuk chart kendaraan
  const getKendaraanChartData = () => {
    if (!dashboardData) return [];
    return dashboardData.kendaraan.by_jenis.map((item, index) => ({
      name: item.jenis,
      value: item.count,
      fill: COLORS[index % COLORS.length]
    }));
  };

  // Data insight untuk pimpinan
  const getInsights = () => {
    if (!dashboardData) return [];
    
    const insights = [];
    
    // Insight 1: Perbandingan pendapatan bulan ini vs trend
    if (dashboardData.pendapatan.persentase_perubahan > 0) {
      insights.push({
        type: 'positive',
        icon: ArrowUpRight,
        title: 'Peningkatan Pendapatan',
        desc: `Pendapatan bulan ini naik ${dashboardData.pendapatan.persentase_perubahan.toFixed(1)}% dibanding bulan lalu`,
      });
    } else if (dashboardData.pendapatan.persentase_perubahan < 0) {
      insights.push({
        type: 'negative',
        icon: ArrowDownRight,
        title: 'Penurunan Pendapatan',
        desc: `Pendapatan bulan ini turun ${Math.abs(dashboardData.pendapatan.persentase_perubahan).toFixed(1)}% dibanding bulan lalu`,
      });
    }
    
    // Insight 2: Prediksi terbaru
    if (dashboardData.prediksi.terbaru) {
      insights.push({
        type: 'info',
        icon: Target,
        title: 'Prediksi Tersedia',
        desc: `Prediksi ${dashboardData.prediksi.terbaru.metode} untuk periode ${momentId().month(dashboardData.prediksi.terbaru.bulan - 1).format("MMMM YYYY")}`,
      });
    }
    
    // Insight 3: Kendaraan baru
    if (dashboardData.kendaraan.baru_30_hari > 0) {
      insights.push({
        type: 'positive',
        icon: Car,
        title: 'Pertumbuhan Kendaraan',
        desc: `${dashboardData.kendaraan.baru_30_hari} kendaraan baru terdaftar dalam 30 hari terakhir`,
      });
    }
    
    return insights;
  };

  return (
    <PimpinanRoute>
      <div className="min-h-screen bg-base-200 flex overflow-x-hidden">
        <SidebarPimpinan />

        <div className="flex-1 lg:ml-64 overflow-x-hidden">
          {/* Header Khusus Pimpinan */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border-b border-amber-200 dark:border-amber-900/30">
            <Header
              variant="admin"
              title="Dashboard Executive"
              subtitle={`Selamat datang, ${user?.first_name || "Kepala UPPD"} | ${momentId().format("dddd, DD MMMM YYYY")}`}
              showThemeSwitcher={true}
            />
          </div>

          {/* Content */}
          <div className="p-4 lg:p-8">
            {/* Welcome Banner */}
            <Animated animation="fade-down">
              <div className="mb-6 p-6 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-yellow-500/10 rounded-2xl border border-amber-200 dark:border-amber-900/30 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Crown className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-amber-700 dark:text-amber-400 mb-1">
                      Dashboard Pimpinan
                    </h2>
                    <p className="text-sm text-base-content/70 mb-3">
                      Pantau performa pendapatan pajak kendaraan bermotor dan analisis prediksi untuk pengambilan keputusan strategis.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                        <Activity className="w-3 h-3" />
                        Real-time Analytics
                      </span>
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                        <TrendingUp className="w-3 h-3" />
                        AI-Powered Prediction
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Animated>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <span className="loading loading-spinner loading-lg text-amber-500"></span>
              </div>
            ) : dashboardData ? (
              <>
                {/* Executive Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <Animated animation="fade-up" delay={100}>
                    <Card className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-emerald-100 text-xs mb-1">Total Pendapatan (All Time)</p>
                          {(() => {
                            const formatted = formatCurrencyWithLabel(dashboardData.pendapatan.total_all_time, true, 1_000_000);
                            return (
                              <>
                                <p className="text-2xl font-bold">{formatted.value}</p>
                                {formatted.label && <p className="text-emerald-200 text-xs">{formatted.label}</p>}
                              </>
                            );
                          })()}
                        </div>
                        <div className="bg-emerald-400/30 p-3 rounded-xl">
                          <Wallet className="w-8 h-8" />
                        </div>
                      </div>
                    </Card>
                  </Animated>

                  <Animated animation="fade-up" delay={200}>
                    <Card className="bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100 text-xs mb-1">Pendapatan Bulan Ini</p>
                          {(() => {
                            const formatted = formatCurrencyWithLabel(dashboardData.pendapatan.bulan_ini, true, 1_000_000);
                            return (
                              <>
                                <p className="text-2xl font-bold">{formatted.value}</p>
                                <div className="flex items-center gap-1 text-blue-200 text-xs">
                                  {dashboardData.pendapatan.persentase_perubahan >= 0 ? (
                                    <ArrowUpRight className="w-3 h-3" />
                                  ) : (
                                    <ArrowDownRight className="w-3 h-3" />
                                  )}
                                  <span>{Math.abs(dashboardData.pendapatan.persentase_perubahan).toFixed(1)}% vs bulan lalu</span>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                        <div className="bg-blue-400/30 p-3 rounded-xl">
                          <Receipt className="w-8 h-8" />
                        </div>
                      </div>
                    </Card>
                  </Animated>

                  <Animated animation="fade-up" delay={300}>
                    <Card className="bg-gradient-to-br from-purple-500 to-purple-700 text-white shadow-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-100 text-xs mb-1">Total Kendaraan Terdaftar</p>
                          {(() => {
                            const formatted = formatNumberWithLabel(dashboardData.kendaraan.total, true, 1000);
                            return (
                              <>
                                <p className="text-2xl font-bold">{formatted.value}</p>
                                <p className="text-purple-200 text-xs">{formatted.label || 'unit'}</p>
                              </>
                            );
                          })()}
                        </div>
                        <div className="bg-purple-400/30 p-3 rounded-xl">
                          <Car className="w-8 h-8" />
                        </div>
                      </div>
                    </Card>
                  </Animated>

                  <Animated animation="fade-up" delay={400}>
                    <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-amber-100 text-xs mb-1">Total Prediksi Tersimpan</p>
                          {(() => {
                            const formatted = formatNumberWithLabel(dashboardData.prediksi.total, true, 1000);
                            return (
                              <>
                                <p className="text-2xl font-bold">{formatted.value}</p>
                                <p className="text-amber-200 text-xs">{formatted.label || 'hasil prediksi'}</p>
                              </>
                            );
                          })()}
                        </div>
                        <div className="bg-amber-400/30 p-3 rounded-xl">
                          <Target className="w-8 h-8" />
                        </div>
                      </div>
                    </Card>
                  </Animated>
                </div>

                {/* Insights Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                  <Animated animation="fade-right" delay={500} className="lg:col-span-2">
                    <Card className="h-full">
                      <div className="flex items-center gap-2 mb-4">
                        <Lightbulb className="w-5 h-5 text-amber-500" />
                        <h3 className="text-base font-bold">Insight & Rekomendasi</h3>
                      </div>
                      <div className="space-y-3">
                        {getInsights().map((insight, index) => (
                          <div 
                            key={index}
                            className={`p-3 rounded-xl border-l-4 ${
                              insight.type === 'positive' ? 'bg-emerald-50 border-emerald-500 dark:bg-emerald-950/20' :
                              insight.type === 'negative' ? 'bg-red-50 border-red-500 dark:bg-red-950/20' :
                              'bg-blue-50 border-blue-500 dark:bg-blue-950/20'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg ${
                                insight.type === 'positive' ? 'bg-emerald-100 text-emerald-600' :
                                insight.type === 'negative' ? 'bg-red-100 text-red-600' :
                                'bg-blue-100 text-blue-600'
                              }`}>
                                <insight.icon className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold">{insight.title}</p>
                                <p className="text-xs text-base-content/70">{insight.desc}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                        {getInsights().length === 0 && (
                          <p className="text-sm text-base-content/50 text-center py-4">
                            Belum ada insight tersedia
                          </p>
                        )}
                      </div>
                    </Card>
                  </Animated>

                  <Animated animation="fade-left" delay={600}>
                    <Card className="h-full">
                      <div className="flex items-center gap-2 mb-4">
                        <Calendar className="w-5 h-5 text-primary" />
                        <h3 className="text-base font-bold">Prediksi Terbaru</h3>
                      </div>
                      {dashboardData.prediksi.terbaru ? (
                        <div className="space-y-4">
                          <div className="text-center p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl border border-amber-200 dark:border-amber-900/30">
                            <p className="text-xs text-base-content/70 mb-1">Nilai Prediksi</p>
                            {(() => {
                              const formatted = formatCurrencyWithLabel(dashboardData.prediksi.terbaru.nilai, true, 1_000_000);
                              return (
                                <>
                                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{formatted.value}</p>
                                  {formatted.label && <p className="text-xs text-base-content/50">{formatted.label}</p>}
                                </>
                              );
                            })()}
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-base-content/70">Metode</span>
                              <span className="font-semibold">{dashboardData.prediksi.terbaru.metode}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-base-content/70">Periode</span>
                              <span className="font-semibold">
                                {momentId().month(dashboardData.prediksi.terbaru.bulan - 1).format("MMMM YYYY")}
                              </span>
                            </div>
                          </div>
                          <button 
                            onClick={() => router.push('/pimpinan/hasil-prediksi')}
                            className="btn btn-sm btn-outline btn-primary w-full"
                          >
                            <FileText className="w-4 h-4" />
                            Lihat Semua Prediksi
                          </button>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Target className="w-12 h-12 text-base-content/30 mx-auto mb-2" />
                          <p className="text-sm text-base-content/50">Belum ada prediksi tersimpan</p>
                        </div>
                      )}
                    </Card>
                  </Animated>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Animated animation="fade-up" delay={700}>
                    <Card>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <PieChart className="w-5 h-5 text-primary" />
                          <h3 className="text-base font-bold">Distribusi Pendapatan per Jenis</h3>
                        </div>
                      </div>
                      <div style={{ width: "100%", height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <RePieChart>
                            <Pie
                              data={getPendapatanChartData()}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {getPendapatanChartData().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Pie>
                            <Tooltip 
                              formatter={(value: number | undefined) => formatCurrency(value || 0)}
                              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)' }}
                            />
                            <Legend />
                          </RePieChart>
                        </ResponsiveContainer>
                      </div>
                    </Card>
                  </Animated>

                  <Animated animation="fade-up" delay={800}>
                    <Card>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-secondary" />
                          <h3 className="text-base font-bold">Distribusi Kendaraan per Jenis</h3>
                        </div>
                      </div>
                      <div style={{ width: "100%", height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={getKendaraanChartData()}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip 
                              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)' }}
                            />
                            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                              {getKendaraanChartData().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </Card>
                  </Animated>
                </div>

                {/* Quick Actions */}
                <Animated animation="fade-up" delay={900}>
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button 
                      onClick={() => router.push('/pimpinan/laporan/pendapatan')}
                      className="btn btn-lg btn-outline btn-primary"
                    >
                      <FileText className="w-5 h-5" />
                      Laporan Pendapatan
                    </button>
                    <button 
                      onClick={() => router.push('/pimpinan/laporan/prediksi')}
                      className="btn btn-lg btn-outline btn-secondary"
                    >
                      <TrendingUp className="w-5 h-5" />
                      Laporan Prediksi
                    </button>
                    <button 
                      onClick={() => router.push('/pimpinan/export')}
                      className="btn btn-lg btn-outline btn-accent"
                    >
                      <Download className="w-5 h-5" />
                      Export Data
                    </button>
                  </div>
                </Animated>
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
    </PimpinanRoute>
  );
}
