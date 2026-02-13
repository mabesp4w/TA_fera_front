/** @format */

"use client";

import { Edit, Trash2, Loader2, FileX } from "lucide-react";
import { formatNumber } from "@/utils/formatNumber";
import { Card, Pagination } from "@/components/ui";
import type { JenisKendaraan } from "@/services/jenisKendaraanService";

interface ShowDataProps {
  data: JenisKendaraan[];
  isLoading: boolean;
  searchQuery: string;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onEdit: (item: JenisKendaraan) => void;
  onDelete: (item: JenisKendaraan) => void;
  onPageChange: (page: number) => void;
}

export default function ShowData({
  data,
  isLoading,
  searchQuery,
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onEdit,
  onDelete,
  onPageChange,
}: ShowDataProps) {
  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-base-content/70">Memuat data...</p>
        </div>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center gap-4">
          <FileX className="w-12 h-12 text-base-content/30" />
          <div className="text-center">
            <p className="text-lg font-medium text-base-content/70">
              Tidak ada data
            </p>
            <p className="text-sm text-base-content/50">
              {searchQuery
                ? `Tidak ditemukan hasil untuk "${searchQuery}"`
                : "Belum ada data jenis kendaraan"}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-0">
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr className="bg-base-200">
              <th className="text-xs">No</th>
              <th className="text-xs">Nama</th>
              <th className="text-xs">Kategori</th>
              <th className="text-xs text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={item.id} className="hover">
                <td className="text-sm">
                  {formatNumber((currentPage - 1) * pageSize + index + 1)}
                </td>
                <td className="text-sm">{item.nama}</td>
                <td className="text-sm">
                  <span className="badge badge-primary badge-sm">
                    {item.kategori_display}
                  </span>
                </td>
                <td>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(item)}
                      className="btn btn-sm btn-ghost btn-circle"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(item)}
                      className="btn btn-sm btn-ghost btn-circle text-error"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        startIndex={(currentPage - 1) * pageSize + 1}
        endIndex={Math.min(currentPage * pageSize, totalCount)}
        totalCount={totalCount}
      />
    </Card>
  );
}
