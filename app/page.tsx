/** @format */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import Header from "../components/Header";
import { Button } from "@/components/ui";
import { LogIn } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated, logout, isLoading } = useAuthStore();

  useEffect(() => {
    // Redirect admin to dashboard
    if (isAuthenticated && user?.role === "admin") {
      router.push("/admin/dashboard");
    }
  }, [isAuthenticated, user, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header
        showLogo={true}
        showUserMenu={true}
        showThemeSwitcher={true}
      />
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center font-sans">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">UPPD/SAMSAT JAYAPURA</h1>
          <p className="mt-4 text-lg text-base-content/70 mb-2">
            PREDIKSI PENDAPATAN PAJAK KENDARAAN BERMOTOR
          </p>
          <p className="text-base text-base-content/60 mb-8">
            Menggunakan Metode Exponential Smoothing
          </p>
          {!isAuthenticated && (
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push("/login")}
              leftIcon={<LogIn className="w-5 h-5" />}
            >
              Login untuk Melanjutkan
            </Button>
          )}
          {isAuthenticated && user?.role !== "admin" && (
            <p className="text-base-content/70">
              Anda login sebagai <span className="font-semibold">{user?.role}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
