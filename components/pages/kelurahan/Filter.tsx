/** @format */

"use client";

import { Button, SearchInput, Select } from "@/components/ui";
import type { SelectOption } from "@/components/ui/types";
import { Plus } from "lucide-react";

interface FilterProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  selectedKecamatan: string | null;
  onKecamatanChange: (value: string | null) => void;
  kecamatanOptions: SelectOption[];
  onCreate: () => void;
}

export default function Filter({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  selectedKecamatan,
  onKecamatanChange,
  kecamatanOptions,
  onCreate,
}: FilterProps) {
  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
          <SearchInput
            value={searchQuery}
            onChange={onSearchChange}
            onSubmit={onSearchSubmit}
            placeholder="Cari kelurahan..."
            containerClassName="flex-1 w-full sm:max-w-md"
          />
          <Select
            options={[
              { value: "", label: "Semua Kecamatan" },
              ...kecamatanOptions,
            ]}
            value={
              selectedKecamatan
                ? kecamatanOptions.find(
                    (opt) => opt.value === selectedKecamatan
                  ) || null
                : { value: "", label: "Semua Kecamatan" }
            }
            onChange={(selected) => {
              if (!selected || Array.isArray(selected)) {
                onKecamatanChange(null);
                return;
              }
              const selectedOption = selected as SelectOption;
              if (selectedOption.value === "") {
                onKecamatanChange(null);
              } else {
                onKecamatanChange(selectedOption.value.toString());
              }
            }}
            placeholder="Filter Kecamatan"
            isClearable={false}
            className="w-full sm:w-64"
          />
        </div>
        <Button onClick={onCreate} leftIcon={<Plus className="w-4 h-4" />}>
          Tambah Kelurahan
        </Button>
      </div>
    </div>
  );
}
