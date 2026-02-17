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
} from "@/components/pages/merek-kendaraan";
import {
  merekKendaraanService,
  type MerekKendaraan,
  type MerekKendaraanFormData,
} from "@/services/merekKendaraanService";
import { toast } from "@/services";

// Validation schema
const merekKendaraanSchema = yup.object({
  nama: yup
    .string()
    .required("Nama merek kendaraan wajib diisi")
    .min(2, "Nama minimal 2 karakter")
    .max(100, "Nama maksimal 100 karakter"),
});

export default function MerekKendaraanPage() {
  const [data, setData] = useState<MerekKendaraan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MerekKendaraan | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  const formMethods = useForm<MerekKendaraanFormData>({
    resolver: yupResolver(merekKendaraanSchema),
    defaultValues: {
      nama: "",
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
      const response = await merekKendaraanService.getList({
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
          : "Gagal memuat data merek kendaraan";
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
    });
    setIsModalOpen(true);
  };

  // Handle edit
  const handleEdit = (item: MerekKendaraan) => {
    setSelectedItem(item);
    reset({
      nama: item.nama,
    });
    setIsModalOpen(true);
  };

  // Handle delete
  const handleDelete = (item: MerekKendaraan) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  // Handle submit form
  const onSubmit = async (formData: MerekKendaraanFormData) => {
    try {
      if (selectedItem) {
        // Update
        await merekKendaraanService.update(selectedItem.id, formData);
        toast.success("Merek kendaraan berhasil diperbarui");
      } else {
        // Create
        await merekKendaraanService.create(formData);
        toast.success("Merek kendaraan berhasil ditambahkan");
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
      await merekKendaraanService.delete(selectedItem.id);
      toast.success("Merek kendaraan berhasil dihapus");
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
            title="Merek Kendaraan"
            subtitle="Kelola data merek kendaraan"
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
