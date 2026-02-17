/** @format */

"use client";

import { Button, SearchInput } from "@/components/ui";
import { Plus } from "lucide-react";

interface FilterProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  onCreate: () => void;
}

export default function Filter({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onCreate,
}: FilterProps) {
  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <SearchInput
          value={searchQuery}
          onChange={onSearchChange}
          onSubmit={onSearchSubmit}
          placeholder="Cari merek kendaraan..."
          containerClassName="flex-1 w-full sm:max-w-md"
        />
        <Button onClick={onCreate} leftIcon={<Plus className="w-4 h-4" />}>
          Tambah Merek
        </Button>
      </div>
    </div>
  );
}
