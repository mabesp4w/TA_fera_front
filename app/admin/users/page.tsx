/** @format */

"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import AdminRoute from "@/components/AdminRoute";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Card, Button } from "@/components/ui";
import { userService, type UserFormData, type UserFilters } from "@/services/userService";
import { toast } from "@/services";
import type { User, UserRole } from "@/types/auth";
import {
  Users,
  Crown,
  UserCog,
  Search,
  Plus,
  Edit2,
  Trash2,
  Lock,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CheckCircle2,
  XCircle,
  Shield,
  Eye,
  EyeOff,
} from "lucide-react";

// Validation schemas
const userSchema = yup.object().shape({
  username: yup.string().required("Username wajib diisi").min(3, "Minimal 3 karakter"),
  email: yup.string().required("Email wajib diisi").email("Email tidak valid"),
  first_name: yup.string().required("Nama depan wajib diisi"),
  last_name: yup.string().required("Nama belakang wajib diisi"),
  role: yup.string().required("Role wajib dipilih").oneOf(["admin", "pimpinan"], "Role tidak valid"),
  password: yup.string().when("$isEdit", {
    is: false,
    then: (schema) => schema.required("Password wajib diisi").min(6, "Minimal 6 karakter"),
    otherwise: (schema) => schema.notRequired(),
  }),
}) as yup.ObjectSchema<UserFormData>;

const passwordSchema = yup.object().shape({
  password: yup.string().required("Password baru wajib diisi").min(6, "Minimal 6 karakter"),
  confirmPassword: yup
    .string()
    .required("Konfirmasi password wajib diisi")
    .oneOf([yup.ref("password")], "Password tidak cocok"),
});

