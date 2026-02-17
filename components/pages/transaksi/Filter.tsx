/** @format */

import { Card, Button, Input } from "@/components/ui";
import type { SelectOption } from "@/components/ui/types";
import { Search, Filter as FilterIcon, Plus, Loader2, Trash2 } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamic import untuk Select untuk menghindari SSR issues
const Select = dynamic(() => import("@/components/ui/Select"), {
  ssr: false,
});

interface FilterProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  selectedJenis: string | null;
  onJenisChange: (value: string | null) => void;
  jenisOptions: SelectOption[];
  selectedTahun: string | null;
  onTahunChange: (value: string | null) => void;
  tahunOptions: SelectOption[];
  selectedBulan: string | null;
  onBulanChange: (value: string | null) => void;
  bulanOptions: SelectOption[];
  isLoading?: boolean;
  onCreate: () => void;
  onBulkDelete?: () => void;
  isDeleting?: boolean;
}

export default function Filter({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  selectedJenis,
  onJenisChange,
  jenisOptions,
  selectedTahun,
  onTahunChange,
  tahunOptions,
  selectedBulan,
  onBulanChange,
  bulanOptions,
  isLoading = false,
  onCreate,
  onBulkDelete,
  isDeleting = false,
}: FilterProps) {
  return (
    <Card className="mb-6">
      <div className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <form onSubmit={onSearchSubmit} className="flex-1">
            <div className="join w-full">
              <Input
                type="text"
                placeholder="Cari berdasarkan nomor polisi..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="join-item flex-1"
              />
              <Button type="submit" variant="primary" className="join-item">
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline ml-2">Cari</span>
              </Button>
            </div>
          </form>

          {/* Create Button */}
          <Button onClick={onCreate} variant="primary" className="shrink-0">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline ml-2">Tambah Transaksi</span>
          </Button>

          {/* Bulk Delete Button - Muncul hanya jika Tahun+Bulan atau Tahun+Jenis terisi */}
          {((selectedTahun && selectedBulan) || (selectedTahun && selectedJenis)) && onBulkDelete && (
            <Button
              onClick={onBulkDelete}
              variant="error"
              className="shrink-0"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              <span className="hidden sm:inline ml-2">
                {isDeleting ? "Menghapus..." : "Hapus Filter"}
              </span>
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
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
                options={[
                  { value: "", label: "Semua Jenis" },
                  ...jenisOptions,
                ]}
                value={
                  selectedJenis
                    ? jenisOptions.find((opt) => opt.value === selectedJenis) || null
                    : { value: "", label: "Semua Jenis" }
                }
                onChange={(selected) => {
                  if (!selected || Array.isArray(selected)) {
                    onJenisChange(null);
                    return;
                  }
                  const selectedOption = selected as SelectOption;
                  if (selectedOption.value === "") {
                    onJenisChange(null);
                  } else {
                    onJenisChange(selectedOption.value.toString());
                  }
                }}
                placeholder="Filter Jenis Kendaraan"
                isClearable={false}
              />
            )}
          </div>

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
                options={[
                  { value: "", label: "Semua Tahun" },
                  ...tahunOptions,
                ]}
                value={
                  selectedTahun
                    ? tahunOptions.find((opt) => opt.value === selectedTahun) ||
                      null
                    : { value: "", label: "Semua Tahun" }
                }
                onChange={(selected) => {
                  if (!selected || Array.isArray(selected)) {
                    onTahunChange(null);
                    return;
                  }
                  const selectedOption = selected as SelectOption;
                  if (selectedOption.value === "") {
                    onTahunChange(null);
                  } else {
                    onTahunChange(selectedOption.value.toString());
                  }
                }}
                placeholder="Filter Tahun"
                isClearable={false}
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
                options={[
                  { value: "", label: "Semua Bulan" },
                  ...bulanOptions,
                ]}
                value={
                  selectedBulan
                    ? bulanOptions.find((opt) => opt.value === selectedBulan) ||
                      null
                    : { value: "", label: "Semua Bulan" }
                }
                onChange={(selected) => {
                  if (!selected || Array.isArray(selected)) {
                    onBulanChange(null);
                    return;
                  }
                  const selectedOption = selected as SelectOption;
                  if (selectedOption.value === "") {
                    onBulanChange(null);
                  } else {
                    onBulanChange(selectedOption.value.toString());
                  }
                }}
                placeholder="Filter Bulan"
                isClearable={false}
              />
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
