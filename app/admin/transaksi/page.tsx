/** @format */

"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import AdminRoute from "@/components/AdminRoute";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import {
  Filter,
  ShowData,
  Form,
  DeleteModal,
} from "@/components/pages/transaksi";
import type { SelectOption } from "@/components/ui/types";
import {
  transaksiPajakService,
  type TransaksiPajak,
  type TransaksiPajakFormData,
} from "@/services/transaksiPajakService";
import { jenisKendaraanService } from "@/services/jenisKendaraanService";
import { kendaraanBermotorService } from "@/services/kendaraanBermotorService";
import { toast } from "@/services";

// Validation schema
const transaksiSchema = yup.object().shape({
  kendaraan: yup
    .number()
    .required("Kendaraan wajib dipilih")
    .typeError("Kendaraan wajib dipilih"),
  tahun: yup
    .number()
    .required("Tahun wajib diisi")
    .min(2000, "Tahun minimal 2000")
    .max(2100, "Tahun maksimal 2100")
    .typeError("Tahun harus berupa angka"),
  bulan: yup
    .number()
    .required("Bulan wajib dipilih")
    .min(1, "Bulan tidak valid")
    .max(12, "Bulan tidak valid")
    .typeError("Bulan harus berupa angka"),
  tgl_pajak: yup.string().required("Tanggal pajak wajib diisi"),
  tgl_bayar: yup.string().required("Tanggal bayar wajib diisi"),
  jml_tahun_bayar: yup.number().default(1),
  jml_bulan_bayar: yup.number().default(0),
  pokok_pkb: yup.number().default(0),
  denda_pkb: yup.number().default(0),
  tunggakan_pokok_pkb: yup.number().default(0),
  tunggakan_denda_pkb: yup.number().default(0),
  opsen_pokok_pkb: yup.number().default(0),
  opsen_denda_pkb: yup.number().default(0),
  pokok_swdkllj: yup.number().default(0),
  denda_swdkllj: yup.number().default(0),
  tunggakan_pokok_swdkllj: yup.number().default(0),
  tunggakan_denda_swdkllj: yup.number().default(0),
  pokok_bbnkb: yup.number().default(0),
  denda_bbnkb: yup.number().default(0),
  total_bbnkb: yup.number().default(0),
  opsen_pokok_bbnkb: yup.number().default(0),
  opsen_denda_bbnkb: yup.number().default(0),
});