const ROLE_OPTIONS: { value: UserRole; label: string; icon: typeof Crown; color: string; description: string }[] = [
  {
    value: "admin",
    label: "Administrator",
    icon: Shield,
    color: "text-primary",
    description: "Akses penuh ke seluruh sistem",
  },
  {
    value: "pimpinan",
    label: "Kepala UPPD/SAMSAT",
    icon: Crown,
    color: "text-amber-500",
    description: "Akses dashboard & laporan (view only)",
  },
];

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  // Forms
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm<UserFormData>({
    resolver: yupResolver(userSchema),
    context: { isEdit: !!selectedUser },
    defaultValues: {
      username: "",
      email: "",
      first_name: "",
      last_name: "",
      role: "admin",
      password: "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm({
    resolver: yupResolver(passwordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const filters: UserFilters = {
        page: currentPage,
        page_size: pageSize,
        search: searchQuery || undefined,
        role: filterRole || undefined,
      };
      const response = await userService.getList(filters);
      setUsers(response.data);
      setTotalPages(response.total_pages);
      setTotalCount(response.total_count);
    } catch (error: any) {
      // Jika API belum tersedia (404), gunakan mock data
      if (error?.response?.status === 404) {
        toast.info("Backend API pengguna belum tersedia. Menampilkan data simulasi.");
        // Mock data untuk demo
        const mockUsers: User[] = [
          {
            id: 1,
            username: "admin",
            email: "admin@uppd.go.id",
            first_name: "Administrator",
            last_name: "Sistem",
            role: "admin",
          },
          {
            id: 2,
            username: "kepala_uppd",
            email: "kepala@uppd.go.id",
            first_name: "Dr. H. Ahmad",
            last_name: "Sulistyo",
            role: "pimpinan",
          },
        ];
        setUsers(mockUsers);
        setTotalPages(1);
        setTotalCount(mockUsers.length);
      } else {
        toast.error(error?.message || "Gagal memuat data pengguna");
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, filterRole]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreate = () => {
    setSelectedUser(null);
    reset({
      username: "",
      email: "",
      first_name: "",
      last_name: "",
      role: "admin",
      password: "",
    });
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    reset({
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role as UserRole,
      password: "",
    });
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleChangePassword = (user: User) => {
    setSelectedUser(user);
    resetPassword({ password: "", confirmPassword: "" });
    setShowPassword(false);
    setIsPasswordModalOpen(true);
  };

  const onSubmit = async (data: UserFormData) => {
    try {
      setIsSubmitting(true);
      if (selectedUser) {
        // Update
        const updateData: Partial<UserFormData> = {
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
          role: data.role,
        };
        // Only include password if provided
        if (data.password) {
          updateData.password = data.password;
        }
        await userService.update(selectedUser.id, updateData);
        toast.success("Pengguna berhasil diperbarui");
      } else {
        // Create
        await userService.create(data);
        toast.success("Pengguna berhasil ditambahkan");
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      if (error?.response?.status === 404) {
        // Mock success untuk demo
        toast.success(selectedUser ? "Pengguna berhasil diperbarui (simulasi)" : "Pengguna berhasil ditambahkan (simulasi)");
        setIsModalOpen(false);
        fetchUsers();
      } else {
        toast.error(error?.message || "Gagal menyimpan data");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitPassword = async (data: { password: string }) => {
    if (!selectedUser) return;
    try {
      setIsSubmitting(true);
      await userService.changePassword(selectedUser.id, data.password);
      toast.success("Password berhasil diubah");
      setIsPasswordModalOpen(false);
    } catch (error: any) {
      if (error?.response?.status === 404) {
        toast.success("Password berhasil diubah (simulasi)");
        setIsPasswordModalOpen(false);
      } else {
        toast.error(error?.message || "Gagal mengubah password");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;
    try {
      setIsSubmitting(true);
      await userService.delete(selectedUser.id);
      toast.success("Pengguna berhasil dihapus");
      setIsDeleteModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      if (error?.response?.status === 404) {
        toast.success("Pengguna berhasil dihapus (simulasi)");
        setIsDeleteModalOpen(false);
        fetchUsers();
      } else {
        toast.error(error?.message || "Gagal menghapus pengguna");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = ROLE_OPTIONS.find((r) => r.value === role);
    if (!roleConfig) return null;
    const Icon = roleConfig.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border ${roleConfig.color} bg-current/5`}>
        <Icon className={`w-3 h-3 ${roleConfig.color}`} />
        {roleConfig.label}
      </span>
    );
  };

  return (
    <AdminRoute>
      <div className="min-h-screen bg-base-200 flex overflow-x-hidden">
        <Sidebar />

        <div className="flex-1 lg:ml-64 overflow-x-hidden">
          <Header
            variant="admin"
            title="Manajemen Pengguna"
            subtitle="Kelola pengguna sistem termasuk role Kepala UPPD/SAMSAT"
            showThemeSwitcher={true}
          />

          <div className="p-4 lg:p-8 min-w-0">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="p-4 border-l-4 border-primary">
                <p className="text-[10px] text-base-content/60 uppercase">Total Pengguna</p>
                <p className="text-2xl font-bold text-primary">{totalCount}</p>
              </Card>
              <Card className="p-4 border-l-4 border-amber-500">
                <p className="text-[10px] text-base-content/60 uppercase">Kepala UPPD</p>
                <p className="text-2xl font-bold text-amber-500">
                  {users.filter((u) => u.role === "pimpinan").length || 0}
                </p>
              </Card>
              <Card className="p-4 border-l-4 border-info">
                <p className="text-[10px] text-base-content/60 uppercase">Administrator</p>
                <p className="text-2xl font-bold text-info">
                  {users.filter((u) => u.role === "admin").length || 0}
                </p>
              </Card>
  
            </div>

            {/* Filter */}
            <Card className="mb-6">
              <div className="flex flex-col lg:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                  <label className="label py-0">
                    <span className="label-text text-xs font-medium">Cari Pengguna</span>
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/50" />
                    <input
                      type="text"
                      placeholder="Cari berdasarkan nama atau username..."
                      className="input input-bordered input-sm w-full pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="w-full lg:w-48">
                  <label className="label py-0">
                    <span className="label-text text-xs font-medium">Filter Role</span>
                  </label>
                  <select
                    className="select select-bordered select-sm w-full"
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                  >
                    <option value="">Semua Role</option>
                    {ROLE_OPTIONS.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>
                <Button variant="primary" onClick={handleCreate} leftIcon={<Plus className="w-4 h-4" />}>
                  Tambah Pengguna
                </Button>
              </div>
            </Card>

            {/* Data Table */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Daftar Pengguna
                  <span className="badge badge-sm badge-ghost">{totalCount}</span>
                </h3>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <span className="loading loading-spinner loading-lg text-primary"></span>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-base-content/30 mx-auto mb-2" />
                  <p className="text-sm text-base-content/50">Tidak ada pengguna ditemukan</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="table table-sm w-full">
                      <thead>
                        <tr className="bg-base-200/50">
                          <th className="text-xs">Nama Lengkap</th>
                          <th className="text-xs">Username</th>
                          <th className="text-xs">Email</th>
                          <th className="text-xs">Role</th>
                          <th className="text-xs text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.id} className="hover:bg-base-200/30 transition-colors">
                            <td className="text-xs font-medium">
                              {user.first_name} {user.last_name}
                            </td>
                            <td className="text-xs text-base-content/70">{user.username}</td>
                            <td className="text-xs text-base-content/70">{user.email}</td>
                            <td>{getRoleBadge(user.role)}</td>
                            <td className="text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  className="btn btn-xs btn-ghost btn-square text-info"
                                  onClick={() => handleEdit(user)}
                                  title="Edit"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  className="btn btn-xs btn-ghost btn-square text-warning"
                                  onClick={() => handleChangePassword(user)}
                                  title="Reset Password"
                                >
                                  <Lock className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  className="btn btn-xs btn-ghost btn-square text-error"
                                  onClick={() => handleDelete(user)}
                                  title="Hapus"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="flex flex-col sm:flex-row items-center justify-between mt-4 pt-4 border-t border-base-200 gap-3">
                    <p className="text-xs text-base-content/60">
                      Menampilkan <span className="font-semibold">{(currentPage - 1) * pageSize + 1}</span>-
                      <span className="font-semibold">{Math.min(currentPage * pageSize, totalCount)}</span> dari{" "}
                      <span className="font-semibold">{totalCount}</span> pengguna
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        className="btn btn-xs btn-ghost btn-square"
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage <= 1}
                      >
                        <ChevronsLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        className="btn btn-xs btn-ghost btn-square"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage <= 1}
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum: number;
                        if (totalPages <= 5) pageNum = i + 1;
                        else if (currentPage <= 3) pageNum = i + 1;
                        else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                        else pageNum = currentPage - 2 + i;
                        return (
                          <button
                            key={`page-${pageNum}-${i}`}
                            className={`btn btn-xs btn-square ${pageNum === currentPage ? "btn-primary" : "btn-ghost"}`}
                            onClick={() => setCurrentPage(pageNum)}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      <button
                        className="btn btn-xs btn-ghost btn-square"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        className="btn btn-xs btn-ghost btn-square"
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage >= totalPages}
                      >
                        <ChevronsRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </Card>
          </div>
        </div>

        {/* Create/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-base-100 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-base-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">
                    {selectedUser ? "Edit Pengguna" : "Tambah Pengguna Baru"}
                  </h3>
                  <button className="btn btn-sm btn-ghost btn-circle" onClick={() => setIsModalOpen(false)}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label py-0">
                      <span className="label-text text-xs font-medium">Username</span>
                    </label>
                    <input
                      type="text"
                      className={`input input-bordered input-sm w-full ${errors.username ? "input-error" : ""}`}
                      {...register("username")}
                      disabled={!!selectedUser}
                    />
                    {errors.username && <span className="text-error text-xs">{errors.username.message}</span>}
                  </div>
                  <div>
                    <label className="label py-0">
                      <span className="label-text text-xs font-medium">Email</span>
                    </label>
                    <input
                      type="email"
                      className={`input input-bordered input-sm w-full ${errors.email ? "input-error" : ""}`}
                      {...register("email")}
                    />
                    {errors.email && <span className="text-error text-xs">{errors.email.message}</span>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label py-0">
                      <span className="label-text text-xs font-medium">Nama Depan</span>
                    </label>
                    <input
                      type="text"
                      className={`input input-bordered input-sm w-full ${errors.first_name ? "input-error" : ""}`}
                      {...register("first_name")}
                    />
                    {errors.first_name && <span className="text-error text-xs">{errors.first_name.message}</span>}
                  </div>
                  <div>
                    <label className="label py-0">
                      <span className="label-text text-xs font-medium">Nama Belakang</span>
                    </label>
                    <input
                      type="text"
                      className={`input input-bordered input-sm w-full ${errors.last_name ? "input-error" : ""}`}
                      {...register("last_name")}
                    />
                    {errors.last_name && <span className="text-error text-xs">{errors.last_name.message}</span>}
                  </div>
                </div>

                <div>
                  <label className="label py-0">
                    <span className="label-text text-xs font-medium">Role</span>
                  </label>
                  <select
                    className={`select select-bordered select-sm w-full ${errors.role ? "select-error" : ""}`}
                    {...register("role")}
                  >
                    {ROLE_OPTIONS.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label} - {role.description}
                      </option>
                    ))}
                  </select>
                  {errors.role && <span className="text-error text-xs">{errors.role.message}</span>}
                </div>

                <div>
                  <label className="label py-0">
                    <span className="label-text text-xs font-medium">
                      {selectedUser ? "Password Baru (kosongkan jika tidak diubah)" : "Password"}
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className={`input input-bordered input-sm w-full pr-10 ${errors.password ? "input-error" : ""}`}
                      {...register("password")}
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <span className="text-error text-xs">{errors.password.message}</span>}
                </div>

                {/* Role Info */}
                <div className="alert alert-info text-xs">
                  <span>Pilih role "Kepala UPPD/SAMSAT" untuk memberikan akses dashboard pimpinan dengan fitur analisis dan laporan.</span>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                    Batal
                  </Button>
                  <Button type="submit" variant="primary" loading={isSubmitting}>
                    {selectedUser ? "Simpan Perubahan" : "Tambah Pengguna"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Change Password Modal */}
        {isPasswordModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-base-100 rounded-2xl w-full max-w-md">
              <div className="p-6 border-b border-base-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">Reset Password</h3>
                  <button className="btn btn-sm btn-ghost btn-circle" onClick={() => setIsPasswordModalOpen(false)}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-base-content/70 mt-1">
                  Reset password untuk: <span className="font-semibold">{selectedUser?.username}</span>
                </p>
              </div>
              <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="p-6 space-y-4">
                <div>
                  <label className="label py-0">
                    <span className="label-text text-xs font-medium">Password Baru</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className={`input input-bordered input-sm w-full pr-10 ${passwordErrors.password ? "input-error" : ""}`}
                      {...registerPassword("password")}
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordErrors.password && <span className="text-error text-xs">{passwordErrors.password.message}</span>}
                </div>

                <div>
                  <label className="label py-0">
                    <span className="label-text text-xs font-medium">Konfirmasi Password</span>
                  </label>
                  <input
                    type="password"
                    className={`input input-bordered input-sm w-full ${passwordErrors.confirmPassword ? "input-error" : ""}`}
                    {...registerPassword("confirmPassword")}
                  />
                  {passwordErrors.confirmPassword && (
                    <span className="text-error text-xs">{passwordErrors.confirmPassword.message}</span>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="ghost" onClick={() => setIsPasswordModalOpen(false)}>
                    Batal
                  </Button>
                  <Button type="submit" variant="primary" loading={isSubmitting}>
                    Reset Password
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-base-100 rounded-2xl w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-error/10 rounded-full flex items-center justify-center">
                    <Trash2 className="w-6 h-6 text-error" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Hapus Pengguna</h3>
                    <p className="text-sm text-base-content/70">
                      Apakah Anda yakin ingin menghapus pengguna ini?
                    </p>
                  </div>
                </div>
                <div className="bg-base-200 rounded-lg p-4 mb-4">
                  <p className="text-sm">
                    <span className="font-semibold">{selectedUser?.first_name} {selectedUser?.last_name}</span>
                  </p>
                  <p className="text-xs text-base-content/70">@{selectedUser?.username}</p>
                  <p className="text-xs text-base-content/70">{selectedUser?.email}</p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>
                    Batal
                  </Button>
                  <Button variant="error" onClick={confirmDelete} loading={isSubmitting}>
                    Hapus
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminRoute>
  );
}
