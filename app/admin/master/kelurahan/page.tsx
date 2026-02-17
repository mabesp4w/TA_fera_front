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
} from "@/components/pages/kelurahan";
import type { SelectOption } from "@/components/ui/types";
import {
  kelurahanService,
  type Kelurahan,
  type KelurahanFormData,
} from "@/services/kelurahanService";
import { kecamatanService } from "@/services/kecamatanService";
import { toast } from "@/services";

// Validation schema
const kelurahanSchema = yup.object().shape({
  nama: yup
    .string()
    .required("Nama kelurahan wajib diisi")
    .min(3, "Nama minimal 3 karakter")
    .max(100, "Nama maksimal 100 karakter"),
  kecamatan: yup.number().nullable().notRequired(),
});

export default function KelurahanPage() {
  const [data, setData] = useState<Kelurahan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Kelurahan | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKecamatan, setSelectedKecamatan] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [kecamatanOptions, setKecamatanOptions] = useState<SelectOption[]>([]);
  const pageSize = 10;

  const formMethods = useForm<KelurahanFormData>({
    resolver: yupResolver(kelurahanSchema) as any,
    defaultValues: {
      nama: "",
      kecamatan: undefined,
    },
  });

  const {
    formState: { isSubmitting },
    reset,
  } = formMethods;

  // Fetch kecamatan options
  const fetchKecamatanOptions = async () => {
    try {
      const response = await kecamatanService.getList({ page_size: 1000 });
      const options: SelectOption[] = (response.data || []).map((kec) => ({
        value: kec.id.toString(),
        label: kec.nama,
      }));
      setKecamatanOptions(options);
    } catch (error) {
      console.error("Failed to fetch kecamatan options:", error);
    }
  };

  // Fetch data
  const fetchData = async (
    page: number = 1,
    search: string = "",
    kecamatanId: string | null = null
  ) => {
    try {
      setIsLoading(true);
      const response = await kelurahanService.getList({
        page,
        page_size: pageSize,
        search: search || undefined,
        kecamatan_id: kecamatanId ? parseInt(kecamatanId) : undefined,
      });
      setData(response?.data || []);
      setTotalCount(response?.total_count || 0);
      setTotalPages(response?.total_pages || 1);
      setCurrentPage(page);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Gagal memuat data kelurahan";
      toast.error(errorMessage);
      setData([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKecamatanOptions();
    fetchData(1, searchQuery, selectedKecamatan);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData(1, searchQuery, selectedKecamatan);
  };

  // Handle kecamatan filter change
  const handleKecamatanChange = (value: string | null) => {
    setSelectedKecamatan(value);
    fetchData(1, searchQuery, value);
  };

  // Handle create
  const handleCreate = () => {
    setSelectedItem(null);
    reset({
      nama: "",
      kecamatan: undefined,
    });
    setIsModalOpen(true);
  };

  // Handle edit
  const handleEdit = (item: Kelurahan) => {
    setSelectedItem(item);
    reset({
      nama: item.nama,
      kecamatan: item.kecamatan,
    });
    setIsModalOpen(true);
  };

  // Handle delete
  const handleDelete = (item: Kelurahan) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  // Handle submit form
  const onSubmit = async (formData: KelurahanFormData) => {
    try {
      // Convert kecamatan string to number if exists
      const submitData: KelurahanFormData = {
        nama: formData.nama,
        kecamatan: formData.kecamatan
          ? typeof formData.kecamatan === "string"
            ? parseInt(formData.kecamatan)
            : formData.kecamatan
          : undefined,
      };

      if (selectedItem) {
        // Update
        await kelurahanService.update(selectedItem.id, submitData);
        toast.success("Kelurahan berhasil diperbarui");
      } else {
        // Create
        await kelurahanService.create(submitData);
        toast.success("Kelurahan berhasil ditambahkan");
      }
      setIsModalOpen(false);
      reset();
      fetchData(currentPage, searchQuery, selectedKecamatan);
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
      await kelurahanService.delete(selectedItem.id);
      toast.success("Kelurahan berhasil dihapus");
      setIsDeleteModalOpen(false);
      setSelectedItem(null);
      fetchData(currentPage, searchQuery, selectedKecamatan);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Gagal menghapus data";
      toast.error(errorMessage);
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchData(page, searchQuery, selectedKecamatan);
  };

  return (
    <AdminRoute>
      <div className="min-h-screen bg-base-200 flex overflow-x-hidden">
        <Sidebar />

        <div className="flex-1 lg:ml-64 overflow-x-hidden">
          {/* Header */}
          <Header
            variant="admin"
            title="Kelurahan"
            subtitle="Kelola data kelurahan"
            showThemeSwitcher={true}
          />

          {/* Content */}
          <div className="p-4 lg:p-8 min-w-0">
            {/* Filter */}
            <Filter
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSearchSubmit={handleSearch}
              selectedKecamatan={selectedKecamatan}
              onKecamatanChange={handleKecamatanChange}
              kecamatanOptions={kecamatanOptions}
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
          kecamatanOptions={kecamatanOptions}
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

