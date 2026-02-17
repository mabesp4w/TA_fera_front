/** @format */

"use client";

import { FormProvider } from "react-hook-form";
import { Modal, Button } from "@/components/ui";
import { FormInput, FormSelect } from "@/components/ui/Form";
import type { SelectOption } from "@/components/ui/types";
import type {
  KendaraanBermotor,
  KendaraanBermotorFormData,
  BBMType,
} from "@/services/kendaraanBermotorService";
import { UseFormReturn } from "react-hook-form";

interface FormProps {
  isOpen: boolean;
  isSubmitting: boolean;
  selectedItem: KendaraanBermotor | null;
  formMethods: UseFormReturn<KendaraanBermotorFormData>;
  jenisOptions?: SelectOption[];
  merekOptions?: SelectOption[];
  typeKendaraanOptions?: SelectOption[];
  wajibPajakOptions?: SelectOption[];
  bbmOptions?: SelectOption[];
  onSubmit: (data: KendaraanBermotorFormData) => void;
  onClose: () => void;
}

const BBM_SELECT_OPTIONS: SelectOption[] = [
  { value: "BENSIN", label: "Bensin" },
  { value: "SOLAR", label: "Solar" },
  { value: "LISTRIK", label: "Listrik" },
  { value: "HYBRID", label: "Hybrid" },
];

export default function Form({
  isOpen,
  isSubmitting,
  selectedItem,
  formMethods,
  jenisOptions,
  merekOptions,
  typeKendaraanOptions,
  wajibPajakOptions,
  bbmOptions,
  onSubmit,
  onClose,
}: FormProps) {
  const { handleSubmit } = formMethods;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={selectedItem ? "Edit Kendaraan" : "Tambah Kendaraan"}
      size="2xl"
    >
      <FormProvider {...formMethods}>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-12 gap-4">
          {/* Jenis Kendaraan */}
          {jenisOptions && jenisOptions.length > 0 && (
            <FormSelect
              name="jenis"
              label="Jenis Kendaraan"
              options={jenisOptions}
              placeholder="Pilih jenis"
              menuPosition="fixed"
              menuPlacement="bottom"
              className="col-span-12 sm:col-span-6"
            />
          )}

          {/* Merek & Type Kendaraan */}
          <div className="col-span-12 sm:col-span-6" />
          {merekOptions && merekOptions.length > 0 && (
            <FormSelect
              name="merek"
              label="Merek Kendaraan"
              options={merekOptions}
              placeholder="Pilih merek"
              menuPosition="fixed"
              menuPlacement="bottom"
              className="col-span-12 sm:col-span-6"
            />
          )}
          {typeKendaraanOptions && typeKendaraanOptions.length > 0 && (
            <FormSelect
              name="type_kendaraan"
              label="Type Kendaraan"
              options={typeKendaraanOptions}
              placeholder="Pilih type"
              menuPosition="fixed"
              menuPlacement="bottom"
              className="col-span-12 sm:col-span-6"
            />
          )}

          {/* Wajib Pajak */}
          {wajibPajakOptions && wajibPajakOptions.length > 0 && (
            <FormSelect
              name="wajib_pajak"
              label="Pemilik (Wajib Pajak)"
              options={wajibPajakOptions}
              placeholder="Pilih pemilik"
              menuPosition="fixed"
              menuPlacement="bottom"
              isClearable
              className="col-span-12"
            />
          )}

          {/* No. Polisi, No. Rangka, No. Mesin */}
          <FormInput
            name="no_polisi"
            label="No. Polisi"
            placeholder="Contoh: B 1234 ABC"
            className="col-span-12 sm:col-span-4"
          />
          <FormInput
            name="no_rangka"
            label="No. Rangka"
            placeholder="Masukkan nomor rangka"
            className="col-span-12 sm:col-span-4"
          />
          <FormInput
            name="no_mesin"
            label="No. Mesin"
            placeholder="Masukkan nomor mesin"
            className="col-span-12 sm:col-span-4"
          />

          {/* Tahun Buat, Jml CC, BBM */}
          <FormInput
            name="tahun_buat"
            label="Tahun Pembuatan"
            type="number"
            placeholder="Contoh: 2020"
            className="col-span-12 sm:col-span-4"
          />
          <FormInput
            name="jml_cc"
            label="Kapasitas Mesin (CC)"
            type="number"
            placeholder="Contoh: 1500"
            className="col-span-12 sm:col-span-4"
          />
          <FormSelect
            name="bbm"
            label="Bahan Bakar"
            options={bbmOptions || BBM_SELECT_OPTIONS}
            placeholder="Pilih BBM"
            className="col-span-12 sm:col-span-4"
          />

          <div className="col-span-12 flex gap-2 justify-end pt-4">
            <Button type="button" variant="ghost" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {selectedItem ? "Perbarui" : "Simpan"}
            </Button>
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
}
