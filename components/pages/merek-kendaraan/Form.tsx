/** @format */

"use client";

import { FormProvider } from "react-hook-form";
import { Modal, Button } from "@/components/ui";
import { FormInput } from "@/components/ui/Form";
import type {
  MerekKendaraan,
  MerekKendaraanFormData,
} from "@/services/merekKendaraanService";
import { UseFormReturn } from "react-hook-form";

interface FormProps {
  isOpen: boolean;
  isSubmitting: boolean;
  selectedItem: MerekKendaraan | null;
  formMethods: UseFormReturn<MerekKendaraanFormData>;
  onSubmit: (data: MerekKendaraanFormData) => void;
  onClose: () => void;
  className?: string;
}

export default function Form({
  isOpen,
  isSubmitting,
  selectedItem,
  formMethods,
  onSubmit,
  onClose,
  className = "",
}: FormProps) {
  const { handleSubmit } = formMethods;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={selectedItem ? "Edit Merek Kendaraan" : "Tambah Merek Kendaraan"}
      size="md"
    >
      <FormProvider {...formMethods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className={`grid grid-cols-8 gap-4 ${className}`}
        >
          <FormInput
            name="nama"
            label="Nama Merek"
            placeholder="Contoh: Toyota, Honda, Yamaha"
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
