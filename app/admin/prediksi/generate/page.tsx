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
  type PredictionGenerateRequest,
  type PredictionResult,
} from "@/services/prediksiService";
import { jenisKendaraanService } from "@/services/jenisKendaraanService";
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
  }, []);

  // Handle open generate form
  const handleOpenForm = () => {
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

      const submitData: PredictionGenerateRequest = {
        metode: formData.metode || "SES",
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

      const saveData: PredictionGenerateRequest & { keterangan?: string } = {
        metode: result.metode,
        tahun_prediksi: result.tahun_prediksi,
        bulan_prediksi: result.bulan_prediksi,
        jenis_kendaraan_id: result.jenis_kendaraan,
        alpha: result.alpha,
        beta: result.beta,
        gamma: result.gamma,
        seasonal_periods: result.seasonal_periods,
        keterangan: `Disimpan dari halaman generate prediksi`,
      };

      const savedResult = await prediksiService.save(saveData);

      // Update prediction in the list with saved data
      setPredictions((prev) =>
        prev.map((p) =>
          p === result ? { ...result, ...savedResult } : p
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
          onClose={() => {
            setIsModalOpen(false);
            reset();
          }}
        />
      </div>
    </AdminRoute>
  );
}
