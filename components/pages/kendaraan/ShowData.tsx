/** @format */

"use client";

import { Edit, Trash2, Loader2, FileX } from "lucide-react";
import { formatNumber } from "@/utils/formatNumber";
import { Card, Pagination } from "@/components/ui";
import type { KendaraanBermotor } from "@/services/kendaraanBermotorService";

interface ShowDataProps {
  data: KendaraanBermotor[];
  isLoading: boolean;
  searchQuery: string;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onEdit: (item: KendaraanBermotor) => void;
  onDelete: (item: KendaraanBermotor) => void;
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
                : "Belum ada data kendaraan bermotor"}
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
              <th className="text-xs whitespace-nowrap">No</th>
              <th className="text-xs whitespace-nowrap">No. Polisi</th>
              <th className="text-xs whitespace-nowrap">No. Rangka</th>
              <th className="text-xs whitespace-nowrap">No. Mesin</th>
              {data[0]?.jenis_nama && (
                <th className="text-xs whitespace-nowrap">Jenis</th>
              )}
              {data[0]?.type_kendaraan_nama && (
                <th className="text-xs whitespace-nowrap">Type</th>
              )}
              <th className="text-xs whitespace-nowrap">Tahun</th>
              <th className="text-xs whitespace-nowrap">CC</th>
              <th className="text-xs whitespace-nowrap">BBM</th>
              {data[0]?.wajib_pajak_nama && (
                <th className="text-xs whitespace-nowrap">Pemilik</th>
              )}
              <th className="text-xs whitespace-nowrap text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={item.id} className="hover">
                <td className="text-sm whitespace-nowrap">
                  {formatNumber((currentPage - 1) * pageSize + index + 1)}
                </td>
                <td className="text-sm font-medium whitespace-nowrap">
                  {item.no_polisi}
                </td>
                <td className="text-sm whitespace-nowrap font-mono text-xs">
                  {item.no_rangka}
                </td>
                <td className="text-sm whitespace-nowrap font-mono text-xs">
                  {item.no_mesin}
                </td>
                {item.jenis_nama && (
                  <td className="text-sm whitespace-nowrap">
                    <span className="badge badge-secondary badge-sm">
                      {item.jenis_nama}
                    </span>
                  </td>
                )}
                {item.type_kendaraan_nama && (
                  <td className="text-sm whitespace-nowrap">
                    {item.type_kendaraan_nama}
                  </td>
                )}
                <td className="text-sm whitespace-nowrap">
                  {item.tahun_buat}
                </td>
                <td className="text-sm whitespace-nowrap">{item.jml_cc}</td>
                <td className="text-sm whitespace-nowrap">
                  <span
                    className={`badge badge-sm ${
                      item.bbm === "LISTRIK"
                        ? "badge-success"
                        : item.bbm === "HYBRID"
                          ? "badge-info"
                          : "badge-neutral"
                    }`}
                  >
                    {item.bbm}
                  </span>
                </td>
                {item.wajib_pajak_nama && (
                  <td
                    className="text-sm max-w-[200px] truncate"
                    title={item.wajib_pajak_nama}
                  >
                    {item.wajib_pajak_nama}
                  </td>
                )}
                <td className="whitespace-nowrap">
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
