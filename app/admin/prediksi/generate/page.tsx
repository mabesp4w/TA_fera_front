/** @format */

"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import AdminRoute from "@/components/AdminRoute";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Card, Button } from "@/components/ui";
import { Form, ResultCard } from "@/components/pages/prediksi";
import type { SelectOption } from "@/components/ui/types";
import {
  prediksiService,
  type PredictionMethod,
  type PredictionGenerateRequest,
  type PredictionResult,
} from "@/services/prediksiService";
import { jenisKendaraanService } from "@/services/jenisKendaraanService";
import { prediksiCheckService, type DataCheckResponse } from "@/services/prediksiCheckService";
import { toast } from "@/services";
import { Plus, Brain, FileX, Sparkles } from "lucide-react";

// Validation schema - SES, DES, TES
const prediksiSchema = yup.object().shape({
  metode: yup.string().required("Metode wajib dipilih"),
  jenis_kendaraan_id: yup.number().nullable().notRequired(),
  tahun_prediksi: yup
    .number()
    .required("Tahun prediksi wajib diisi")
    .min(2020, "Tahun minimal 2020")
    .max(2100, "Tahun maksimal 2100")
    .typeError("Tahun harus berupa angka"),
  bulan_prediksi: yup
    .number()
    .required("Bulan prediksi wajib dipilih")
    .min(1, "Bulan minimal 1")
    .max(12, "Bulan maksimal 12")
    .typeError("Bulan harus berupa angka"),
  alpha: yup.number().min(0).max(1).nullable().notRequired(),
  beta: yup.number().min(0).max(1).nullable().notRequired(),
  gamma: yup.number().min(0).max(1).nullable().notRequired(),
  seasonal_periods: yup.number().min(2).max(24).nullable().notRequired(),
});

