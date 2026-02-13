/** @format */

import { Card } from "@/components/ui";
import { Filter as FilterIcon, Loader2 } from "lucide-react";
import type { SelectOption } from "@/components/ui/types";
import dynamic from "next/dynamic";

// Dynamic import untuk Select untuk menghindari SSR issues
const Select = dynamic(() => import("@/components/ui/Select"), {
  ssr: false,
});

interface FilterProps {
  selectedTahun: string | null;
  onTahunChange: (value: string | null) => void;
  selectedBulan: string | null;
  onBulanChange: (value: string | null) => void;
  selectedJenis: string | null;
  onJenisChange: (value: string | null) => void;
  tahunOptions: SelectOption[];
  bulanOptions: SelectOption[];
  jenisOptions: SelectOption[];
  isLoading?: boolean;
}

export default function Filter({
  selectedTahun,
  onTahunChange,
  selectedBulan,
  onBulanChange,
  selectedJenis,
  onJenisChange,
  tahunOptions,
  bulanOptions,
  jenisOptions,
  isLoading = false,
}: FilterProps) {
  // Helper untuk mengkonversi string value ke SelectOption
  const getSelectedOption = (options: SelectOption[], value: string | null): SelectOption | null => {
    if (!value) return null;
    return options.find((opt) => String(opt.value) === value) || null;
  };

  // Helper untuk handle change dari Select component
  const handleSelectChange = (
    selected: SelectOption | SelectOption[] | null,
    onChange: (value: string | null) => void
  ) => {
    if (Array.isArray(selected)) {
      onChange(selected.length > 0 ? String(selected[0].value) : null);
    } else {
      onChange(selected ? String(selected.value) : null);
    }
  };

  return (
    <Card className="mb-4">
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Tahun Filter */}
          <div>
            <label className="label">
              <span className="label-text flex items-center gap-2">
                <FilterIcon className="w-3 h-3" />
                Tahun
              </span>
            </label>
            {isLoading ? (
              <div className="flex items-center gap-2 h-10 px-3 bg-base-200 rounded-lg">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm text-base-content/50">Memuat...</span>
              </div>
            ) : (
              <Select
                options={tahunOptions}
                value={getSelectedOption(tahunOptions, selectedTahun)}
                onChange={(selected) => handleSelectChange(selected, onTahunChange)}
                placeholder="Semua Tahun"
                isClearable
              />
            )}
          </div>

          {/* Bulan Filter */}
          <div>
            <label className="label">
              <span className="label-text flex items-center gap-2">
                <FilterIcon className="w-3 h-3" />
                Bulan
              </span>
            </label>
            {isLoading ? (
              <div className="flex items-center gap-2 h-10 px-3 bg-base-200 rounded-lg">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm text-base-content/50">Memuat...</span>
              </div>
            ) : (
              <Select
                options={bulanOptions}
                value={getSelectedOption(bulanOptions, selectedBulan)}
                onChange={(selected) => handleSelectChange(selected, onBulanChange)}
                placeholder="Semua Bulan"
                isClearable
              />
            )}
          </div>

          {/* Jenis Kendaraan Filter */}
          <div>
            <label className="label">
              <span className="label-text flex items-center gap-2">
                <FilterIcon className="w-3 h-3" />
                Jenis Kendaraan
              </span>
            </label>
            {isLoading ? (
              <div className="flex items-center gap-2 h-10 px-3 bg-base-200 rounded-lg">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm text-base-content/50">Memuat...</span>
              </div>
            ) : (
              <Select
                options={jenisOptions}
                value={getSelectedOption(jenisOptions, selectedJenis)}
                onChange={(selected) => handleSelectChange(selected, onJenisChange)}
                placeholder="Semua Jenis"
                isClearable
              />
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
