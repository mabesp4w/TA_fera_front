/** @format */

"use client";

import { useEffect, useState } from "react";
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
} from "@/components/pages/kendaraan";
import type { SelectOption } from "@/components/ui/types";
import {
  kendaraanBermotorService,
  type KendaraanBermotor,
  type KendaraanBermotorFormData,
} from "@/services/kendaraanBermotorService";
import { jenisKendaraanService } from "@/services/jenisKendaraanService";
import { merekKendaraanService } from "@/services/merekKendaraanService";
import { typeKendaraanService } from "@/services/typeKendaraanService";
import { wajibPajakService } from "@/services/wajibPajakService";
import { toast } from "@/services";

// Validation schema
const kendaraanSchema = yup.object().shape({
  no_polisi: yup
    .string()
    .required("No. polisi wajib diisi")
    .min(3, "No. polisi minimal 3 karakter")
    .max(20, "No. polisi maksimal 20 karakter"),
  no_rangka: yup
    .string()
    .required("No. rangka wajib diisi")
    .min(5, "No. rangka minimal 5 karakter")
    .max(50, "No. rangka maksimal 50 karakter"),
  no_mesin: yup
    .string()
    .required("No. mesin wajib diisi")
    .min(5, "No. mesin minimal 5 karakter")
    .max(100, "No. mesin maksimal 100 karakter"),
  tahun_buat: yup
    .number()
    .required("Tahun pembuatan wajib diisi")
    .min(1900, "Tahun minimal 1900")
    .max(2100, "Tahun maksimal 2100")
    .typeError("Tahun harus berupa angka"),
  jml_cc: yup
    .number()
    .required("Kapasitas mesin wajib diisi")
    .min(1, "Kapasitas mesin minimal 1")
    .typeError("Kapasitas mesin harus berupa angka"),
  bbm: yup
    .string()
    .required("Bahan bakar wajib dipilih")
    .oneOf(["BENSIN", "SOLAR", "LISTRIK", "HYBRID"], "Bahan bakar tidak valid"),
  jenis: yup.number().nullable().notRequired(),
  type_kendaraan: yup.number().nullable().notRequired(),
  wajib_pajak: yup.number().nullable().notRequired(),
});

