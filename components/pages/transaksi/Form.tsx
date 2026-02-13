/** @format */

"use client";

import { FormProvider } from "react-hook-form";
import { Modal, Button } from "@/components/ui";
import { FormInput, FormSelect } from "@/components/ui/Form";
import { FormDatePicker } from "@/components/ui/Form";
import type { SelectOption } from "@/components/ui/types";
import type {
  TransaksiPajak,
  TransaksiPajakFormData,
} from "@/services/transaksiPajakService";
import { UseFormReturn } from "react-hook-form";

interface FormProps {
  isOpen: boolean;
  isSubmitting: boolean;
  selectedItem: TransaksiPajak | null;
  formMethods: UseFormReturn<TransaksiPajakFormData>;
  kendaraanOptions?: SelectOption[];
  onSubmit: (data: TransaksiPajakFormData) => void;
  onClose: () => void;
}

const BULAN_OPTIONS: SelectOption[] = [
  { value: "1", label: "Januari" },
  { value: "2", label: "Februari" },
  { value: "3", label: "Maret" },
  { value: "4", label: "April" },
  { value: "5", label: "Mei" },
  { value: "6", label: "Juni" },
  { value: "7", label: "Juli" },
  { value: "8", label: "Agustus" },
  { value: "9", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Desember" },
];

export default function Form({
  isOpen,
  isSubmitting,
  selectedItem,
  formMethods,
  kendaraanOptions,
  onSubmit,
  onClose,
}: FormProps) {
  const { handleSubmit, watch } = formMethods;

  const calculateTotal = () => {
    const pokokPkb = Number(watch("pokok_pkb") || 0);
    const dendaPkb = Number(watch("denda_pkb") || 0);
    const tunggakanPokokPkb = Number(watch("tunggakan_pokok_pkb") || 0);
    const tunggakanDendaPkb = Number(watch("tunggakan_denda_pkb") || 0);
    const opsenPokokPkb = Number(watch("opsen_pokok_pkb") || 0);
    const opsenDendaPkb = Number(watch("opsen_denda_pkb") || 0);

    const pokokSwdkllj = Number(watch("pokok_swdkllj") || 0);
    const dendaSwdkllj = Number(watch("denda_swdkllj") || 0);
    const tunggakanPokokSwdkllj = Number(watch("tunggakan_pokok_swdkllj") || 0);
    const tunggakanDendaSwdkllj = Number(watch("tunggakan_denda_swdkllj") || 0);

    const pokokBbnkb = Number(watch("pokok_bbnkb") || 0);
    const dendaBbnkb = Number(watch("denda_bbnkb") || 0);
    const opsenPokokBbnkb = Number(watch("opsen_pokok_bbnkb") || 0);
    const opsenDendaBbnkb = Number(watch("opsen_denda_bbnkb") || 0);

    const totalPkb = pokokPkb + dendaPkb + tunggakanPokokPkb + tunggakanDendaPkb + opsenPokokPkb + opsenDendaPkb;
    const totalSwdkllj = pokokSwdkllj + dendaSwdkllj + tunggakanPokokSwdkllj + tunggakanDendaSwdkllj;
    const totalBbnkb = pokokBbnkb + dendaBbnkb + opsenPokokBbnkb + opsenDendaBbnkb;

    return totalPkb + totalSwdkllj + totalBbnkb;
  };

  const total = calculateTotal();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={selectedItem ? "Edit Transaksi Pajak" : "Tambah Transaksi Pajak"}
      size="3xl"
    >
      <FormProvider {...formMethods}>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-12 gap-4 max-h-[70vh] overflow-y-auto p-2">
          {/* Kendaraan & Periode */}
          {kendaraanOptions && kendaraanOptions.length > 0 && (
            <FormSelect
              name="kendaraan"
              label="Kendaraan"
              options={kendaraanOptions}
              placeholder="Pilih kendaraan"
              menuPosition="fixed"
              menuPlacement="bottom"
              className="col-span-12"
            />
          )}

          <div className="col-span-12 sm:col-span-6">
            <label className="block text-sm font-medium mb-1">Tahun Pajak</label>
            <FormInput
              name="tahun"
              type="number"
              placeholder="2025"
              className="w-full"
            />
          </div>

          <div className="col-span-12 sm:col-span-6">
            <label className="block text-sm font-medium mb-1">Bulan Pajak</label>
            <FormSelect
              name="bulan"
              options={BULAN_OPTIONS}
              placeholder="Pilih bulan"
              menuPosition="fixed"
              menuPlacement="bottom"
              className="w-full"
            />
          </div>

          <div className="col-span-12 sm:col-span-6">
            <label className="block text-sm font-medium mb-1">Jml. Tahun Bayar</label>
            <FormInput
              name="jml_tahun_bayar"
              type="number"
              placeholder="1"
              className="w-full"
            />
          </div>

          <div className="col-span-12 sm:col-span-6">
            <label className="block text-sm font-medium mb-1">Jml. Bulan Bayar</label>
            <FormInput
              name="jml_bulan_bayar"
              type="number"
              placeholder="0"
              className="w-full"
            />
          </div>

          <div className="col-span-12 sm:col-span-6">
            <FormDatePicker
              name="tgl_pajak"
              label="Tanggal Pajak"
              placeholder="Pilih tanggal pajak"
              className="w-full"
            />
          </div>

          <div className="col-span-12 sm:col-span-6">
            <FormDatePicker
              name="tgl_bayar"
              label="Tanggal Bayar"
              placeholder="Pilih tanggal bayar"
              className="w-full"
            />
          </div>

          {/* PKB Section */}
          <div className="col-span-12">
            <h3 className="text-sm font-semibold text-base-content/80 mb-2 pb-1 border-b border-base-300">
              PKB (Pajak Kendaraan Bermotor)
            </h3>
          </div>

          <FormInput
            name="pokok_pkb"
            label="Pokok PKB"
            type="number"
            placeholder="0"
            className="col-span-6 sm:col-span-4"
          />
          <FormInput
            name="denda_pkb"
            label="Denda PKB"
            type="number"
            placeholder="0"
            className="col-span-6 sm:col-span-4"
          />
          <FormInput
            name="opsen_pokok_pkb"
            label="Opsen Pokok PKB"
            type="number"
            placeholder="0"
            className="col-span-6 sm:col-span-4"
          />

          <FormInput
            name="tunggakan_pokok_pkb"
            label="Tunggakan Pokok PKB"
            type="number"
            placeholder="0"
            className="col-span-6 sm:col-span-4"
          />
          <FormInput
            name="tunggakan_denda_pkb"
            label="Tunggakan Denda PKB"
            type="number"
            placeholder="0"
            className="col-span-6 sm:col-span-4"
          />
          <FormInput
            name="opsen_denda_pkb"
            label="Opsen Denda PKB"
            type="number"
            placeholder="0"
            className="col-span-6 sm:col-span-4"
          />

          {/* SWDKLLJ Section */}
          <div className="col-span-12">
            <h3 className="text-sm font-semibold text-base-content/80 mb-2 pb-1 border-b border-base-300">
              SWDKLLJ (Sumbangan Wajib Dana Kecelakaan Lalu Lintas Jalan)
            </h3>
          </div>

          <FormInput
            name="pokok_swdkllj"
            label="Pokok SWDKLLJ"
            type="number"
            placeholder="0"
            className="col-span-6 sm:col-span-4"
          />
          <FormInput
            name="denda_swdkllj"
            label="Denda SWDKLLJ"
            type="number"
            placeholder="0"
            className="col-span-6 sm:col-span-4"
          />

          <FormInput
            name="tunggakan_pokok_swdkllj"
            label="Tunggakan Pokok SWDKLLJ"
            type="number"
            placeholder="0"
            className="col-span-6 sm:col-span-4"
          />
          <FormInput
            name="tunggakan_denda_swdkllj"
            label="Tunggakan Denda SWDKLLJ"
            type="number"
            placeholder="0"
            className="col-span-6 sm:col-span-4"
          />

          {/* BBNKB Section */}
          <div className="col-span-12">
            <h3 className="text-sm font-semibold text-base-content/80 mb-2 pb-1 border-b border-base-300">
              BBNKB (Bea Balik Nama Kendaraan Bermotor)
            </h3>
          </div>

          <FormInput
            name="pokok_bbnkb"
            label="Pokok BBNKB"
            type="number"
            placeholder="0"
            className="col-span-6 sm:col-span-3"
          />
          <FormInput
            name="denda_bbnkb"
            label="Denda BBNKB"
            type="number"
            placeholder="0"
            className="col-span-6 sm:col-span-3"
          />
          <FormInput
            name="opsen_pokok_bbnkb"
            label="Opsen Pokok BBNKB"
            type="number"
            placeholder="0"
            className="col-span-6 sm:col-span-3"
          />
          <FormInput
            name="opsen_denda_bbnkb"
            label="Opsen Denda BBNKB"
            type="number"
            placeholder="0"
            className="col-span-6 sm:col-span-3"
          />

          {/* Total Display */}
          <div className="col-span-12 bg-base-200 p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Pembayaran:</span>
              <span className="text-lg font-bold text-primary">
                Rp {total.toLocaleString("id-ID")}
              </span>
            </div>
          </div>

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
