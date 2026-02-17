/** @format */

"use client";

import { FormProvider, useWatch } from "react-hook-form";
import { Modal, Button } from "@/components/ui";
import { FormInput, FormSelect } from "@/components/ui/Form";
import type { SelectOption } from "@/components/ui/types";
import type { PredictionGenerateRequest, PredictionMethod } from "@/services/prediksiService";
import { UseFormReturn } from "react-hook-form";
import { Brain } from "lucide-react";

interface FormProps {
  isOpen: boolean;
  loading: boolean;
  formMethods: UseFormReturn<PredictionGenerateRequest>;
  jenisKendaraanOptions: SelectOption[];
  onSubmit: (data: PredictionGenerateRequest) => void;
  onClose: () => void;
}

const BULAN_OPTIONS: SelectOption[] = [
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
];

const METODE_OPTIONS: { value: PredictionMethod; label: string; description: string }[] = [
  { value: "SES", label: "SES - Simple Exponential Smoothing", description: "Untuk data tanpa trend dan musiman" },
  { value: "DES", label: "DES - Double Exponential Smoothing", description: "Untuk data dengan trend" },
  { value: "TES", label: "TES - Triple Exponential Smoothing", description: "Untuk data dengan trend dan musiman" },
];

export default function Form({
  isOpen,
  loading,
  formMethods,
  jenisKendaraanOptions,
  onSubmit,
  onClose,
}: FormProps) {
  const { handleSubmit, control } = formMethods;
  
  // Watch metode untuk menampilkan parameter yang sesuai
  const selectedMetode = useWatch({ control, name: "metode" }) as PredictionMethod;

  // Get description untuk metode yang dipilih
  const metodeInfo = METODE_OPTIONS.find(m => m.value === selectedMetode);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Generate Prediksi Pendapatan"
      size="2xl"
    >
      <FormProvider {...formMethods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Metode Selection */}
          <FormSelect
            name="metode"
            label="Metode Prediksi"
            options={METODE_OPTIONS.map(m => ({ value: m.value, label: m.label }))}
            placeholder="Pilih metode prediksi"
            menuPosition="fixed"
            menuPlacement="bottom"
          />

          {/* Info Metode */}
          <div className="text-xs text-base-content/70 bg-base-200 p-3 rounded-xl">
            <div className="flex items-start gap-2">
              <Brain className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-1">
                  {selectedMetode === "SES" && "SES (Simple Exponential Smoothing)"}
                  {selectedMetode === "DES" && "DES (Double Exponential Smoothing)"}
                  {selectedMetode === "TES" && "TES (Triple Exponential Smoothing / Holt-Winters)"}
                </p>
                <p>
                  {metodeInfo?.description || "Pilih metode prediksi"}.{" "}
                  {selectedMetode === "SES" && "Cocok untuk data stabil tanpa trend. Minimal data: 12 periode."}
                  {selectedMetode === "DES" && "Cocok untuk data dengan trend naik/turun. Minimal data: 3 periode."}
                  {selectedMetode === "TES" && "Cocok untuk data dengan trend dan musiman. Minimal data: 24 periode."}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Jenis Kendaraan */}
            {jenisKendaraanOptions.length > 0 && (
              <FormSelect
                name="jenis_kendaraan_id"
                label="Jenis Kendaraan (Opsional)"
                options={[
                  { value: "", label: "Semua Jenis Kendaraan" },
                  ...jenisKendaraanOptions,
                ]}
                placeholder="Pilih jenis kendaraan"
                menuPosition="fixed"
                menuPlacement="bottom"
              />
            )}

            {/* Tahun Prediksi */}
            <FormInput
              name="tahun_prediksi"
              label="Tahun Prediksi"
              type="number"
              placeholder="2025"
            />
          </div>

          {/* Bulan Prediksi */}
          <FormSelect
            name="bulan_prediksi"
            label="Bulan Prediksi"
            options={BULAN_OPTIONS}
            placeholder="Pilih bulan"
            menuPosition="fixed"
            menuPlacement="bottom"
          />

          {/* Parameter Opsional */}
          <div className="border-t border-base-200 pt-4">
            <p className="text-sm font-medium mb-3">Parameter Model (Opsional)</p>
            <p className="text-xs text-base-content/50 mb-3">
              Kosongkan untuk auto-optimization
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Alpha - smoothing level (untuk semua metode) */}
              <FormInput
                name="alpha"
                label="Alpha (Level)"
                type="number"
                step="0.01"
                min="0"
                max="1"
                placeholder="0.1 - 1.0"
              />
              
              {/* Beta - trend smoothing (untuk DES dan TES) */}
              {(selectedMetode === "DES" || selectedMetode === "TES") && (
                <FormInput
                  name="beta"
                  label="Beta (Trend)"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  placeholder="0.1 - 1.0"
                />
              )}
              
              {/* Gamma - seasonal smoothing (hanya untuk TES) */}
              {selectedMetode === "TES" && (
                <FormInput
                  name="gamma"
                  label="Gamma (Seasonal)"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  placeholder="0.1 - 1.0"
                />
              )}
              
              {/* Seasonal periods (hanya untuk TES) */}
              {selectedMetode === "TES" && (
                <FormInput
                  name="seasonal_periods"
                  label="Seasonal Periods"
                  type="number"
                  min="2"
                  max="24"
                  placeholder="Default: 12 (bulanan)"
                />
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t border-base-200">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate Prediksi"}
            </Button>
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
}
