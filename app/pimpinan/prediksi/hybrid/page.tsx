/** @format */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import PimpinanRoute from "@/components/PimpinanRoute";
import SidebarPimpinan from "@/components/SidebarPimpinan";
import Header from "@/components/Header";
import { Card, Button } from "@/components/ui";
import { hybridPredictionService, HybridPredictionResponse } from "@/services/hybridPredictionService";
import { toast } from "@/services";
import { 
  Calculator, 
  Crown, 
  Sparkles, 
  TrendingUp, 
  ArrowLeft,
  BarChart3,
} from "lucide-react";

const prediksiSchema = yup.object({
  tahun_prediksi: yup.number().required().min(2020).max(2030),
  bulan_prediksi: yup.number().required().min(1).max(12),
});

type PrediksiFormData = yup.InferType<typeof prediksiSchema>;

const SCENARIOS = [
  { key: "conservative", label: "Konservatif", desc: "Prediksi paling aman, cocok untuk perencanaan defensif", adjustment: "-10%", color: "info" },
  { key: "base", label: "Dasar", desc: "Prediksi standar tanpa penyesuaian, nilai TES murni", adjustment: "0%", color: "primary" },
  { key: "moderate", label: "Moderat", desc: "Prediksi dengan penyesuaian sedang, cocok untuk perencanaan realistis", adjustment: "+5%", color: "warning" },
  { key: "optimistic", label: "Optimistik", desc: "Prediksi dengan pendekatan agresif, cocok untuk target optimal", adjustment: "+10%", color: "success" },
];

const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined || isNaN(Number(value))) return "Rp -";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(value));
};