export default function KendaraanPage() {
  const [data, setData] = useState<KendaraanBermotor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<KendaraanBermotor | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJenis, setSelectedJenis] = useState<string | null>(null);
  const [selectedMerek, setSelectedMerek] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [jenisOptions, setJenisOptions] = useState<SelectOption[]>([]);
  const [merekOptions, setMerekOptions] = useState<SelectOption[]>([]);
  const [typeKendaraanOptions, setTypeKendaraanOptions] = useState<
    SelectOption[]
  >([]);
  const [wajibPajakOptions, setWajibPajakOptions] = useState<SelectOption[]>(
    [],
  );
  const pageSize = 10;

  const formMethods = useForm<KendaraanBermotorFormData>({
    resolver: yupResolver(kendaraanSchema) as any,
    defaultValues: {
      no_polisi: "",
      no_rangka: "",
      no_mesin: "",
      tahun_buat: new Date().getFullYear(),
      jml_cc: 0,
      bbm: "BENSIN",
      jenis: undefined,
      type_kendaraan: undefined,
      wajib_pajak: undefined,
    },
  });

  const {
    formState: { isSubmitting },
    reset,
  } = formMethods;

  // Fetch options
  const fetchJenisOptions = async () => {
    try {
      const response = await jenisKendaraanService.getList({ page_size: 1000 });
      const options: SelectOption[] = (response.data || []).map((item) => ({
        value: item.id.toString(),
        label: item.nama,
      }));
      setJenisOptions(options);
    } catch (error) {
      console.error("Failed to fetch jenis options:", error);
    }
  };

  const fetchMerekOptions = async () => {
    try {
      const response = await merekKendaraanService.getList({ page_size: 1000 });
      const options: SelectOption[] = (response.data || []).map((item) => ({
        value: item.id.toString(),
        label: item.nama,
      }));
      setMerekOptions(options);
    } catch (error) {
      console.error("Failed to fetch merek options:", error);
    }
  };

  const fetchTypeKendaraanOptions = async () => {
    try {
      const response = await typeKendaraanService.getList({ page_size: 1000 });
      const options: SelectOption[] = (response.data || []).map((item) => ({
        value: item.id.toString(),
        label: item.nama,
      }));
      setTypeKendaraanOptions(options);
    } catch (error) {
      console.error("Failed to fetch type kendaraan options:", error);
    }
  };

  const fetchWajibPajakOptions = async () => {
    try {
      const response = await wajibPajakService.getList({ page_size: 1000 });
      const options: SelectOption[] = (response.data || []).map((item) => ({
        value: item.id.toString(),
        label: item.nama,
      }));
      setWajibPajakOptions(options);
    } catch (error) {
      console.error("Failed to fetch wajib pajak options:", error);
    }
  };

  // Fetch data
  const fetchData = async (
    page: number = 1,
    search: string = "",
    jenisId: string | null = null,
  ) => {
    try {
      setIsLoading(true);
      const response = await kendaraanBermotorService.getList({
        page,
        page_size: pageSize,
        search: search || undefined,
        jenis_id: jenisId ? parseInt(jenisId) : undefined,
      });
      setData(response?.data || []);
      setTotalCount(response?.total_count || 0);
      setTotalPages(response?.total_pages || 1);
      setCurrentPage(page);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Gagal memuat data kendaraan";
      toast.error(errorMessage);
      setData([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJenisOptions();
    fetchMerekOptions();
    fetchTypeKendaraanOptions();
    fetchWajibPajakOptions();
    fetchData(1, searchQuery, selectedJenis);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData(1, searchQuery, selectedJenis);
  };

  // Handle filter changes
  const handleJenisChange = (value: string | null) => {
    setSelectedJenis(value);
    fetchData(1, searchQuery, value);
  };

  const handleMerekChange = (value: string | null) => {
    setSelectedMerek(value);
    // Merek filter is only for display, not used in API call
    // because backend doesn't support merek_id filter directly
  };

  // Handle create
  const handleCreate = () => {
    setSelectedItem(null);
    reset({
      no_polisi: "",
      no_rangka: "",
      no_mesin: "",
      tahun_buat: new Date().getFullYear(),
      jml_cc: 0,
      bbm: "BENSIN",
      jenis: undefined,
      type_kendaraan: undefined,
      wajib_pajak: undefined,
    });
    setIsModalOpen(true);
  };

  // Handle edit
  const handleEdit = (item: KendaraanBermotor) => {
    setSelectedItem(item);
    reset({
      no_polisi: item.no_polisi,
      no_rangka: item.no_rangka,
      no_mesin: item.no_mesin,
      tahun_buat: item.tahun_buat,
      jml_cc: item.jml_cc,
      bbm: item.bbm,
      jenis: item.jenis,
      type_kendaraan: item.type_kendaraan,
      wajib_pajak: item.wajib_pajak,
    });
    setIsModalOpen(true);
  };

  // Handle delete
  const handleDelete = (item: KendaraanBermotor) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  // Handle submit form
  const onSubmit = async (formData: KendaraanBermotorFormData) => {
    try {
      // Convert string values to numbers if exists
      const submitData: KendaraanBermotorFormData = {
        no_polisi: formData.no_polisi,
        no_rangka: formData.no_rangka,
        no_mesin: formData.no_mesin,
        tahun_buat: formData.tahun_buat,
        jml_cc: formData.jml_cc,
        bbm: formData.bbm,
        jenis: formData.jenis
          ? typeof formData.jenis === "string"
            ? parseInt(formData.jenis)
            : formData.jenis
          : undefined,
        type_kendaraan: formData.type_kendaraan
          ? typeof formData.type_kendaraan === "string"
            ? parseInt(formData.type_kendaraan)
            : formData.type_kendaraan
          : undefined,
        wajib_pajak: formData.wajib_pajak
          ? typeof formData.wajib_pajak === "string"
            ? parseInt(formData.wajib_pajak)
            : formData.wajib_pajak
          : undefined,
      };

      if (selectedItem) {
        // Update
        await kendaraanBermotorService.update(selectedItem.id, submitData);
        toast.success("Kendaraan berhasil diperbarui");
      } else {
        // Create
        await kendaraanBermotorService.create(submitData);
        toast.success("Kendaraan berhasil ditambahkan");
      }
      setIsModalOpen(false);
      reset();
      fetchData(currentPage, searchQuery, selectedJenis);
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
      await kendaraanBermotorService.delete(selectedItem.id);
      toast.success("Kendaraan berhasil dihapus");
      setIsDeleteModalOpen(false);
      setSelectedItem(null);
      fetchData(currentPage, searchQuery, selectedJenis);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Gagal menghapus data";
      toast.error(errorMessage);
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchData(page, searchQuery, selectedJenis);
  };

  return (
    <AdminRoute>
      <div className="min-h-screen bg-base-200 flex overflow-x-hidden">
        <Sidebar />

        <div className="flex-1 lg:ml-64 overflow-x-hidden">
          {/* Header */}
          <Header
            variant="admin"
            title="Kendaraan Bermotor"
            subtitle="Kelola data kendaraan bermotor"
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
              selectedMerek={selectedMerek}
              onMerekChange={handleMerekChange}
              merekOptions={merekOptions}
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
          jenisOptions={jenisOptions}
          merekOptions={merekOptions}
          typeKendaraanOptions={typeKendaraanOptions}
          wajibPajakOptions={wajibPajakOptions}
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
