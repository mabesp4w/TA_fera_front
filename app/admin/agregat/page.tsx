/** @format */

"use client";

import { useEffect, useState, useCallback } from "react";
import AdminRoute from "@/components/AdminRoute";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Filter, ShowData, RegenerateModal } from "@/components/pages/agregat";
import type { SelectOption } from "@/components/ui/types";
import {
  agregatService,
  type AgregatPendapatan,
  type AgregatSummary,
} from "@/services/agregatService";
import { jenisKendaraanService } from "@/services/jenisKendaraanService";
import { toast } from "@/services";

export default function AgregatPage() {
  const [data, setData] = useState<AgregatPendapatan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isRegenerateModalOpen, setIsRegenerateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTahun, setSelectedTahun] = useState<string | null>(null);
  const [selectedBulan, setSelectedBulan] = useState<string | null>(null);
  const [selectedJenis, setSelectedJenis] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // Summary state (total keseluruhan)
  const [summary, setSummary] = useState<AgregatSummary | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);
  
  // Filter options state (dinamis dari database)
  const [tahunOptions, setTahunOptions] = useState<SelectOption[]>([]);
  const [bulanOptions, setBulanOptions] = useState<SelectOption[]>([]);
  const [jenisOptions, setJenisOptions] = useState<SelectOption[]>([]);
  const [isOptionsLoading, setIsOptionsLoading] = useState(true);
  
  const pageSize = 10;

  // Fetch filter options (tahun, bulan, jenis kendaraan)
  const fetchFilterOptions = async () => {
    try {
      setIsOptionsLoading(true);
      const [filterOptions, jenisResponse] = await Promise.all([
        agregatService.getFilterOptions(),
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

  // Fetch data
  const fetchData = useCallback(async (
    page: number = 1,
    search: string = "",
    tahun: string | null = null,
    bulan: string | null = null,
    jenisId: string | null = null
  ) => {
    try {
      setIsLoading(true);
      const response = await agregatService.getList({
        page,
        page_size: pageSize,
        tahun: tahun ? parseInt(tahun) : undefined,
        bulan: bulan ? parseInt(bulan) : undefined,
        jenis_kendaraan_id: jenisId ? parseInt(jenisId) : undefined,
      });
      
      setData(response?.data || []);
      setTotalCount(response?.total_count || 0);
      setTotalPages(response?.total_pages || 1);
      setCurrentPage(page);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Gagal memuat data agregat";
      toast.error(errorMessage);
      setData([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch summary (total keseluruhan tanpa pagination)
  const fetchSummary = useCallback(async (
    tahun: string | null = null,
    bulan: string | null = null,
    jenisId: string | null = null
  ) => {
    try {
      setIsSummaryLoading(true);
      const response = await agregatService.getSummary({
        tahun: tahun ? parseInt(tahun) : undefined,
        bulan: bulan ? parseInt(bulan) : undefined,
        jenis_kendaraan_id: jenisId ? parseInt(jenisId) : undefined,
      });
      setSummary(response);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Gagal memuat summary agregat";
      toast.error(errorMessage);
      setSummary(null);
    } finally {
      setIsSummaryLoading(false);
    }
  }, []);

  // Initial fetch untuk filter options
  useEffect(() => {
    fetchFilterOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch data dan summary saat filter berubah (setelah options loaded)
  useEffect(() => {
    if (!isOptionsLoading) {
      fetchData(1, searchQuery, selectedTahun, selectedBulan, selectedJenis);
      fetchSummary(selectedTahun, selectedBulan, selectedJenis);
    }
  }, [selectedTahun, selectedBulan, selectedJenis, isOptionsLoading, fetchData, fetchSummary]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData(1, searchQuery, selectedTahun, selectedBulan, selectedJenis);
  };

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

  // Handle regenerate
  const handleRegenerateClick = () => {
    setIsRegenerateModalOpen(true);
  };

  const handleRegenerateConfirm = async () => {
    try {
      setIsRegenerating(true);
      const result = await agregatService.regenerate({
        regenerate_all: true,
      });

      const novInfo = result.nov_2025_remaining !== undefined 
        ? `, Nov2025 tersisa: ${result.nov_2025_remaining}` 
        : '';
      toast.success(
        `Regenerate berhasil! Dihapus: ${result.deleted}, Dibuat: ${result.created}, Diupdate: ${result.updated}${novInfo}`
      );

      // Clear cache dan refresh data
      setData([]);
      setTimeout(() => {
        fetchFilterOptions(); // Refresh filter options (tahun/bulan baru)
        fetchData(1, searchQuery, selectedTahun, selectedBulan, selectedJenis);
        fetchSummary(selectedTahun, selectedBulan, selectedJenis);
      }, 500);
      setIsRegenerateModalOpen(false);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Gagal meregenerasi data";
      toast.error(errorMessage);
    } finally {
      setIsRegenerating(false);
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchData(page, searchQuery, selectedTahun, selectedBulan, selectedJenis);
  };

  return (
    <AdminRoute>
      <div className="min-h-screen bg-base-200 flex overflow-x-hidden">
        <Sidebar />

        <div className="flex-1 lg:ml-64 overflow-x-hidden">
          {/* Header */}
          <Header
            variant="admin"
            title="Agregat Pendapatan Bulanan"
            subtitle="Data agregat pendapatan pajak kendaraan bermotor per periode"
            showThemeSwitcher={true}
          />

          {/* Content */}
          <div className="p-4 lg:p-8 min-w-0">
            {/* Filter */}
            <Filter
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSearchSubmit={handleSearch}
              selectedTahun={selectedTahun}
              onTahunChange={handleTahunChange}
              selectedBulan={selectedBulan}
              onBulanChange={handleBulanChange}
              selectedJenis={selectedJenis}
              onJenisChange={handleJenisChange}
              tahunOptions={tahunOptions}
              bulanOptions={bulanOptions}
              jenisOptions={jenisOptions}
              onRegenerate={handleRegenerateClick}
              isRegenerating={isRegenerating}
              isLoading={isOptionsLoading}
            />

            {/* Show Data */}
            <ShowData
              data={data}
              summary={summary}
              isLoading={isLoading}
              isSummaryLoading={isSummaryLoading}
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={pageSize}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>

      {/* Regenerate Confirmation Modal */}
      <RegenerateModal
        isOpen={isRegenerateModalOpen}
        onClose={() => setIsRegenerateModalOpen(false)}
        onConfirm={handleRegenerateConfirm}
        isRegenerating={isRegenerating}
      />
    </AdminRoute>
  );
}
