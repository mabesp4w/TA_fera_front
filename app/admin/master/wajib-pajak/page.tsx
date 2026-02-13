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
} from "@/components/pages/wajib-pajak";
import type { SelectOption } from "@/components/ui/types";
import {
  wajibPajakService,
  type WajibPajak,
  type WajibPajakFormData,
} from "@/services/wajibPajakService";
import { kelurahanService } from "@/services/kelurahanService";
import { toast } from "@/services";

// Validation schema
const wajibPajakSchema = yup.object().shape({
  nama: yup
    .string()
    .required("Nama wajib pajak wajib diisi")
    .min(3, "Nama minimal 3 karakter")
    .max(200, "Nama maksimal 200 karakter"),
  no_ktp: yup
    .string()
    .nullable()
    .optional()
    .matches(/^\d*$/, "No. KTP harus berupa angka")
    .min(16, "No. KTP minimal 16 digit")
    .max(16, "No. KTP maksimal 16 digit"),
  alamat: yup
    .string()
    .required("Alamat wajib diisi")
    .min(5, "Alamat minimal 5 karakter"),
  kelurahan: yup.number().nullable().notRequired(),
});

export default function WajibPajakPage() {
  const [data, setData] = useState<WajibPajak[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WajibPajak | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKelurahan, setSelectedKelurahan] = useState<string | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [kelurahanOptions, setKelurahanOptions] = useState<SelectOption[]>([]);
  const pageSize = 10;

  const formMethods = useForm<WajibPajakFormData>({
    resolver: yupResolver(wajibPajakSchema) as any,
    defaultValues: {
      nama: "",
      no_ktp: "",
      alamat: "",
      kelurahan: undefined,
    },
  });

  const {
    formState: { isSubmitting },
    reset,
  } = formMethods;

  // Fetch kelurahan options
  const fetchKelurahanOptions = async () => {
    try {
      const response = await kelurahanService.getList({ page_size: 1000 });
      const options: SelectOption[] = (response.data || []).map((kel) => ({
        value: kel.id.toString(),
        label: kel.nama,
      }));
      setKelurahanOptions(options);
    } catch (error) {
      console.error("Failed to fetch kelurahan options:", error);
    }
  };

  // Fetch data
  const fetchData = async (
    page: number = 1,
    search: string = "",
    kelurahanId: string | null = null
  ) => {
    try {
      setIsLoading(true);
      const response = await wajibPajakService.getList({
        page,
        page_size: pageSize,
        search: search || undefined,
        kelurahan_id: kelurahanId ? parseInt(kelurahanId) : undefined,
      });
      setData(response?.data || []);
      setTotalCount(response?.total_count || 0);
      setTotalPages(response?.total_pages || 1);
      setCurrentPage(page);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Gagal memuat data wajib pajak";
      toast.error(errorMessage);
      setData([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKelurahanOptions();
    fetchData(1, searchQuery, selectedKelurahan);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData(1, searchQuery, selectedKelurahan);
  };

  // Handle kelurahan filter change
  const handleKelurahanChange = (value: string | null) => {
    setSelectedKelurahan(value);
    fetchData(1, searchQuery, value);
  };

  // Handle create
  const handleCreate = () => {
    setSelectedItem(null);
    reset({
      nama: "",
      no_ktp: "",
      alamat: "",
      kelurahan: undefined,
    });
    setIsModalOpen(true);
  };

  // Handle edit
  const handleEdit = (item: WajibPajak) => {
    setSelectedItem(item);
    reset({
      nama: item.nama,
      no_ktp: item.no_ktp || "",
      alamat: item.alamat,
      kelurahan: item.kelurahan,
    });
    setIsModalOpen(true);
  };

  // Handle delete
  const handleDelete = (item: WajibPajak) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  // Handle submit form
  const onSubmit = async (formData: WajibPajakFormData) => {
    try {
      // Convert kelurahan string to number if exists
      const submitData: WajibPajakFormData = {
        nama: formData.nama,
        alamat: formData.alamat,
        no_ktp: formData.no_ktp || undefined,
        kelurahan: formData.kelurahan
          ? typeof formData.kelurahan === "string"
            ? parseInt(formData.kelurahan)
            : formData.kelurahan
          : undefined,
      };

      if (selectedItem) {
        // Update
        await wajibPajakService.update(selectedItem.id, submitData);
        toast.success("Wajib pajak berhasil diperbarui");
      } else {
        // Create
        await wajibPajakService.create(submitData);
        toast.success("Wajib pajak berhasil ditambahkan");
      }
      setIsModalOpen(false);
      reset();
      fetchData(currentPage, searchQuery, selectedKelurahan);
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
      await wajibPajakService.delete(selectedItem.id);
      toast.success("Wajib pajak berhasil dihapus");
      setIsDeleteModalOpen(false);
      setSelectedItem(null);
      fetchData(currentPage, searchQuery, selectedKelurahan);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Gagal menghapus data";
      toast.error(errorMessage);
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchData(page, searchQuery, selectedKelurahan);
  };

  return (
    <AdminRoute>
      <div className="min-h-screen bg-base-200 flex overflow-x-hidden">
        <Sidebar />

        <div className="flex-1 lg:ml-64 overflow-x-hidden">
          {/* Header */}
          <Header
            variant="admin"
            title="Wajib Pajak"
            subtitle="Kelola data wajib pajak"
            showThemeSwitcher={true}
          />

          {/* Content */}
          <div className="p-4 lg:p-8 min-w-0">
            {/* Filter */}
            <Filter
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSearchSubmit={handleSearch}
              selectedKelurahan={selectedKelurahan}
              onKelurahanChange={handleKelurahanChange}
              kelurahanOptions={kelurahanOptions}
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
          kelurahanOptions={kelurahanOptions}
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