export default function PrediksiGeneratePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [jenisKendaraanOptions, setJenisKendaraanOptions] = useState<
    SelectOption[]
  >([]);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [dataCheck, setDataCheck] = useState<DataCheckResponse | null>(null);
  const [isCheckingData, setIsCheckingData] = useState(false);

  const formMethods = useForm<PredictionGenerateRequest>({
    resolver: yupResolver(prediksiSchema) as any,
    defaultValues: {
      metode: "SES",
      tahun_prediksi: 2025,
      bulan_prediksi: 12,
    },
  });

  const { reset } = formMethods;

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
    // Cek data awal
    checkDataAvailability();
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

  // Handle open generate form
  const handleOpenForm = () => {
    setGenerateError(null);
    reset({
      metode: "SES",
      tahun_prediksi: 2025,
      bulan_prediksi: 12,
    });
    setIsModalOpen(true);
  };

  // Handle submit form
  const onSubmit = async (formData: PredictionGenerateRequest) => {
    try {
      setIsGenerating(true);
      setGenerateError(null);

      // Cek ketersediaan data terlebih dahulu
      const check = await prediksiCheckService.checkData(
        formData.jenis_kendaraan_id && formData.jenis_kendaraan_id > 0 ? formData.jenis_kendaraan_id : undefined
      );

      // Update data check state
      setDataCheck(check);

      const metode = formData.metode || "SES";

      // Validasi berdasarkan metode
      let minRequired = 0;
      if (metode === "TES") {
        minRequired = 24;
      } else if (metode === "SES") {
        minRequired = 12;
      } else if (metode === "DES") {
        minRequired = 3;
      }

      if (check.jumlah_data < minRequired) {
        setGenerateError(
          `Data historis tidak cukup untuk metode ${metode}. Minimal ${minRequired} periode, tetapi hanya ada ${check.jumlah_data} periode.`
        );
        toast.error(
          `Data historis tidak cukup untuk metode ${metode}. Minimal ${minRequired} periode, tetapi hanya ada ${check.jumlah_data} periode.`
        );
        setIsGenerating(false);
        return;
      }

      const submitData: PredictionGenerateRequest = {
        metode: metode,
        tahun_prediksi: formData.tahun_prediksi,
        bulan_prediksi: formData.bulan_prediksi,
        jenis_kendaraan_id: formData.jenis_kendaraan_id || undefined,
        alpha: formData.alpha,
        beta: formData.beta,
        gamma: formData.gamma,
        seasonal_periods: formData.seasonal_periods,
      };

      const result = await prediksiService.generate(submitData);

      // Add new prediction to the list
      setPredictions((prev) => [result, ...prev]);

      toast.success(
        `Prediksi ${result.metode} berhasil dihasilkan untuk ${formatRupiah(result.nilai_prediksi)}`
      );

      setIsModalOpen(false);
      reset();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Gagal generate prediksi";
      setGenerateError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle delete prediction
  const handleDelete = async (result: PredictionResult) => {
    // Jika belum ada id (belum disimpan ke database), hapus dari list saja
    if (!result.id) {
      setPredictions((prev) => prev.filter((p) => p !== result));
      toast.success("Prediksi dihapus dari daftar");
      return;
    }

    // Jika sudah ada id (sudah disimpan ke database), hapus dari database
    try {
      await prediksiService.delete(result.id);
      setPredictions((prev) => prev.filter((p) => p.id !== result.id));
      toast.success("Prediksi berhasil dihapus dari database");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Gagal menghapus prediksi";
      toast.error(errorMessage);
    }
  };

  // Handle save prediction to database
  const handleSave = async (result: PredictionResult) => {
    try {
      setIsSaving(true);

      const saveData: PredictionGenerateRequest & { keterangan?: string; prediction_data?: PredictionResult } = {
        metode: result.metode,
        tahun_prediksi: result.tahun_prediksi,
        bulan_prediksi: result.bulan_prediksi,
        jenis_kendaraan_id: result.jenis_kendaraan,
        alpha: result.alpha,
        beta: result.beta,
        gamma: result.gamma,
        seasonal_periods: result.seasonal_periods,
        keterangan: `Disimpan dari halaman generate prediksi`,
        prediction_data: result,
      };

      const savedResult = await prediksiService.save(saveData);

      // Update prediction in the list - pertahankan nilai prediksi asli, hanya update id & tanggal
      setPredictions((prev) =>
        prev.map((p) =>
          p === result ? { ...result, id: savedResult.id, tanggal_prediksi: savedResult.tanggal_prediksi } : p
        )
      );

      toast.success("Prediksi berhasil disimpan ke database");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Gagal menyimpan prediksi";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // Helper untuk format currency
  function formatRupiah(amount: number | string): string {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  }

  // Helper untuk mendapatkan saran dari error message
  function getSuggestionFromError(errorMessage: string): { title: string; suggestion: string; suggestedMethod?: string } {
    // Cek error terkait data tidak cukup
    if (errorMessage.includes("tidak cukup") || errorMessage.includes("Minimal")) {
      const match = errorMessage.match(/hanya ada (\d+) periode/);
      const actualPeriods = match ? parseInt(match[1]) : 0;

      if (actualPeriods < 3) {
        return {
          title: "Data Sangat Terbatas",
          suggestion: "Data yang tersedia kurang dari 3 periode. Tambahkan lebih banyak data historis (minimal 3 periode) atau gunakan Hybrid Prediction yang lebih toleran terhadap data terbatas.",
          suggestedMethod: undefined
        };
      } else if (actualPeriods < 12) {
        return {
          title: "Data Terbatas untuk Metode yang Dipilih",
          suggestion: `Data yang tersedia hanya ${actualPeriods} periode. Gunakan DES (minimal 3 periode) atau SES (minimal 3 periode) sebagai alternatif.`,
          suggestedMethod: actualPeriods >= 3 ? "DES" : undefined
        };
      } else if (actualPeriods < 24) {
        return {
          title: "Data Tidak Cukup untuk TES",
          suggestion: `Data yang tersedia hanya ${actualPeriods} periode. Gunakan SES (minimal 12 periode) atau DES (minimal 3 periode) sebagai alternatif.`,
          suggestedMethod: actualPeriods >= 12 ? "SES" : "DES"
        };
      }
    }

    // Default suggestion
    return {
      title: "Terjadi Kesalahan",
      suggestion: "Periksa kembali parameter yang dimasukkan atau coba metode prediksi lain."
    };
  }

  return (
    <AdminRoute>
      <div className="min-h-screen bg-base-200 flex overflow-x-hidden">
        <Sidebar />

        <div className="flex-1 lg:ml-64 overflow-x-hidden">
          {/* Header */}
          <Header
            variant="admin"
            title="Generate Prediksi Pendapatan"
            subtitle="Hasilkan prediksi pendapatan pajak menggunakan metode Exponential Smoothing"
            showThemeSwitcher={true}
          />

          {/* Content */}
          <div className="p-4 lg:p-8 min-w-0">
            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Brain className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-base-content/70">Metode</p>
                    <p className="text-sm font-semibold">SES, DES, TES</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-xs text-base-content/70">Akurasi</p>
                    <p className="text-sm font-semibold">MAPE &lt; 10% = Sangat Baik</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-info/10 rounded-lg flex items-center justify-center">
                    <Plus className="w-5 h-5 text-info" />
                  </div>
                  <div>
                    <p className="text-xs text-base-content/70">Generate</p>
                    <p className="text-sm font-semibold">Buat Prediksi Baru</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Info Card - Metode Explanation */}
            <Card className="p-4 mb-6 bg-info/5 border-info/20">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-info/10 rounded-lg flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-info">Panduan Pemilihan Metode</p>
                  <ul className="text-xs text-base-content/70 mt-1 space-y-1">
                    <li><strong>SES (Simple ES):</strong> Data stabil tanpa trend dan musiman. Minimal 12 periode.</li>
                    <li><strong>DES (Double ES):</strong> Data dengan trend naik/turun. Minimal 3 periode.</li>
                    <li><strong>TES (Triple ES):</strong> Data dengan trend dan musiman. Minimal 24 periode.</li>
                  </ul>
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
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-2">
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
                        <p className="text-[10px] text-base-content/60">Status SES</p>
                        <p className={`text-xs font-semibold ${dataCheck.ses_available ? 'text-success' : 'text-error'}`}>
                          {dataCheck.ses_available ? '✓ Tersedia' : '✗ Tidak Tersedia'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-base-content/60">Status DES</p>
                        <p className={`text-xs font-semibold ${dataCheck.des_available ? 'text-success' : 'text-error'}`}>
                          {dataCheck.des_available ? '✓ Tersedia' : '✗ Tidak Tersedia'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-base-content/60">Status TES</p>
                        <p className={`text-xs font-semibold ${dataCheck.tes_available ? 'text-success' : 'text-error'}`}>
                          {dataCheck.tes_available ? '✓ Tersedia' : '✗ Tidak Tersedia'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 p-2 bg-base-200 rounded text-xs text-base-content/70">
                      💡 {dataCheck.recommendation}
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
                      {getSuggestionFromError(generateError).suggestedMethod && (
                        <Button
                          onClick={() => {
                            formMethods.setValue("metode", getSuggestionFromError(generateError).suggestedMethod! as PredictionMethod);
                            setGenerateError(null);
                          }}
                          variant="outline"
                          size="sm"
                          className="mt-3"
                        >
                          Gunakan Metode {getSuggestionFromError(generateError).suggestedMethod}
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

            {/* Generate Button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  Hasil Prediksi
                </h2>
                <p className="text-sm text-base-content/70 mt-1">
                  Prediksi yang telah dihasilkan akan ditampilkan di bawah ini
                </p>
              </div>
              <Button
                onClick={handleOpenForm}
                variant="primary"
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Generate Prediksi
              </Button>
            </div>

            {/* Predictions Grid */}
            {predictions.length === 0 ? (
              <Card className="p-8">
                <div className="flex flex-col items-center justify-center py-12">
                  <FileX className="w-16 h-16 text-base-content/30 mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    Belum ada prediksi
                  </h3>
                  <p className="text-sm text-base-content/70 mb-4 text-center max-w-md">
                    Silakan generate prediksi terlebih dahulu menggunakan metode Exponential Smoothing
                  </p>
                  <Button
                    onClick={handleOpenForm}
                    variant="primary"
                    size="sm"
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    Generate Prediksi
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {predictions.map((prediction, index) => (
                  <ResultCard
                    key={prediction.id || `pred-${index}`}
                    result={prediction}
                    onDelete={handleDelete}
                    onSave={handleSave}
                    isSaving={isSaving}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Generate Form Modal */}
        <Form
          isOpen={isModalOpen}
          loading={isGenerating}
          formMethods={formMethods}
          jenisKendaraanOptions={jenisKendaraanOptions}
          onSubmit={onSubmit}
          onJenisKendaraanChange={(value) => {
            const jenisKendaraanId = value && typeof value === 'number' ? value : undefined;
            checkDataAvailability(jenisKendaraanId);
          }}
          onClose={() => {
            setIsModalOpen(false);
            reset();
          }}
        />
      </div>
    </AdminRoute>
  );
}
