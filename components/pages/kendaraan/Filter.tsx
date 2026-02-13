/** @format */

"use client";

import { Button, SearchInput, Select } from "@/components/ui";
import type { SelectOption } from "@/components/ui/types";
import { Plus } from "lucide-react";

interface FilterProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  selectedJenis: string | null;
  onJenisChange: (value: string | null) => void;
  jenisOptions: SelectOption[];
  selectedMerek: string | null;
  onMerekChange: (value: string | null) => void;
  merekOptions: SelectOption[];
  onCreate: () => void;
}

export default function Filter({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  selectedJenis,
  onJenisChange,
  jenisOptions,
  selectedMerek,
  onMerekChange,
  merekOptions,
  onCreate,
}: FilterProps) {
  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <SearchInput
            value={searchQuery}
            onChange={onSearchChange}
            onSubmit={onSearchSubmit}
            placeholder="Cari kendaraan (no. polisi, no. rangka, no. mesin)..."
            containerClassName="flex-1 w-full"
          />
          <Button onClick={onCreate} leftIcon={<Plus className="w-4 h-4" />}>
            Tambah Kendaraan
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Select
            options={[
              { value: "", label: "Semua Jenis" },
              ...jenisOptions,
            ]}
            value={
              selectedJenis
                ? jenisOptions.find((opt) => opt.value === selectedJenis) ||
                  null
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
            placeholder="Filter Jenis"
            isClearable={false}
            className="flex-1"
          />
          <Select
            options={[
              { value: "", label: "Semua Merek" },
              ...merekOptions,
            ]}
            value={
              selectedMerek
                ? merekOptions.find((opt) => opt.value === selectedMerek) ||
                  null
                : { value: "", label: "Semua Merek" }
            }
            onChange={(selected) => {
              if (!selected || Array.isArray(selected)) {
                onMerekChange(null);
                return;
              }
              const selectedOption = selected as SelectOption;
              if (selectedOption.value === "") {
                onMerekChange(null);
              } else {
                onMerekChange(selectedOption.value.toString());
              }
            }}
            placeholder="Filter Merek"
            isClearable={false}
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
}
