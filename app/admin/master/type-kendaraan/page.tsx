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
} from "@/components/pages/type-kendaraan";
import type { SelectOption } from "@/components/ui/types";
import {
  typeKendaraanService,
  type TypeKendaraan,
  type TypeKendaraanFormData,
} from "@/services/typeKendaraanService";
import { merekKendaraanService } from "@/services/merekKendaraanService";
import { toast } from "@/services";

// Validation schema
const typeKendaraanSchema = yup.object().shape({
  nama: yup
    .string()
    .required("Nama type kendaraan wajib diisi")
    .min(2, "Nama minimal 2 karakter")
    .max(200, "Nama maksimal 200 karakter"),
  merek: yup.number().nullable().notRequired(),
});

export default function TypeKendaraanPage() {
  const [data, setData] = useState<TypeKendaraan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TypeKendaraan | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMerek, setSelectedMerek] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [merekOptions, setMerekOptions] = useState<SelectOption[]>([]);
  const pageSize = 10;

  const formMethods = useForm<TypeKendaraanFormData>({
    resolver: yupResolver(typeKendaraanSchema) as any,
    defaultValues: {
      nama: "",
      merek: undefined,
    },
  });

  const {
    formState: { isSubmitting },
    reset,
  } = formMethods;

  // Fetch merek options
  const fetchMerekOptions = async () => {
    try {
      const response = await merekKendaraanService.getList({ page_size: 1000 });
      const options: SelectOption[] = (response.data || []).map((merek) => ({
        value: merek.id.toString(),
        label: merek.nama,
      }));
      setMerekOptions(options);
    } catch (error) {
      console.error("Failed to fetch merek options:", error);
    }
  };

  // Fetch data
  const fetchData = async (
    page: number = 1,
    search: string = "",
    merekId: string | null = null
  ) => {
    try {
      setIsLoading(true);
      const response = await typeKendaraanService.getList({
        page,
        page_size: pageSize,
        search: search || undefined,
        merek_id: merekId ? parseInt(merekId) : undefined,
      });
      setData(response?.data || []);
      setTotalCount(response?.total_count || 0);
      setTotalPages(response?.total_pages || 1);
      setCurrentPage(page);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Gagal memuat data type kendaraan";
      toast.error(errorMessage);
      setData([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMerekOptions();
    fetchData(1, searchQuery, selectedMerek);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData(1, searchQuery, selectedMerek);
  };

  // Handle merek filter change
  const handleMerekChange = (value: string | null) => {
    setSelectedMerek(value);
    fetchData(1, searchQuery, value);
  };

  // Handle create
  const handleCreate = () => {
    setSelectedItem(null);
    reset({
      nama: "",
      merek: undefined,
    });
    setIsModalOpen(true);
  };

  // Handle edit
  const handleEdit = (item: TypeKendaraan) => {
    setSelectedItem(item);
    reset({
      nama: item.nama,
      merek: item.merek,
    });
    setIsModalOpen(true);
  };

  // Handle delete
  const handleDelete = (item: TypeKendaraan) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  // Handle submit form
  const onSubmit = async (formData: TypeKendaraanFormData) => {
    try {
      // Convert merek string to number if exists
      const submitData: TypeKendaraanFormData = {
        nama: formData.nama,
        merek: formData.merek
          ? typeof formData.merek === "string"
            ? parseInt(formData.merek)
            : formData.merek
          : undefined,
      };

      if (selectedItem) {
        // Update
        await typeKendaraanService.update(selectedItem.id, submitData);
        toast.success("Type kendaraan berhasil diperbarui");
      } else {
        // Create
        await typeKendaraanService.create(submitData);
        toast.success("Type kendaraan berhasil ditambahkan");
      }
      setIsModalOpen(false);
      reset();
      fetchData(currentPage, searchQuery, selectedMerek);
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
      await typeKendaraanService.delete(selectedItem.id);
      toast.success("Type kendaraan berhasil dihapus");
      setIsDeleteModalOpen(false);
      setSelectedItem(null);
      fetchData(currentPage, searchQuery, selectedMerek);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Gagal menghapus data";
      toast.error(errorMessage);
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchData(page, searchQuery, selectedMerek);
  };

  return (
    <AdminRoute>
      <div className="min-h-screen bg-base-200 flex overflow-x-hidden">
        <Sidebar />

        <div className="flex-1 lg:ml-64 overflow-x-hidden">
          {/* Header */}
          <Header
            variant="admin"
            title="Type Kendaraan"
            subtitle="Kelola data type kendaraan"
            showThemeSwitcher={true}
          />

          {/* Content */}
          <div className="p-4 lg:p-8 min-w-0">
            {/* Filter */}
            <Filter
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSearchSubmit={handleSearch}
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
          merekOptions={merekOptions}
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
