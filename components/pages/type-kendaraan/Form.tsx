/** @format */

"use client";

import { FormProvider } from "react-hook-form";
import { Modal, Button } from "@/components/ui";
import { FormInput, FormSelect } from "@/components/ui/Form";
import type { SelectOption } from "@/components/ui/types";
import type {
  TypeKendaraan,
  TypeKendaraanFormData,
} from "@/services/typeKendaraanService";
import { UseFormReturn } from "react-hook-form";

interface FormProps {
  isOpen: boolean;
  isSubmitting: boolean;
  selectedItem: TypeKendaraan | null;
  formMethods: UseFormReturn<TypeKendaraanFormData>;
  merekOptions?: SelectOption[];
  onSubmit: (data: TypeKendaraanFormData) => void;
  onClose: () => void;
  className?: string;
}

export default function Form({
  isOpen,
  isSubmitting,
  selectedItem,
  formMethods,
  merekOptions,
  onSubmit,
  onClose,
  className = "",
}: FormProps) {
  const { handleSubmit } = formMethods;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={selectedItem ? "Edit Type Kendaraan" : "Tambah Type Kendaraan"}
      size="md"
    >
      <FormProvider {...formMethods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className={`grid grid-cols-8 gap-4 ${className}`}
        >
          {merekOptions && merekOptions.length > 0 && (
            <FormSelect
              name="merek"
              label="Merek Kendaraan"
              options={merekOptions}
              placeholder="Pilih merek"
              menuPosition="fixed"
              menuPlacement="bottom"
              className="col-span-8"
            />
          )}

          <FormInput
            name="nama"
            label="Nama Type"
            placeholder="Contoh: Avanza, Vario 150, Fortuner"
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
