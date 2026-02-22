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
import type { SelectOption } from "@/components/ui/types";
import {
  hybridPredictionService,
  HybridPredictionRequest,
  HybridPredictionResponse,
} from "@/services/hybridPredictionService";
import { jenisKendaraanService } from "@/services/jenisKendaraanService";
import { prediksiCheckService, type DataCheckResponse } from "@/services/prediksiCheckService";
import { toast } from "@/services";
import { Save, Trash2 } from "lucide-react";

const prediksiSchema = yup.object({
  jenis_kendaraan_id: yup.number().nullable().notRequired(),
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
  const [isSaving, setIsSaving] = useState(false);
  const [result, setResult] = useState<HybridPredictionResponse | null>(
    null
  );
  const [jenisKendaraanOptions, setJenisKendaraanOptions] = useState<
    SelectOption[]
  >([]);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [dataCheck, setDataCheck] = useState<DataCheckResponse | null>(null);
  const [isCheckingData, setIsCheckingData] = useState(false);

  const formMethods = useForm<PrediksiFormData>({
    resolver: yupResolver(prediksiSchema) as any,
    defaultValues: {
      tahun_prediksi: 2025,
      bulan_prediksi: 12,
    },
  });

  const { formState: { isSubmitting } } = formMethods;

  // Fetch jenis kendaraan options
  const fetchJenisKendaraanOptions = async () => {
    try {
      const response = await jenisKendaraanService.getList({ page_size: 1000 });
      const options: SelectOption[] = (response.data || []).map((item) => ({
        value: item.id.toString(),
        label: item.nama,
      }));
      setJenisKendaraanOptions(options);
    } catch (error) {
      console.error("Failed to fetch jenis kendaraan options:", error);
    }
  };

  useEffect(() => {
    fetchJenisKendaraanOptions();
  }, []);

  // Cek data saat jenis kendaraan berubah
  const checkDataAvailability = async (jenisKendaraanId?: number) => {
    try {
      setIsCheckingData(true);
      const check = await prediksiCheckService.checkData(jenisKendaraanId);
      setDataCheck(check);
    } catch (error) {
      console.error("Failed to check data:", error);
      setDataCheck(null);
    } finally {
      setIsCheckingData(false);
    }
  };

  useEffect(() => {
    // Cek data awal (tanpa filter)
    checkDataAvailability();
  }, []);

  const handleSubmit = async (data: PrediksiFormData) => {
    try {
      setIsLoading(true);
      setResult(null);
      setGenerateError(null);

      // Cek ketersediaan data terlebih dahulu
      const check = await prediksiCheckService.checkData(
        data.jenis_kendaraan_id && data.jenis_kendaraan_id > 0 ? data.jenis_kendaraan_id : undefined
      );

      // Update data check state
      setDataCheck(check);

      // Tentukan training period yang dibutuhkan
      const training_periods = 24; // Default untuk TES base method

      // Validasi jika memilih jenis kendaraan tertentu: data harus cukup untuk training periods
      if (data.jenis_kendaraan_id && data.jenis_kendaraan_id > 0) {
        if (check.jumlah_data < training_periods) {
          setGenerateError(
            `Data historis tidak cukup untuk jenis kendaraan yang dipilih. Minimal ${training_periods} periode, tetapi hanya ada ${check.jumlah_data} periode.`
          );
          toast.error(
            `Data historis tidak cukup untuk jenis kendaraan yang dipilih. Minimal ${training_periods} periode, tetapi hanya ada ${check.jumlah_data} periode.`
          );
          setIsLoading(false);
          return;
        }
      } else {
        // Untuk data global (tanpa filter jenis kendaraan), butuh minimal 3 periode
        if (check.jumlah_data < 3) {
          setGenerateError(
            `Data historis tidak cukup. Minimal 3 periode, tetapi hanya ada ${check.jumlah_data} periode.`
          );
          toast.error(
            `Data historis tidak cukup. Minimal 3 periode, tetapi hanya ada ${check.jumlah_data} periode.`
          );
          setIsLoading(false);
          return;
        }
      }

      // Hanya kirim jenis_kendaraan_id jika ada nilainya (bukan null dan bukan 0)
      const requestData: HybridPredictionRequest = {
        tahun_prediksi: data.tahun_prediksi,
        bulan_prediksi: data.bulan_prediksi,
        selected_scenario: "base",
        training_periods: training_periods,
        save_to_db: false,
      };

      if (data.jenis_kendaraan_id && data.jenis_kendaraan_id > 0) {
        requestData.jenis_kendaraan_id = data.jenis_kendaraan_id;
      }

      const response = await hybridPredictionService.predict(requestData);

      setResult(response);
      toast.success("Prediksi hybrid berhasil dibuat!");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Gagal membuat prediksi";
      setGenerateError(errorMessage);
      toast.error(errorMessage);
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

  // Handle save prediction to database
  const handleSave = async () => {
    if (!result) return;

    try {
      setIsSaving(true);

      const saveData: HybridPredictionRequest & { keterangan?: string; prediction_data?: HybridPredictionResponse } = {
        jenis_kendaraan_id: formMethods.getValues().jenis_kendaraan_id || undefined,
        tahun_prediksi: formMethods.getValues().tahun_prediksi,
        bulan_prediksi: formMethods.getValues().bulan_prediksi,
        selected_scenario: result.scenario as any,
        training_periods: result.training_periods,
        keterangan: `Disimpan dari halaman prediksi hybrid (${result.scenario} scenario)`,
        prediction_data: result,
      };

      const savedResult = await hybridPredictionService.save(saveData);

      // Update result dengan id dari database, tapi pertahankan nilai prediksi asli
      setResult({
        ...result,
        id: savedResult.id,
        created_at: savedResult.created_at,
      });

      toast.success("Prediksi hybrid berhasil disimpan ke database");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Gagal menyimpan prediksi";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete prediction
  const handleDelete = async () => {
    if (!result) return;

    // Jika belum ada id (belum disimpan ke database), hapus dari tampilan saja
    if (!result.id) {
      setResult(null);
      setGenerateError(null);
      toast.success("Prediksi dihapus dari daftar");
      return;
    }

    // Jika sudah ada id (sudah disimpan ke database), hapus dari database
    try {
      await hybridPredictionService.delete(result.id);
      setResult(null);
      setGenerateError(null);
      toast.success("Prediksi hybrid berhasil dihapus dari database");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Gagal menghapus prediksi";
      toast.error(errorMessage);
    }
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

  // Helper untuk mendapatkan saran dari error message
  function getSuggestionFromError(errorMessage: string): { title: string; suggestion: string; suggestedMethod?: string } {
    // Cek error terkait data tidak cukup
    if (errorMessage.includes("tidak cukup") || errorMessage.includes("Minimal") || errorMessage.includes("data historis")) {
      // Cek apakah error terkait jenis kendaraan
      if (errorMessage.includes("jenis kendaraan yang dipilih")) {
        const match = errorMessage.match(/hanya ada (\d+) periode|(\d+) periode/i);
        const actualPeriods = match ? parseInt(match[1] || match[2]) : 0;
        return {
          title: "Data Jenis Kendaraan Tidak Cukup",
          suggestion: `Data untuk jenis kendaraan yang dipilih hanya ${actualPeriods} periode. Hybrid Prediction membutuhkan minimal 24 periode untuk jenis kendaraan tertentu. Pilih "Semua Jenis Kendaraan" atau tambahkan lebih banyak data historis.`,
        };
      }

      const match = errorMessage.match(/hanya ada (\d+) periode|(\d+) periode/i);
      const actualPeriods = match ? parseInt(match[1] || match[2]) : 0;

      if (actualPeriods < 3) {
        return {
          title: "Data Sangat Terbatas",
          suggestion: "Data yang tersedia kurang dari 3 periode. Tambahkan lebih banyak data historis (minimal 3 periode) atau coba tanpa memilih jenis kendaraan tertentu (gunakan data global).",
        };
      } else if (actualPeriods < 12) {
        return {
          title: "Data Terbatas",
          suggestion: `Data yang tersedia hanya ${actualPeriods} periode. Coba tanpa memilih jenis kendaraan tertentu untuk menggunakan data global, atau tambahkan lebih banyak data historis.`,
        };
      } else {
        return {
          title: "Data Tidak Cukup",
          suggestion: "Coba tanpa memilih jenis kendaraan tertentu untuk menggunakan data global yang mungkin memiliki lebih banyak data.",
        };
      }
    }

    // Default suggestion
    return {
      title: "Terjadi Kesalahan",
      suggestion: "Periksa kembali parameter yang dimasukkan atau coba tanpa filter jenis kendaraan.",
    };
  }

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

            {/* Data Availability Info */}
            {dataCheck && (
              <Card className="mb-6 bg-info/5 border-info/20">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-info/10 rounded-lg flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-info">
                      Ketersediaan Data Historis
                      {isCheckingData && <span className="loading loading-spinner loading-xs ml-2"></span>}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                      <div>
                        <p className="text-[10px] text-base-content/60">Jumlah Data</p>
                        <p className="text-sm font-semibold">{dataCheck.jumlah_data} periode</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-base-content/60">Periode</p>
                        <p className="text-xs">
                          {dataCheck.data_dari} s/d {dataCheck.data_sampai}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-base-content/60">Status TES</p>
                        <p className={`text-xs font-semibold ${dataCheck.tes_available ? 'text-success' : 'text-error'}`}>
                          {dataCheck.tes_available ? '✓ Tersedia' : '✗ Tidak Tersedia'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-base-content/60">Rekomendasi</p>
                        <p className="text-xs">{dataCheck.recommendation}</p>
                      </div>
                    </div>
                    <div className="mt-2 p-2 bg-base-200 rounded text-xs text-base-content/70">
                      💡 Hybrid Prediction menggunakan TES sebagai base method yang membutuhkan <strong>minimal 24 periode</strong> data. Jika memilih jenis kendaraan tertentu, pastikan data untuk jenis kendaraan tersebut mencukupi.
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Error Display */}
            {generateError && (
              <Card className="mb-6 bg-error/10 border-error/30">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 bg-error/20 rounded-lg flex items-center justify-center shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-error">
                        {getSuggestionFromError(generateError).title}
                      </p>
                      <p className="text-xs text-base-content/70 mt-1 mb-2">
                        {generateError}
                      </p>
                      <p className="text-xs text-base-content/70">
                        <strong>Saran:</strong> {getSuggestionFromError(generateError).suggestion}
                      </p>
                      {generateError.includes("jenis kendaraan") && (
                        <Button
                          onClick={() => {
                            formMethods.setValue("jenis_kendaraan_id", null);
                            setGenerateError(null);
                          }}
                          variant="outline"
                          size="sm"
                          className="mt-3"
                        >
                          Hapus Filter Jenis Kendaraan
                        </Button>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setGenerateError(null)}
                    className="btn btn-ghost btn-sm btn-circle"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </Card>
            )}

            {/* Form */}
            <Card className="mb-6">
              <h3 className="text-lg font-semibold mb-4">
                Parameter Prediksi
              </h3>
              <form onSubmit={formMethods.handleSubmit(handleSubmit)}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="label">
                      <span className="label-text font-medium">
                        Jenis Kendaraan
                      </span>
                      <span className="label-text-alt text-base-content/60">
                        (Opsional)
                      </span>
                    </label>
                    <Select
                      options={jenisKendaraanOptions}
                      placeholder="Semua Jenis Kendaraan"
                      isClearable={true}
                      value={
                        formMethods.watch("jenis_kendaraan_id")
                          ? jenisKendaraanOptions.find(
                              (opt) =>
                                opt.value ===
                                formMethods.watch("jenis_kendaraan_id")?.toString()
                            ) || null
                          : null
                      }
                      onChange={(selected) => {
                        const sel = selected as SelectOption | null;
                        formMethods.setValue(
                          "jenis_kendaraan_id",
                          sel ? Number(sel.value) : null
                        );
                        // Refresh data check saat jenis kendaraan berubah
                        checkDataAvailability(sel ? Number(sel.value) : undefined);
                      }}
                    />
                  </div>

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
                    <Select
                      options={[
                        { value: 1, label: "Januari" },
                        { value: 2, label: "Februari" },
                        { value: 3, label: "Maret" },
                        { value: 4, label: "April" },
                        { value: 5, label: "Mei" },
                        { value: 6, label: "Juni" },
                        { value: 7, label: "Juli" },
                        { value: 8, label: "Agustus" },
                        { value: 9, label: "September" },
                        { value: 10, label: "Oktober" },
                        { value: 11, label: "November" },
                        { value: 12, label: "Desember" },
                      ]}
                      placeholder="Pilih bulan"
                      value={
                        formMethods.watch("bulan_prediksi")
                          ? {
                              value: formMethods.watch("bulan_prediksi"),
                              label: new Date(2025, formMethods.watch("bulan_prediksi") - 1, 1)
                                .toLocaleDateString("id-ID", { month: "long" }),
                            }
                          : null
                      }
                      onChange={(selected) => {
                        formMethods.setValue("bulan_prediksi", selected ? Number((selected as SelectOption).value) : 1);
                      }}
                    />
                    {formMethods.formState.errors.bulan_prediksi && (
                      <span className="text-error text-xs">
                        {formMethods.formState.errors.bulan_prediksi.message}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-end items-center gap-3">
                  {dataCheck && (() => {
                    const selectedJenisKendaraanId = formMethods.watch("jenis_kendaraan_id");
                    const isJenisKendaraanSelected = selectedJenisKendaraanId && selectedJenisKendaraanId > 0;

                    if (isJenisKendaraanSelected && dataCheck.jumlah_data < 24) {
                      return (
                        <span className="text-xs text-error">
                          ⚠ Data jenis kendaraan tidak mencukupi (minimal 24 periode, saat ini: {dataCheck.jumlah_data})
                        </span>
                      );
                    }
                    if (!dataCheck.hybrid_available) {
                      return (
                        <span className="text-xs text-error">
                          ⚠ Data tidak mencukupi (minimal 3 periode)
                        </span>
                      );
                    }
                    return null;
                  })()}
                  <Button
                    type="submit"
                    variant="primary"
                    loading={isLoading || isSubmitting || isCheckingData}
                    disabled={dataCheck ? (() => {
                      const selectedJenisKendaraanId = formMethods.watch("jenis_kendaraan_id");
                      const isJenisKendaraanSelected = selectedJenisKendaraanId && selectedJenisKendaraanId > 0;

                      // Jika jenis kendaraan dipilih, butuh 24 periode
                      if (isJenisKendaraanSelected) {
                        return dataCheck.jumlah_data < 24;
                      }
                      // Jika tidak ada filter jenis kendaraan, butuh 3 periode
                      return !dataCheck.hybrid_available;
                    })() : false}
                  >
                    Generate Hybrid Prediction
                  </Button>
                </div>
              </form>
            </Card>

            {/* Results */}
            {result && (
              <>
                {/* Fallback Warning */}
                {result.used_fallback && (
                  <Card className="mb-4 bg-warning/10 border-warning/30">
                    <div className="flex items-start gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-warning shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div>
                        <p className="text-sm font-semibold text-warning">Menggunakan Data Global</p>
                        <p className="text-xs text-base-content/70 mt-1">
                          Data historis untuk jenis kendaraan yang dipilih tidak mencukupi. Prediksi menggunakan data global (semua jenis kendaraan) sebagai alternatif.
                        </p>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Base Method Info */}
                {result.base_method && result.base_method !== 'TES' && (
                  <Card className="mb-4 bg-info/10 border-info/30">
                    <div className="flex items-start gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-info shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-sm font-semibold text-info">Metode Base: {result.base_method}</p>
                        <p className="text-xs text-base-content/70 mt-1">
                          Data historis terbatas ({result.jumlah_data_training} periode). Menggunakan {result.base_method} sebagai base prediction.
                          TES membutuhkan minimal 24 periode data.
                        </p>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Main Prediction */}
                <Card className="mb-6 border-success/30">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                      Hasil Prediksi Hybrid {result.base_method && `(${result.base_method})`} ({result.scenario.toUpperCase()})
                    </h3>
                    <div className="flex gap-2">
                      {!result.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleSave}
                          className="btn-circle text-success"
                          title="Simpan ke Database"
                          disabled={isSaving}
                        >
                          <Save className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDelete}
                        className="btn-circle text-error"
                        title={result.id ? "Hapus dari Database" : "Hapus dari Daftar"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

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
