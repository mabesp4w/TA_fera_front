/** @format */

"use client";

import { FormProvider } from "react-hook-form";
import { Modal, Button } from "@/components/ui";
import { FormInput, FormSelect } from "@/components/ui/Form";
import type { SelectOption } from "@/components/ui/types";
import type {
  JenisKendaraan,
  JenisKendaraanFormData,
} from "@/services/jenisKendaraanService";
import { UseFormReturn } from "react-hook-form";

interface FormProps {
  isOpen: boolean;
  isSubmitting: boolean;
  selectedItem: JenisKendaraan | null;
  formMethods: UseFormReturn<JenisKendaraanFormData>;
  kategoriOptions: SelectOption[];
  onSubmit: (data: JenisKendaraanFormData) => void;
  onClose: () => void;
  className?: string;
}

export default function Form({
  isOpen,
  isSubmitting,
  selectedItem,
  formMethods,
  kategoriOptions,
  onSubmit,
  onClose,
  className = "",
}: FormProps) {
  const { handleSubmit } = formMethods;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={selectedItem ? "Edit Jenis Kendaraan" : "Tambah Jenis Kendaraan"}
      size="md"
    >
      <FormProvider {...formMethods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className={`grid grid-cols-8 gap-4 ${className}`}
        >
          <FormInput
            name="nama"
            label="Nama Jenis Kendaraan"
            placeholder="Contoh: Sepeda Motor Roda 2"
            className="col-span-8"
          />

          <FormSelect
            name="kategori"
            label="Kategori"
            options={kategoriOptions}
            placeholder="Pilih kategori"
            menuPosition="fixed"
            menuPlacement="bottom"
            className="col-span-8"
          />

          <div className="col-span-8 flex gap-2 justify-end pt-4">
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
