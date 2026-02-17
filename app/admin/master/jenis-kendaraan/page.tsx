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
} from "@/components/pages/jenis-kendaraan";
import type { SelectOption } from "@/components/ui/types";
import {
  jenisKendaraanService,
  type JenisKendaraan,
  type JenisKendaraanFormData,
} from "@/services/jenisKendaraanService";
import { toast } from "@/services";

// Validation schema
const jenisKendaraanSchema = yup.object({
  nama: yup
    .string()
    .required("Nama jenis kendaraan wajib diisi")
    .min(3, "Nama minimal 3 karakter")
    .max(100, "Nama maksimal 100 karakter"),
  kategori: yup
    .string()
    .oneOf(
      ["MOTOR", "MOBIL", "JEEP", "TRUK", "BUS", "LAINNYA"],
      "Kategori tidak valid"
    )
    .required("Kategori wajib dipilih"),
});

// Kategori options
const kategoriOptions: SelectOption[] = [
  { value: "MOTOR", label: "Sepeda Motor" },
  { value: "MOBIL", label: "Mobil" },
  { value: "JEEP", label: "Jeep" },
  { value: "TRUK", label: "Truk" },
  { value: "BUS", label: "Bus" },
  { value: "LAINNYA", label: "Lainnya" },
];

export default function JenisKendaraanPage() {
  const [data, setData] = useState<JenisKendaraan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<JenisKendaraan | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  const formMethods = useForm<JenisKendaraanFormData>({
    resolver: yupResolver(jenisKendaraanSchema),
    defaultValues: {
      nama: "",
      kategori: "MOTOR",
    },
  });

  const {
    formState: { isSubmitting },
    reset,
  } = formMethods;

  // Fetch data
  const fetchData = async (page: number = 1, search: string = "") => {
    try {
      setIsLoading(true);
      const response = await jenisKendaraanService.getList({
        page,
        page_size: pageSize,
        search: search || undefined,
      });
      setData(response?.data || []);
      setTotalCount(response?.total_count || 0);
      setTotalPages(response?.total_pages || 1);
      setCurrentPage(page);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Gagal memuat data jenis kendaraan";
      toast.error(errorMessage);
      setData([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1, searchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData(1, searchQuery);
  };

  // Handle create
  const handleCreate = () => {
    setSelectedItem(null);
    reset({
      nama: "",
      kategori: "MOTOR",
    });
    setIsModalOpen(true);
  };

  // Handle edit
  const handleEdit = (item: JenisKendaraan) => {
    setSelectedItem(item);
    reset({
      nama: item.nama,
      kategori: item.kategori,
    });
    setIsModalOpen(true);
  };

  // Handle delete
  const handleDelete = (item: JenisKendaraan) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  // Handle submit form
  const onSubmit = async (formData: JenisKendaraanFormData) => {
    try {
      if (selectedItem) {
        // Update
        await jenisKendaraanService.update(selectedItem.id, formData);
        toast.success("Jenis kendaraan berhasil diperbarui");
      } else {
        // Create
        await jenisKendaraanService.create(formData);
        toast.success("Jenis kendaraan berhasil ditambahkan");
      }
      setIsModalOpen(false);
      reset();
      fetchData(currentPage, searchQuery);
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
      await jenisKendaraanService.delete(selectedItem.id);
      toast.success("Jenis kendaraan berhasil dihapus");
      setIsDeleteModalOpen(false);
      setSelectedItem(null);
      fetchData(currentPage, searchQuery);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Gagal menghapus data";
      toast.error(errorMessage);
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchData(page, searchQuery);
  };

  return (
    <AdminRoute>
      <div className="min-h-screen bg-base-200 flex overflow-x-hidden">
        <Sidebar />

        <div className="flex-1 lg:ml-64 overflow-x-hidden">
          {/* Header */}
          <Header
            variant="admin"
            title="Jenis Kendaraan"
            subtitle="Kelola data jenis kendaraan"
            showThemeSwitcher={true}
          />

          {/* Content */}
          <div className="p-4 lg:p-8 min-w-0">
            {/* Filter */}
            <Filter
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSearchSubmit={handleSearch}
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
          kategoriOptions={kategoriOptions}
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
