/** @format */

"use client";

import { Button, SearchInput, Select } from "@/components/ui";
import type { SelectOption } from "@/components/ui/types";
import { Plus } from "lucide-react";

interface FilterProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  selectedKelurahan: string | null;
  onKelurahanChange: (value: string | null) => void;
  kelurahanOptions: SelectOption[];
  onCreate: () => void;
}

export default function Filter({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  selectedKelurahan,
  onKelurahanChange,
  kelurahanOptions,
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
            placeholder="Cari wajib pajak..."
            containerClassName="flex-1 w-full sm:max-w-md"
          />
          <Select
            options={[
              { value: "", label: "Semua Kelurahan" },
              ...kelurahanOptions,
            ]}
            value={
              selectedKelurahan
                ? kelurahanOptions.find(
                    (opt) => opt.value === selectedKelurahan
                  ) || null
                : { value: "", label: "Semua Kelurahan" }
            }
            onChange={(selected) => {
              if (!selected || Array.isArray(selected)) {
                onKelurahanChange(null);
                return;
              }
              const selectedOption = selected as SelectOption;
              if (selectedOption.value === "") {
                onKelurahanChange(null);
              } else {
                onKelurahanChange(selectedOption.value.toString());
              }
            }}
            placeholder="Filter Kelurahan"
            isClearable={false}
            className="w-full sm:w-64"
          />
        </div>
        <Button onClick={onCreate} leftIcon={<Plus className="w-4 h-4" />}>
          Tambah Wajib Pajak
        </Button>
      </div>
    </div>
  );
}