export default function TransaksiPage() {
  const [data, setData] = useState<TransaksiPajak[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TransaksiPajak | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJenis, setSelectedJenis] = useState<string | null>(null);
  const [selectedTahun, setSelectedTahun] = useState<string | null>(null);
  const [selectedBulan, setSelectedBulan] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filter options state
  const [jenisOptions, setJenisOptions] = useState<SelectOption[]>([]);
  const [tahunOptions, setTahunOptions] = useState<SelectOption[]>([]);
  const [bulanOptions, setBulanOptions] = useState<SelectOption[]>([]);
  const [isOptionsLoading, setIsOptionsLoading] = useState(true);
  
  const [kendaraanOptions, setKendaraanOptions] = useState<SelectOption[]>([]);
  const pageSize = 10;

  const formMethods = useForm<TransaksiPajakFormData>({
    resolver: yupResolver(transaksiSchema) as any,
    defaultValues: {
      kendaraan: undefined,
      tahun: new Date().getFullYear(),
      bulan: new Date().getMonth() + 1,
      tgl_pajak: "",
      tgl_bayar: "",
      jml_tahun_bayar: 1,
      jml_bulan_bayar: 0,
      pokok_pkb: 0,
      denda_pkb: 0,
      tunggakan_pokok_pkb: 0,
      tunggakan_denda_pkb: 0,
      opsen_pokok_pkb: 0,
      opsen_denda_pkb: 0,
      pokok_swdkllj: 0,
      denda_swdkllj: 0,
      tunggakan_pokok_swdkllj: 0,
      tunggakan_denda_swdkllj: 0,
      pokok_bbnkb: 0,
      denda_bbnkb: 0,
      total_bbnkb: 0,
      opsen_pokok_bbnkb: 0,
      opsen_denda_bbnkb: 0,
    },
  });

  const {
    formState: { isSubmitting },
    reset,
  } = formMethods;

  // Fetch filter options (jenis kendaraan, tahun, bulan)
  const fetchFilterOptions = async () => {
    try {
      setIsOptionsLoading(true);
      const [filterOptions, jenisResponse] = await Promise.all([
        transaksiPajakService.getFilterOptions(),
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

  // Fetch kendaraan options (untuk form modal)
  const fetchKendaraanOptions = async () => {
    try {
      const response = await kendaraanBermotorService.getList({ page_size: 1000 });
      const options: SelectOption[] = (response.data || []).map((item) => ({
        value: item.id.toString(),
        label: `${item.no_polisi} - ${item.type_kendaraan_nama || item.jenis_nama || ""}`,
      }));
      setKendaraanOptions(options);
    } catch (error) {
      console.error("Failed to fetch kendaraan options:", error);
    }
  };

  // Fetch data
  const fetchData = useCallback(async (
    page: number = 1,
    search: string = "",
    jenisId: string | null = null,
    tahun: string | null = null,
    bulan: string | null = null
  ) => {
    try {
      setIsLoading(true);
      const response = await transaksiPajakService.getList({
        page,
        page_size: pageSize,
        search: search || undefined,
        jenis_kendaraan_id: jenisId ? parseInt(jenisId) : undefined,
        tahun: tahun ? parseInt(tahun) : undefined,
        bulan: bulan ? parseInt(bulan) : undefined,
      });
      setData(response?.data || []);
      setTotalCount(response?.total_count || 0);
      setTotalPages(response?.total_pages || 1);
      setCurrentPage(page);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Gagal memuat data transaksi";
      toast.error(errorMessage);
      setData([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchFilterOptions();
    fetchKendaraanOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effect untuk fetch data saat filter berubah
  useEffect(() => {
    if (!isOptionsLoading) {
      fetchData(1, searchQuery, selectedJenis, selectedTahun, selectedBulan);
    }
  }, [selectedJenis, selectedTahun, selectedBulan, isOptionsLoading, fetchData]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData(1, searchQuery, selectedJenis, selectedTahun, selectedBulan);
  };

  // Handle filter changes
  const handleJenisChange = (value: string | null) => {
    setSelectedJenis(value);
    setCurrentPage(1);
  };

  const handleTahunChange = (value: string | null) => {
    setSelectedTahun(value);
    setCurrentPage(1);
  };

  const handleBulanChange = (value: string | null) => {
    setSelectedBulan(value);
    setCurrentPage(1);
  };

  // Handle create
  const handleCreate = () => {
    setSelectedItem(null);
    reset({
      kendaraan: undefined,
      tahun: new Date().getFullYear(),
      bulan: new Date().getMonth() + 1,
      tgl_pajak: "",
      tgl_bayar: "",
      jml_tahun_bayar: 1,
      jml_bulan_bayar: 0,
      pokok_pkb: 0,
      denda_pkb: 0,
      tunggakan_pokok_pkb: 0,
      tunggakan_denda_pkb: 0,
      opsen_pokok_pkb: 0,
      opsen_denda_pkb: 0,
      pokok_swdkllj: 0,
      denda_swdkllj: 0,
      tunggakan_pokok_swdkllj: 0,
      tunggakan_denda_swdkllj: 0,
      pokok_bbnkb: 0,
      denda_bbnkb: 0,
      total_bbnkb: 0,
      opsen_pokok_bbnkb: 0,
      opsen_denda_bbnkb: 0,
    });
    setIsModalOpen(true);
  };

  // Helper untuk konversi ke number
  const toNumber = (value: number | string | null | undefined): number => {
    if (value === null || value === undefined || value === "") {
      return 0;
    }
    if (typeof value === "string") {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return value;
  };

  // Handle edit
  const handleEdit = (item: TransaksiPajak) => {
    setSelectedItem(item);
    reset({
      kendaraan: item.kendaraan,
      tahun: item.tahun,
      bulan: item.bulan,
      tgl_pajak: item.tgl_pajak,
      tgl_bayar: item.tgl_bayar,
      jml_tahun_bayar: item.jml_tahun_bayar,
      jml_bulan_bayar: item.jml_bulan_bayar,
      pokok_pkb: toNumber(item.pokok_pkb),
      denda_pkb: toNumber(item.denda_pkb),
      tunggakan_pokok_pkb: toNumber(item.tunggakan_pokok_pkb),
      tunggakan_denda_pkb: toNumber(item.tunggakan_denda_pkb),
      opsen_pokok_pkb: toNumber(item.opsen_pokok_pkb),
      opsen_denda_pkb: toNumber(item.opsen_denda_pkb),
      pokok_swdkllj: toNumber(item.pokok_swdkllj),
      denda_swdkllj: toNumber(item.denda_swdkllj),
      tunggakan_pokok_swdkllj: toNumber(item.tunggakan_pokok_swdkllj),
      tunggakan_denda_swdkllj: toNumber(item.tunggakan_denda_swdkllj),
      pokok_bbnkb: toNumber(item.pokok_bbnkb),
      denda_bbnkb: toNumber(item.denda_bbnkb),
      total_bbnkb: toNumber(item.total_bbnkb),
      opsen_pokok_bbnkb: toNumber(item.opsen_pokok_bbnkb),
      opsen_denda_bbnkb: toNumber(item.opsen_denda_bbnkb),
    });
    setIsModalOpen(true);
  };

  // Handle delete
  const handleDelete = (item: TransaksiPajak) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  // Handle submit form
  const onSubmit = async (formData: TransaksiPajakFormData) => {
    try {
      const submitData: TransaksiPajakFormData = {
        ...formData,
        kendaraan: typeof formData.kendaraan === "string"
          ? parseInt(formData.kendaraan)
          : formData.kendaraan,
      };

      if (selectedItem) {
        await transaksiPajakService.update(selectedItem.id, submitData);
        toast.success("Transaksi berhasil diperbarui");
      } else {
        await transaksiPajakService.create(submitData);
        toast.success("Transaksi berhasil ditambahkan");
      }
      setIsModalOpen(false);
      reset();
      fetchData(currentPage, searchQuery, selectedJenis, selectedTahun, selectedBulan);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Gagal menyimpan data";
      toast.error(errorMessage);
    }
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!selectedItem) return;

    try {
      await transaksiPajakService.delete(selectedItem.id);
      toast.success("Transaksi berhasil dihapus");
      setIsDeleteModalOpen(false);
      setSelectedItem(null);
      fetchData(currentPage, searchQuery, selectedJenis, selectedTahun, selectedBulan);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Gagal menghapus data";
      toast.error(errorMessage);
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchData(page, searchQuery, selectedJenis, selectedTahun, selectedBulan);
  };

  return (
    <AdminRoute>
      <div className="min-h-screen bg-base-200 flex overflow-x-hidden">
        <Sidebar />

        <div className="flex-1 lg:ml-64 overflow-x-hidden">
          {/* Header */}
          <Header
            variant="admin"
            title="Transaksi Pajak"
            subtitle="Kelola data transaksi pembayaran pajak"
            showThemeSwitcher={true}
          />

          {/* Content */}
          <div className="p-4 lg:p-8 min-w-0">
            {/* Filter */}
            <Filter
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSearchSubmit={handleSearch}
              selectedJenis={selectedJenis}
              onJenisChange={handleJenisChange}
              jenisOptions={jenisOptions}
              selectedTahun={selectedTahun}
              onTahunChange={handleTahunChange}
              tahunOptions={tahunOptions}
              selectedBulan={selectedBulan}
              onBulanChange={handleBulanChange}
              bulanOptions={bulanOptions}
              isLoading={isOptionsLoading}
              onCreate={handleCreate}
            />

            {/* Show Data */}
            <ShowData
              data={data}
              isLoading={isLoading}
              searchQuery={searchQuery}
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={pageSize}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onPageChange={handlePageChange}
            />
          </div>
        </div>

        {/* Create/Edit Modal */}
        <Form
          isOpen={isModalOpen}
          isSubmitting={isSubmitting}
          selectedItem={selectedItem}
          formMethods={formMethods}
          kendaraanOptions={kendaraanOptions}
          onSubmit={onSubmit}
          onClose={() => {
            setIsModalOpen(false);
            reset();
            setSelectedItem(null);
          }}
        />

        {/* Delete Confirmation Modal */}
        <DeleteModal
          isOpen={isDeleteModalOpen}
          selectedItem={selectedItem}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedItem(null);
          }}
          onConfirm={handleConfirmDelete}
        />
      </div>
    </AdminRoute>
  );
}
