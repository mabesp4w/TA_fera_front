/** @format */

"use client";

import { FormProvider } from "react-hook-form";
import { Modal, Button } from "@/components/ui";
import { FormInput, FormSelect } from "@/components/ui/Form";
import type { SelectOption } from "@/components/ui/types";
import type { Kelurahan, KelurahanFormData } from "@/services/kelurahanService";
import { UseFormReturn } from "react-hook-form";

interface FormProps {
  isOpen: boolean;
  isSubmitting: boolean;
  selectedItem: Kelurahan | null;
  formMethods: UseFormReturn<KelurahanFormData>;
  kecamatanOptions?: SelectOption[];
  onSubmit: (data: KelurahanFormData) => void;
  onClose: () => void;
  className?: string;
}

export default function Form({
  isOpen,
  isSubmitting,
  selectedItem,
  formMethods,
  kecamatanOptions,
  onSubmit,
  onClose,
  className = "",
}: FormProps) {
  const { handleSubmit } = formMethods;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={selectedItem ? "Edit Kelurahan" : "Tambah Kelurahan"}
      size="md"
    >
      <FormProvider {...formMethods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className={`grid grid-cols-8 gap-4 ${className}`}
        >
          <FormInput
            name="nama"
            label="Nama Kelurahan"
            placeholder="Contoh: Abepura Kota"
            className="col-span-8"
          />

          {kecamatanOptions && kecamatanOptions.length > 0 && (
            <FormSelect
              name="kecamatan"
              label="Kecamatan"
              options={kecamatanOptions}
              placeholder="Pilih kecamatan"
              menuPosition="fixed"
              menuPlacement="bottom"
              className="col-span-8"
            />
          )}

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

