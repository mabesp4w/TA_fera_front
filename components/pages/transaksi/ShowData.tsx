/** @format */

import { Card, Button, Pagination } from "@/components/ui";
import {
  Loader2,
  FileX,
  Edit,
  Trash2,
  Car,
  Receipt,
  Calendar,
} from "lucide-react";
import type { TransaksiPajak } from "@/services/transaksiPajakService";

interface ShowDataProps {
  data: TransaksiPajak[];
  isLoading: boolean;
  searchQuery: string;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onEdit: (item: TransaksiPajak) => void;
  onDelete: (item: TransaksiPajak) => void;
  onPageChange: (page: number) => void;
}

// Helper untuk memastikan nilai adalah number
// Backend mengirimkan Decimal sebagai string, jadi perlu dikonversi
const toNumber = (value: number | string | null | undefined): number => {
  if (value === null || value === undefined || value === "") {
    return 0;
  }
  // Jika string, konversi ke number
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  // Jika number
  if (typeof value === "number") {
    return isNaN(value) ? 0 : value;
  }
  return 0;
};

const formatRupiah = (amount: number | string | null | undefined) => {
  const num = toNumber(amount);
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

const BULAN_NAMA: Record<number, string> = {
  1: "Januari",
  2: "Februari",
  3: "Maret",
  4: "April",
  5: "Mei",
  6: "Juni",
  7: "Juli",
  8: "Agustus",
  9: "September",
  10: "Oktober",
  11: "November",
  12: "Desember",
};

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
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalCount);

  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-base-content/70">Memuat data transaksi...</p>
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
              Tidak ada data transaksi
            </p>
            <p className="text-sm text-base-content/50">
              {searchQuery
                ? `Tidak ditemukan hasil untuk "${searchQuery}"`
                : "Belum ada data transaksi pajak"}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr className="bg-base-200">
              <th className="text-xs">No</th>
              <th className="text-xs">Kendaraan</th>
              <th className="text-xs">Periode Pajak</th>
              <th className="text-xs">Tanggal</th>
              <th className="text-xs text-right">PKB</th>
              <th className="text-xs text-right">SWDKLLJ</th>
              <th className="text-xs text-right">BBNKB</th>
              <th className="text-xs text-right">Total Bayar</th>
              <th className="text-xs text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => {
              // Konversi semua nilai ke number (backend kirim string untuk Decimal)
              const pokokPkb = toNumber(item.pokok_pkb);
              const dendaPkb = toNumber(item.denda_pkb);
              const tunggakanPokokPkb = toNumber(item.tunggakan_pokok_pkb);
              const tunggakanDendaPkb = toNumber(item.tunggakan_denda_pkb);
              const totalPkb = pokokPkb + dendaPkb + tunggakanPokokPkb + tunggakanDendaPkb;

              const pokokSwdkllj = toNumber(item.pokok_swdkllj);
              const dendaSwdkllj = toNumber(item.denda_swdkllj);
              const tunggakanPokokSwdkllj = toNumber(item.tunggakan_pokok_swdkllj);
              const tunggakanDendaSwdkllj = toNumber(item.tunggakan_denda_swdkllj);
              const totalSwdkllj = pokokSwdkllj + dendaSwdkllj + tunggakanPokokSwdkllj + tunggakanDendaSwdkllj;

              const totalBbnkb = toNumber(item.total_bbnkb);
              const totalBayar = toNumber(item.total_bayar);

              const opsenPokokPkb = toNumber(item.opsen_pokok_pkb);
              const opsenDendaPkb = toNumber(item.opsen_denda_pkb);
              const opsenPokokBbnkb = toNumber(item.opsen_pokok_bbnkb);
              const opsenDendaBbnkb = toNumber(item.opsen_denda_bbnkb);
              const totalOpsen = opsenPokokPkb + opsenDendaPkb + opsenPokokBbnkb + opsenDendaBbnkb;

              // Cek apakah ada tunggakan
              const hasTunggakanPkb = tunggakanPokokPkb > 0 || tunggakanDendaPkb > 0;
              const hasTunggakanSwdkllj = tunggakanPokokSwdkllj > 0 || tunggakanDendaSwdkllj > 0;

              // Helper untuk badge kategori
              const getKategoriBadge = (kategori: string | undefined) => {
                if (!kategori) return null;
                const badges: Record<string, string> = {
                  MOTOR: "badge-primary",
                  MOBIL: "badge-secondary",
                  JEEP: "badge-accent",
                  TRUK: "badge-warning",
                  BUS: "badge-info",
                  LAINNYA: "badge-ghost",
                };
                return badges[kategori] || "badge-ghost";
              };

              const kategoriBadge = getKategoriBadge(item.kendaraan_jenis_kategori);

              return (
                <tr key={item.id} className="hover">
                  <td className="text-xs">{startIndex + index}</td>
                  <td>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <Car className="w-3 h-3 text-primary" />
                        <span className="text-xs font-medium">
                          {item.kendaraan_no_polisi || "-"}
                        </span>
                      </div>
                      <span className="text-[10px] text-base-content/70">
                        {item.kendaraan_merek_nama} {item.kendaraan_type_nama}
                      </span>
                      {(item.kendaraan_jenis_kategori || item.kendaraan_jenis_nama) && (
                        <div className="flex items-center gap-1 mt-1">
                          {item.kendaraan_jenis_kategori && kategoriBadge && (
                            <span className={`badge badge-xs ${kategoriBadge}`}>
                              {item.kendaraan_jenis_kategori}
                            </span>
                          )}
                          {item.kendaraan_jenis_nama && (
                            <span className="text-[10px] text-base-content/50 truncate max-w-[150px]">
                              {item.kendaraan_jenis_nama}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1">
                        <Receipt className="w-3 h-3 text-info" />
                        <span className="text-xs font-medium">
                          {BULAN_NAMA[toNumber(item.bulan)]} {toNumber(item.tahun)}
                        </span>
                      </div>
                      <span className="text-[10px] text-base-content/50">
                        {toNumber(item.jml_tahun_bayar)} thn {toNumber(item.jml_bulan_bayar)} bln
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-success" />
                        <span className="text-xs">Bayar: {item.tgl_bayar || "-"}</span>
                      </div>
                      <span className="text-[10px] text-base-content/50">
                        Jatuh tempo: {item.tgl_pajak || "-"}
                      </span>
                    </div>
                  </td>
                  <td className="text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-medium">
                        {formatRupiah(totalPkb)}
                      </span>
                      {dendaPkb > 0 && (
                        <span className="text-[10px] text-error">
                          Denda: {formatRupiah(dendaPkb)}
                        </span>
                      )}
                      {hasTunggakanPkb && (
                        <span className="text-[10px] text-error">
                          Tunggakan: {formatRupiah(tunggakanPokokPkb + tunggakanDendaPkb)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-medium">
                        {formatRupiah(totalSwdkllj)}
                      </span>
                      {dendaSwdkllj > 0 && (
                        <span className="text-[10px] text-error">
                          Denda: {formatRupiah(dendaSwdkllj)}
                        </span>
                      )}
                      {hasTunggakanSwdkllj && (
                        <span className="text-[10px] text-error">
                          Tunggakan: {formatRupiah(tunggakanPokokSwdkllj + tunggakanDendaSwdkllj)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="text-right">
                    <span className="text-xs font-medium">
                      {formatRupiah(totalBbnkb)}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-bold text-success">
                        {formatRupiah(totalBayar)}
                      </span>
                      {totalOpsen > 0 && (
                        <span className="text-[10px] text-info">
                          Opsen: {formatRupiah(totalOpsen)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(item)}
                        className="btn-circle"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(item)}
                        className="btn-circle text-error"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        startIndex={startIndex}
        endIndex={endIndex}
        totalCount={totalCount}
      />
    </Card>
  );
}