export default function PrediksiHybridPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<HybridPredictionResponse | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<"base" | "conservative" | "moderate" | "optimistic">("base");

  const formMethods = useForm<PrediksiFormData>({
    resolver: yupResolver(prediksiSchema) as any,
    defaultValues: { tahun_prediksi: new Date().getFullYear(), bulan_prediksi: new Date().getMonth() + 1 },
  });

  const handleSubmit = async (data: PrediksiFormData) => {
    try {
      setIsLoading(true);
      setResult(null);
      const response = await hybridPredictionService.predict({
        ...data,
        selected_scenario: selectedScenario,
        training_periods: 24,
        save_to_db: false,
      });
      setResult(response);
      toast.success("Prediksi hybrid berhasil dibuat!");
    } catch (error: any) {
      toast.error(error?.message || "Gagal membuat prediksi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PimpinanRoute>
      <div className="min-h-screen bg-base-200 flex overflow-x-hidden">
        <SidebarPimpinan />

        <div className="flex-1 lg:ml-64 overflow-x-hidden">
          <Header
            variant="admin"
            title="Prediksi Hybrid"
            subtitle="TES + Business Rules untuk akurasi optimal"
            showThemeSwitcher={true}
          />

          <div className="p-4 lg:p-8 min-w-0">
            <div className="flex items-center gap-2 mb-6">
              <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => router.push("/pimpinan/dashboard")}>
                Kembali
              </Button>
            </div>

            {/* Info Card */}
            <Card className="mb-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shrink-0">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-amber-700 dark:text-amber-400 mb-2">
                    Hybrid Prediction untuk Keputusan Strategis
                  </h3>
                  <p className="text-sm text-base-content/70">
                    Metode hybrid menggabungkan Triple Exponential Smoothing dengan aturan bisnis untuk memberikan 
                    prediksi yang lebih akurat dengan empat skenario.
                  </p>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form */}
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-primary" />
                    Parameter Prediksi
                  </h3>
                  <form onSubmit={formMethods.handleSubmit(handleSubmit)}>
                    <div className="space-y-4 mb-4">
                      <div>
                        <label className="label"><span className="label-text font-medium">Tahun Prediksi</span></label>
                        <input type="number" {...formMethods.register("tahun_prediksi", { valueAsNumber: true })} className="input input-bordered w-full" />
                      </div>
                      <div>
                        <label className="label"><span className="label-text font-medium">Bulan Prediksi</span></label>
                        <select {...formMethods.register("bulan_prediksi", { valueAsNumber: true })} className="select select-bordered w-full">
                          {Array.from({ length: 12 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>
                              {new Date(2024, i).toLocaleString("id-ID", { month: "long" })}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="label"><span className="label-text font-medium">Skenario</span></label>
                      <div className="space-y-2">
                        {SCENARIOS.map((s) => (
                          <label key={s.key} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedScenario === s.key ? `bg-${s.color}/10 border-${s.color}` : "bg-base-100 border-base-300 hover:bg-base-200"}`}>
                            <input type="radio" name="scenario" value={s.key} checked={selectedScenario === s.key} onChange={(e) => setSelectedScenario(e.target.value as "base" | "conservative" | "moderate" | "optimistic")} className="radio radio-sm" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{s.label}</span>
                                <span className={`badge badge-xs badge-${s.color}`}>{s.adjustment}</span>
                              </div>
                              <p className="text-xs text-base-content/60 mt-0.5">{s.desc}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <Button type="submit" variant="primary" loading={isLoading} leftIcon={<Sparkles className="w-4 h-4" />} className="w-full">
                      Generate Prediksi
                    </Button>
                  </form>
                </Card>
              </div>

              {/* Results */}
              <div className="lg:col-span-2">
                {!isLoading && !result && (
                  <Card className="p-12 text-center">
                    <div className="w-20 h-20 bg-base-300/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="w-10 h-10 text-base-content/30" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Siap Membuat Prediksi</h3>
                    <p className="text-sm text-base-content/60">Atur parameter dan pilih skenario yang sesuai.</p>
                  </Card>
                )}

                {result && (
                  <Card className="mb-6 border-success/30">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-success" />
                      Hasil Prediksi Hybrid ({result.scenario.toUpperCase()})
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="stat bg-success/10 rounded-xl p-4">
                        <div className="stat-title text-xs text-base-content/60">Nilai Prediksi</div>
                        <div className="stat-value text-xl text-success">{formatCurrency(result.nilai_prediksi)}</div>
                      </div>
                      {result.akurasi !== undefined && (
                        <div className="stat bg-info/10 rounded-xl p-4">
                          <div className="stat-title text-xs text-base-content/60">Akurasi</div>
                          <div className="stat-value text-xl text-info">{result.akurasi.toFixed(1)}%</div>
                        </div>
                      )}
                      {result.error_persentase !== undefined && (
                        <div className="stat bg-warning/10 rounded-xl p-4">
                          <div className="stat-title text-xs text-base-content/60">Error</div>
                          <div className="stat-value text-xl text-warning">{result.error_persentase.toFixed(1)}%</div>
                        </div>
                      )}
                    </div>

                    <div className="bg-base-200 rounded-xl p-4 mb-4">
                      <h4 className="font-semibold mb-2">Confidence Interval (95%)</h4>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between"><span>Lower:</span><span className="font-mono">{formatCurrency(result.confidence_lower)}</span></div>
                        <div className="flex justify-between"><span>Upper:</span><span className="font-mono">{formatCurrency(result.confidence_upper)}</span></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      <div className="p-3 bg-base-200 rounded-lg">
                        <span className="text-base-content/60 block mb-1">Alpha</span>
                        <span className="font-mono font-semibold">{result.tes_parameters.alpha.toFixed(4)}</span>
                      </div>
                      <div className="p-3 bg-base-200 rounded-lg">
                        <span className="text-base-content/60 block mb-1">Beta</span>
                        <span className="font-mono font-semibold">{result.tes_parameters.beta.toFixed(4)}</span>
                      </div>
                      <div className="p-3 bg-base-200 rounded-lg">
                        <span className="text-base-content/60 block mb-1">Gamma</span>
                        <span className="font-mono font-semibold">{result.tes_parameters.gamma.toFixed(4)}</span>
                      </div>
                      <div className="p-3 bg-base-200 rounded-lg">
                        <span className="text-base-content/60 block mb-1">Rekomendasi</span>
                        <span className="font-semibold capitalize">{result.recommended_scenario}</span>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PimpinanRoute>
  );
}
