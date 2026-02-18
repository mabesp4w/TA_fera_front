/** @format */

"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import ThemeSwitcher from "./ThemeSwitcher";
import { Button } from "@/components/ui";
import { LogIn, LogOut, LayoutDashboard } from "lucide-react";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
  showUserMenu?: boolean;
  showThemeSwitcher?: boolean;
  variant?: "default" | "admin";
  className?: string;
}

export default function Header({
  title,
  subtitle,
  showLogo = true,
  showUserMenu = true,
  showThemeSwitcher = true,
  variant = "default",
  className = "",
}: HeaderProps) {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  // Admin variant - untuk halaman admin dengan sidebar
  if (variant === "admin") {
    return (
      <div
        className={`sticky top-0 z-10 bg-base-100 shadow-sm border-b border-base-300 ${className}`}
      >
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            {title && <h1 className="text-2xl font-bold">{title}</h1>}
            {subtitle && (
              <p className="text-sm text-base-content/70">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {showThemeSwitcher && <ThemeSwitcher />}
          </div>
        </div>
      </div>
    );
  }

  // Default variant - untuk halaman non-admin
  return (
    <div className={`navbar bg-base-100 shadow-lg ${className}`}>
      <div className="flex-1">
        {showLogo && (
          <a
            className="btn btn-ghost text-xl"
            onClick={() => router.push("/admin/dashboard")}
          >
            UPPD/SAMSAT JAYAPURA
          </a>
        )}
        {title && !showLogo && (
          <h1 className="text-xl font-bold">{title}</h1>
        )}
      </div>
      <div className="flex-none gap-2">
        {showThemeSwitcher && <ThemeSwitcher />}
        {showUserMenu && (
          <>
            {isAuthenticated ? (
              <>
                {user?.role === "admin" && (
                  <Button
                    variant="ghost"
                    onClick={() => router.push("/admin/dashboard")}
                    leftIcon={<LayoutDashboard className="w-5 h-5" />}
                    className="hidden sm:flex"
                  >
                    Dashboard
                  </Button>
                )}
                <div className="dropdown dropdown-end">
                  <div
                    tabIndex={0}
                    role="button"
                    className="btn btn-ghost btn-circle avatar"
                  >
                    <div className="w-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
                      <span className="text-lg font-bold">
                        {user?.first_name?.[0]?.toUpperCase() ||
                          user?.username?.[0]?.toUpperCase() ||
                          "U"}
                      </span>
                    </div>
                  </div>
                  <ul
                    tabIndex={0}
                    className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52 border border-base-300"
                  >
                    <li>
                      <a>
                        <span className="font-semibold">
                          {user?.username}
                        </span>
                        <span className="badge badge-primary badge-sm">
                          {user?.role}
                        </span>
                      </a>
                    </li>
                    <li>
                      <a onClick={handleLogout}>
                        <LogOut className="w-4 h-4" />
                        Logout
                      </a>
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <Button
                variant="primary"
                onClick={() => router.push("/login")}
                leftIcon={<LogIn className="w-5 h-5" />}
              >
                Login
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

