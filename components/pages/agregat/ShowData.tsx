/** @format */

"use client";

import { DollarSign, FileText, Users, Loader2, FileX } from "lucide-react";
import { formatNumber } from "@/utils/formatNumber";
import { Card, Pagination } from "@/components/ui";
import type { AgregatPendapatan, AgregatSummary } from "@/services/agregatService";

interface ShowDataProps {
  data: AgregatPendapatan[];
  summary: AgregatSummary | null;
  isLoading: boolean;
  isSummaryLoading: boolean;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

const BULAN_NAMA: Record<number, string> = {
  1: "Jan",
  2: "Feb",
  3: "Mar",
  4: "Apr",
  5: "Mei",
  6: "Jun",
  7: "Jul",
  8: "Agt",
  9: "Sep",
  10: "Okt",
  11: "Nov",
  12: "Des",
};

const toNumber = (value: number | string | null | undefined): number => {
  if (value === null || value === undefined || value === "") {
    return 0;
  }
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
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

export default function ShowData({
  data,
  summary,
  isLoading,
  isSummaryLoading,
  currentPage,
  totalPages,
  totalCount,
  pageSize,
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
              Belum ada data agregat pendapatan
            </p>
          </div>
        </div>
      </Card>
    );
  }

  // Gunakan summary dari API (total keseluruhan) bukan hitung dari data per page
  const totalPendapatan = summary?.total_pendapatan || 0;
  const totalTransaksi = summary?.jumlah_transaksi || 0;
  const totalKendaraan = summary?.jumlah_kendaraan || 0;
  const totalPeriode = summary?.jumlah_periode || 0;

  return (
    <div>
      {/* Summary Cards - Total Keseluruhan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="stats shadow bg-primary text-primary-content">
          <div className="stat">
            <div className="stat-figure text-primary-content/70">
              <DollarSign className="w-8 h-8" />
            </div>
            <div className="stat-title">Total Pendapatan Keseluruhan</div>
            <div className="stat-value text-2xl">
              {isSummaryLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                formatRupiah(totalPendapatan)
              )}
            </div>
            <div className="stat-desc">
              Dari {totalPeriode} periode
            </div>
          </div>
        </div>

        <div className="stats shadow bg-secondary text-secondary-content">
          <div className="stat">
            <div className="stat-figure text-secondary-content/70">
              <FileText className="w-8 h-8" />
            </div>
            <div className="stat-title">Total Transaksi Keseluruhan</div>
            <div className="stat-value text-2xl">
              {isSummaryLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                formatNumber(totalTransaksi)
              )}
            </div>
            <div className="stat-desc">
              {totalPeriode > 0 ? (
                <>
                  Rata-rata{" "}
                  {formatNumber(Math.round(totalTransaksi / totalPeriode))}
                  {" / periode"}
                </>
              ) : (
                "-"
              )}
            </div>
          </div>
        </div>

        <div className="stats shadow bg-accent text-accent-content">
          <div className="stat">
            <div className="stat-figure text-accent-content/70">
              <Users className="w-8 h-8" />
            </div>
            <div className="stat-title">Total Kendaraan Keseluruhan</div>
            <div className="stat-value text-2xl">
              {isSummaryLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                formatNumber(totalKendaraan)
              )}
            </div>
            <div className="stat-desc">
              {totalPeriode > 0 ? (
                <>
                  Rata-rata{" "}
                  {formatNumber(Math.round(totalKendaraan / totalPeriode))}
                  {" / periode"}
                </>
              ) : (
                "-"
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr className="bg-base-200">
                <th className="text-xs">Periode</th>
                <th className="text-xs">Jenis Kendaraan</th>
                <th className="text-xs">Total Pendapatan</th>
                <th className="text-xs">Pokok PKB</th>
                <th className="text-xs">Denda PKB</th>
                <th className="text-xs">SWDKLLJ</th>
                <th className="text-xs">BBNKB</th>
                <th className="text-xs">Opsen</th>
                <th className="text-xs">Jml Transaksi</th>
                <th className="text-xs">Jml Kendaraan</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id} className="hover">
                  <td className="text-sm font-medium">
                    {BULAN_NAMA[item.bulan]} {item.tahun}
                  </td>
                  <td className="text-sm">{item.jenis_kendaraan_nama || "Semua"}</td>
                  <td className="text-sm font-semibold text-primary">
                    {formatRupiah(item.total_pendapatan)}
                  </td>
                  <td className="text-sm">{formatRupiah(item.total_pokok_pkb)}</td>
                  <td className="text-sm">{formatRupiah(item.total_denda_pkb)}</td>
                  <td className="text-sm">{formatRupiah(item.total_swdkllj)}</td>
                  <td className="text-sm">{formatRupiah(item.total_bbnkb)}</td>
                  <td className="text-sm">{formatRupiah(item.total_opsen)}</td>
                  <td className="text-sm">{formatNumber(item.jumlah_transaksi)}</td>
                  <td className="text-sm">{formatNumber(item.jumlah_kendaraan)}</td>
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
    </div>
  );
}
