/** @format */

"use client";

import { useEffect, useState, useCallback } from "react";
import AdminRoute from "@/components/AdminRoute";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Filter, Summary } from "@/components/pages/laporan-total-pajak";
import type { SelectOption } from "@/components/ui/types";
import {
  laporanTotalPajakService,
  type LaporanTotalPajakSummary,
} from "@/services/laporanTotalPajakService";
import { jenisKendaraanService } from "@/services/jenisKendaraanService";
import { toast } from "@/services";

export default function LaporanTotalPajakPage() {
  // Summary state
  const [summary, setSummary] = useState<LaporanTotalPajakSummary | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);

  // Filter state
  const [selectedTahun, setSelectedTahun] = useState<string | null>(null);
  const [selectedBulan, setSelectedBulan] = useState<string | null>(null);
  const [selectedJenis, setSelectedJenis] = useState<string | null>(null);

  // Filter options state
  const [tahunOptions, setTahunOptions] = useState<SelectOption[]>([]);
  const [bulanOptions, setBulanOptions] = useState<SelectOption[]>([]);
  const [jenisOptions, setJenisOptions] = useState<SelectOption[]>([]);
  const [isOptionsLoading, setIsOptionsLoading] = useState(true);

  // Fetch filter options (tahun, bulan, jenis kendaraan)
  const fetchFilterOptions = async () => {
    try {
      setIsOptionsLoading(true);
      const [filterOptions, jenisResponse] = await Promise.all([
        laporanTotalPajakService.getFilterOptions(),
        jenisKendaraanService.getList({ page_size: 1000 }),
      ]);

      // Set tahun options dari database
      const tahunOpts: SelectOption[] = filterOptions.tahun_options.map((opt) => ({
        value: opt.value.toString(),
        label: opt.label,
      }));
      setTahunOptions(tahunOpts);

      // Set bulan options dari database
      const bulanOpts: SelectOption[] = filterOptions.bulan_options.map((opt) => ({
        value: opt.value.toString(),
        label: opt.label,
      }));
      setBulanOptions(bulanOpts);

      // Set jenis kendaraan options
      const jenisOpts: SelectOption[] = (jenisResponse.data || []).map((item) => ({
        value: item.id.toString(),
        label: item.nama,
      }));
      setJenisOptions(jenisOpts);
    } catch (error) {
      console.error("Failed to fetch filter options:", error);
      toast.error("Gagal memuat opsi filter");
    } finally {
      setIsOptionsLoading(false);
    }
  };

  // Fetch summary dengan parameter yang eksplisit
  const fetchSummary = useCallback(async (
    tahun: string | null,
    bulan: string | null,
    jenisId: string | null
  ) => {
    try {
      setIsSummaryLoading(true);
      const response = await laporanTotalPajakService.getSummary({
        tahun: tahun ? parseInt(tahun) : undefined,
        bulan: bulan ? parseInt(bulan) : undefined,
        jenis_kendaraan_id: jenisId ? parseInt(jenisId) : undefined,
      });
      setSummary(response);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Gagal memuat summary laporan";
      toast.error(errorMessage);
      setSummary(null);
    } finally {
      setIsSummaryLoading(false);
    }
  }, []);

  // Effect untuk fetch summary saat filter berubah
  useEffect(() => {
    if (!isOptionsLoading) {
      fetchSummary(selectedTahun, selectedBulan, selectedJenis);
    }
  }, [selectedTahun, selectedBulan, selectedJenis, isOptionsLoading, fetchSummary]);

  // Initial fetch untuk filter options
  useEffect(() => {
    fetchFilterOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle filter changes
  const handleTahunChange = (value: string | null) => {
    setSelectedTahun(value);
  };

  const handleBulanChange = (value: string | null) => {
    setSelectedBulan(value);
  };

  const handleJenisChange = (value: string | null) => {
    setSelectedJenis(value);
  };

  return (
    <AdminRoute>
      <div className="min-h-screen bg-base-200 flex overflow-x-hidden">
        <Sidebar />

        <div className="flex-1 lg:ml-64 overflow-x-hidden">
          {/* Header */}
          <Header
            variant="admin"
            title="Laporan Total Pajak"
            subtitle="Rekapitulasi total pajak kendaraan bermotor per tahun, bulan, dan kendaraan"
            showThemeSwitcher={true}
          />

          {/* Content */}
          <div className="p-4 lg:p-8 min-w-0 space-y-4">
            {/* Filter */}
            <Filter
              selectedTahun={selectedTahun}
              onTahunChange={handleTahunChange}
              selectedBulan={selectedBulan}
              onBulanChange={handleBulanChange}
              selectedJenis={selectedJenis}
              onJenisChange={handleJenisChange}
              tahunOptions={tahunOptions}
              bulanOptions={bulanOptions}
              jenisOptions={jenisOptions}
              isLoading={isOptionsLoading}
            />

            {/* Summary Cards */}
            <Summary summary={summary} isLoading={isSummaryLoading} />
          </div>
        </div>
      </div>
    </AdminRoute>
  );
}
