/** @format */

"use client";

import { Button, SearchInput, Select } from "@/components/ui";
import type { SelectOption } from "@/components/ui/types";
import { Plus } from "lucide-react";

interface FilterProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  selectedMerek: string | null;
  onMerekChange: (value: string | null) => void;
  merekOptions: SelectOption[];
  onCreate: () => void;
}

export default function Filter({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  selectedMerek,
  onMerekChange,
  merekOptions,
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
            placeholder="Cari type kendaraan..."
            containerClassName="flex-1 w-full sm:max-w-md"
          />
          <Select
            options={[
              { value: "", label: "Semua Merek" },
              ...merekOptions,
            ]}
            value={
              selectedMerek
                ? merekOptions.find(
                    (opt) => opt.value === selectedMerek
                  ) || null
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
            className="w-full sm:w-64"
          />
        </div>
        <Button onClick={onCreate} leftIcon={<Plus className="w-4 h-4" />}>
          Tambah Type
        </Button>
      </div>
    </div>
  );
}
