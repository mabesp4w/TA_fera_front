/** @format */

"use client";

import { FormProvider } from "react-hook-form";
import { Modal, Button } from "@/components/ui";
import { FormInput, FormSelect, FormTextarea } from "@/components/ui/Form";
import type { SelectOption } from "@/components/ui/types";
import type {
  WajibPajak,
  WajibPajakFormData,
} from "@/services/wajibPajakService";
import { UseFormReturn } from "react-hook-form";

interface FormProps {
  isOpen: boolean;
  isSubmitting: boolean;
  selectedItem: WajibPajak | null;
  formMethods: UseFormReturn<WajibPajakFormData>;
  kelurahanOptions?: SelectOption[];
  onSubmit: (data: WajibPajakFormData) => void;
  onClose: () => void;
  className?: string;
}

export default function Form({
  isOpen,
  isSubmitting,
  selectedItem,
  formMethods,
  kelurahanOptions,
  onSubmit,
  onClose,
  className = "",
}: FormProps) {
  const { handleSubmit } = formMethods;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={selectedItem ? "Edit Wajib Pajak" : "Tambah Wajib Pajak"}
      size="md"
    >
      <FormProvider {...formMethods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className={`grid grid-cols-8 gap-4 ${className}`}
        >
          {kelurahanOptions && kelurahanOptions.length > 0 && (
            <FormSelect
              name="kelurahan"
              label="Kelurahan"
              options={kelurahanOptions}
              placeholder="Pilih kelurahan"
              menuPosition="fixed"
              menuPlacement="bottom"
              className="col-span-8"
            />
          )}

          <FormInput
            name="no_ktp"
            label="No. KTP"
            placeholder="Masukkan nomor KTP"
            className="col-span-8"
          />

          <FormInput
            name="nama"
            label="Nama Lengkap"
            placeholder="Masukkan nama lengkap"
            className="col-span-8"
          />

          <FormTextarea
            name="alamat"
            label="Alamat"
            placeholder="Masukkan alamat lengkap"
            rows={3}
            containerClassName="col-span-8"
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
