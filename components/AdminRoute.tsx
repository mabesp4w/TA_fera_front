/** @format */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * Component untuk protect route yang hanya bisa diakses admin
 * Redirect ke login jika tidak authenticated
 * Redirect ke home jika bukan admin
 */
export default function AdminRoute({ children }: AdminRouteProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      setIsChecking(true);

      // Check authentication first
      if (!isAuthenticated) {
        await checkAuth();
      }

      setIsChecking(false);
    };

    checkAccess();
  }, [isAuthenticated, checkAuth]);

  useEffect(() => {
    // Only redirect after checking is complete
    if (!isChecking && !isLoading) {
      // Redirect to login if not authenticated
      if (!isAuthenticated) {
        router.push("/login");
        return;
      }

      // Redirect to home if not admin
      if (user?.role !== "admin") {
        router.push("/");
        return;
      }
    }
  }, [isChecking, isLoading, isAuthenticated, user?.role, router]);

  // Show loading while checking auth
  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  // Show loading if redirecting
  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  // Render children if user is admin
  return <>{children}</>;
}
