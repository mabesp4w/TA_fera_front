/** @format */

"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import AdminRoute from "@/components/AdminRoute";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Button, Card, Select } from "@/components/ui";
import {
  hybridPredictionService,
  HybridPredictionRequest,
  HybridPredictionResponse,
} from "@/services/hybridPredictionService";
import { toast } from "@/services";

const prediksiSchema = yup.object({
  tahun_prediksi: yup
    .number()
    .required("Tahun prediksi wajib diisi")
    .min(2020)
    .max(2030),
  bulan_prediksi: yup
    .number()
    .required("Bulan prediksi wajib diisi")
    .min(1)
    .max(12),
});

type PrediksiFormData = yup.InferType<typeof prediksiSchema>;

export default function HybridPrediksiPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<HybridPredictionResponse | null>(
    null
  );

  const formMethods = useForm<PrediksiFormData>({
    resolver: yupResolver(prediksiSchema),
    defaultValues: {
      tahun_prediksi: 2025,
      bulan_prediksi: 12,
    },
  });

  const { formState: { isSubmitting } } = formMethods;

  const handleSubmit = async (data: PrediksiFormData) => {
    try {
      setIsLoading(true);
      setResult(null);

      const response = await hybridPredictionService.predict({
        ...data,
        selected_scenario: "base",
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getScenarioColor = (scenario: string) => {
    switch (scenario) {
      case "conservative":
        return "text-error";
      case "base":
        return "text-warning";
      case "moderate":
        return "text-info";
      case "optimistic":
        return "text-success";
      default:
        return "text-base-content";
    }
  };

  return (
    <AdminRoute>
      <div className="min-h-screen bg-base-200 flex overflow-x-hidden">
        <Sidebar />

        <div className="flex-1 lg:ml-64 overflow-x-hidden">
          <Header
            variant="admin"
            title="Prediksi Hybrid"
            subtitle="TES + Business Rules + Monthly MAPE"
            showThemeSwitcher={true}
          />

          <div className="p-4 lg:p-8 min-w-0">
            {/* Info Card */}
            <Card className="mb-6 bg-primary/5 border-primary/20">
              <h3 className="text-lg font-semibold mb-2">
                🎯 Hybrid Prediction Approach
              </h3>
              <p className="text-sm text-base-content/70 mb-3">
                Menggabungkan TES (Triple Exponential Smoothing) dengan
                Business Rules dan Monthly MAPE untuk akurasi yang lebih baik.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-base-content/60">
                <div>
                  <strong>Base:</strong> TES (24 periode)
                </div>
                <div>
                  <strong>Scenario:</strong> Conservative, Base, Moderate, Optimistic
                </div>
                <div>
                  <strong>Adjustment:</strong> Monthly business rules
                </div>
              </div>
            </Card>

            {/* Form */}
            <Card className="mb-6">
              <h3 className="text-lg font-semibold mb-4">
                Parameter Prediksi
              </h3>
              <form onSubmit={formMethods.handleSubmit(handleSubmit)}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="label">
                      <span className="label-text font-medium">
                        Tahun Prediksi
                      </span>
                    </label>
                    <input
                      type="number"
                      {...formMethods.register("tahun_prediksi", {
                        valueAsNumber: true,
                      })}
                      className="input input-bordered w-full"
                    />
                    {formMethods.formState.errors.tahun_prediksi && (
                      <span className="text-error text-xs">
                        {formMethods.formState.errors.tahun_prediksi.message}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="label">
                      <span className="label-text font-medium">
                        Bulan Prediksi
                      </span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      {...formMethods.register("bulan_prediksi", {
                        valueAsNumber: true,
                      })}
                      className="input input-bordered w-full"
                    />
                    {formMethods.formState.errors.bulan_prediksi && (
                      <span className="text-error text-xs">
                        {formMethods.formState.errors.bulan_prediksi.message}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    loading={isLoading || isSubmitting}
                  >
                    Generate Hybrid Prediction
                  </Button>
                </div>
              </form>
            </Card>

            {/* Results */}
            {result && (
              <>
                {/* Main Prediction */}
                <Card className="mb-6 border-success/30">
                  <h3 className="text-lg font-semibold mb-4">
                    Hasil Prediksi Hybrid ({result.scenario.toUpperCase()})
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="stat bg-success/10 rounded-lg p-4">
                      <div className="stat-title">Prediksi</div>
                      <div className="stat-value text-success">
                        {formatCurrency(result.nilai_prediksi)}
                      </div>
                    </div>

                    {result.akurasi !== undefined && (
                      <div className="stat bg-info/10 rounded-lg p-4">
                        <div className="stat-title">Akurasi</div>
                        <div className="stat-value text-info">
                          {result.akurasi.toFixed(1)}%
                        </div>
                      </div>
                    )}

                    {result.error_persentase !== undefined && (
                      <div className="stat bg-warning/10 rounded-lg p-4">
                        <div className="stat-title">Error</div>
                        <div className="stat-value text-warning">
                          {result.error_persentase.toFixed(1)}%
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confidence Interval */}
                  <div className="bg-base-200 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold mb-2">
                      Confidence Interval (95%)
                    </h4>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Lower:</span>
                        <span className="font-mono">
                          {formatCurrency(result.confidence_lower)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Upper:</span>
                        <span className="font-mono">
                          {formatCurrency(result.confidence_upper)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actual vs Prediction */}
                  {result.nilai_aktual && (
                    <div className="bg-info/10 rounded-lg p-4 mb-6">
                      <h4 className="font-semibold mb-2">
                        Perbandingan dengan Aktual
                      </h4>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span>TES Prediction:</span>
                          <span className="font-mono">
                            {formatCurrency(result.tes_prediction)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Hybrid Prediction:</span>
                          <span className="font-mono font-bold">
                            {formatCurrency(result.nilai_prediksi)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Actual:</span>
                          <span className="font-mono">
                            {formatCurrency(result.nilai_aktual)}
                          </span>
                        </div>
                        <div className="flex justify-between font-semibold">
                          <span>Diff:</span>
                          <span
                            className={`font-mono ${
                              result.error_absolut &&
                              result.error_absolut > 0
                                ? "text-error"
                                : "text-success"
                            }`}
                          >
                            {result.error_absolut !== undefined &&
                              formatCurrency(result.error_absolut)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Parameters */}
                  <div className="text-xs text-base-content/60">
                    <p>
                      <strong>TES Parameters:</strong> α=
                      {result.tes_parameters.alpha.toFixed(4)}, β=
                      {result.tes_parameters.beta.toFixed(4)}, γ=
                      {result.tes_parameters.gamma.toFixed(4)}
                    </p>
                    <p>
                      <strong>Monthly Adjustment:</strong>{" "}
                      {(result.monthly_adjustment * 100).toFixed(0)}%
                    </p>
                    <p>
                      <strong>Recommended Scenario:</strong>{" "}
                      {result.recommended_scenario}
                    </p>
                    <p>
                      <strong>Training Data:</strong>{" "}
                      {result.data_training_dari} s/d {result.data_training_sampai}
                    </p>
                  </div>
                </Card>

                {/* All Scenarios */}
                <Card className="mb-6 border-info/30">
                  <h3 className="text-lg font-semibold mb-4">
                    Semua Scenario
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="table table-zebra table-sm">
                      <thead>
                        <tr>
                          <th>Scenario</th>
                          <th>Prediksi</th>
                          <th>Factor</th>
                          <th>Monthly Adj</th>
                          <th>Final Factor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(result.scenarios).map(
                          ([scenario, data]) => (
                            <tr
                              key={scenario}
                              className={
                                scenario === result.scenario
                                  ? "bg-primary/10 font-bold"
                                  : ""
                              }
                            >
                              <td className="capitalize">
                                {scenario === result.scenario && "⭐ "}
                                {scenario.replace("_", " ")}
                              </td>
                              <td className="font-mono">
                                {formatCurrency(data.prediksi)}
                              </td>
                              <td>{(data.factor * 100).toFixed(0)}%</td>
                              <td>{(data.monthly_adjustment * 100).toFixed(0)}%</td>
                              <td className="font-mono">
                                {data.final_factor.toFixed(2)}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </AdminRoute>
  );
}
