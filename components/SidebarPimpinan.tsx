/** @format */

"use client";

import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import {
  LayoutDashboard,
  TrendingUp,
  BarChart3,
  FileText,
  PieChart,
  Calculator,
  LogOut,
  Menu,
  X,
  Download,
  FileBarChart,
  LineChart,
  Crown,
} from "lucide-react";
import { useState } from "react";

interface MenuItem {
  title: string;
  icon: React.ReactNode;
  path: string;
  children?: MenuItem[];
}

interface SidebarPimpinanProps {
  onLogout?: () => void;
}

export default function SidebarPimpinan({ onLogout }: SidebarPimpinanProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const handleLogout = async () => {
    await logout();
    if (onLogout) {
      onLogout();
    } else {
      router.push("/login");
    }
  };

  const toggleMenu = (menuTitle: string) => {
    setExpandedMenus((prev) =>
      prev.includes(menuTitle)
        ? prev.filter((m) => m !== menuTitle)
        : [...prev, menuTitle]
    );
  };

  // Menu khusus pimpinan - dashboard, prediksi, dan laporan
  const menuItems: MenuItem[] = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5 flex-shrink-0" />,
      path: "/pimpinan/dashboard",
    },
    {
      title: "Prediksi",
      icon: <TrendingUp className="w-5 h-5 flex-shrink-0" />,
      path: "#",
      children: [
        {
          title: "Hasil Prediksi",
          icon: <FileText className="w-4 h-4 flex-shrink-0" />,
          path: "/pimpinan/prediksi/hasil",
        },
        {
          title: "Prediksi Hybrid",
          icon: <Calculator className="w-4 h-4 flex-shrink-0" />,
          path: "/pimpinan/prediksi/hybrid",
        },
        {
          title: "Evaluasi Metode",
          icon: <PieChart className="w-4 h-4 flex-shrink-0" />,
          path: "/pimpinan/prediksi/evaluasi",
        },
        {
          title: "Analisis Trend",
          icon: <LineChart className="w-4 h-4 flex-shrink-0" />,
          path: "/pimpinan/prediksi/trend",
        },
      ],
    },
    {
      title: "Laporan",
      icon: <FileBarChart className="w-5 h-5 flex-shrink-0" />,
      path: "#",
      children: [
        {
          title: "Laporan Pendapatan",
          icon: <BarChart3 className="w-4 h-4 flex-shrink-0" />,
          path: "/pimpinan/laporan/pendapatan",
        },
        {
          title: "Laporan Prediksi",
          icon: <LineChart className="w-4 h-4 flex-shrink-0" />,
          path: "/pimpinan/laporan/prediksi",
        },
        {
          title: "Export Data",
          icon: <Download className="w-4 h-4 flex-shrink-0" />,
          path: "/pimpinan/export",
        },
      ],
    },
  ];

  const isActive = (path: string) => {
    if (path === "#") return false;
    return pathname === path || pathname?.startsWith(path + "/");
  };

  const isParentActive = (item: MenuItem) => {
    if (!item.children) return false;
    return item.children.some((child) => isActive(child.path));
  };

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenus.includes(item.title);
    const active = isActive(item.path) || isParentActive(item);

    if (hasChildren) {
      return (
        <li key={item.title}>
          <details open={isExpanded || isParentActive(item)}>
            <summary
              className={`menu-item ${active ? "active" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                toggleMenu(item.title);
              }}
            >
              {item.icon}
              <span className={`${level > 0 ? "text-xs" : "text-sm font-medium"}`}>{item.title}</span>
            </summary>
            <ul className="ml-4 mt-1 space-y-1">
              {item.children?.map((child) => renderMenuItem(child, level + 1))}
            </ul>
          </details>
        </li>
      );
    }

    return (
      <li key={item.title}>
        <a
          href={item.path}
          onClick={(e) => {
            e.preventDefault();
            if (item.path !== "#") {
              router.push(item.path);
              setIsMobileMenuOpen(false);
            }
          }}
          className={`menu-link ${isActive(item.path) ? "active" : ""}`}
        >
          {item.icon}
          <span className={`${level > 0 ? "text-xs font-medium" : "text-sm font-medium"}`}>{item.title}</span>
        </a>
      </li>
    );
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          className="btn btn-circle btn-primary"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-transform duration-300 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 w-64 bg-base-100 border-r border-base-300 flex flex-col shadow-lg`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-base-300 bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="w-6 h-6 text-primary" />
              <div>
                <h1 className="text-sm font-bold text-primary leading-tight">UPPD/SAMSAT</h1>
                <p className="text-[10px] text-base-content/70">JAYAPURA</p>
              </div>
            </div>
            <button
              className="lg:hidden btn btn-ghost btn-sm btn-circle"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* User Info - Khusus Pimpinan */}
        <div className="p-4 border-b border-base-300 bg-amber-50 dark:bg-amber-950/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-lg">
              <Crown className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate text-amber-700 dark:text-amber-400">
                {user?.first_name || user?.username || "Kepala UPPD"}
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-500 font-medium">
                Kepala UPPD/SAMSAT
              </p>
              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                <Crown className="w-3 h-3" />
                Pimpinan
              </span>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto p-3">
          <div className="mb-2 px-2">
            <p className="text-[10px] font-semibold text-base-content/50 uppercase tracking-wider">
              Menu Analisis
            </p>
          </div>
          <ul className="menu menu-vertical gap-1">
            {menuItems.map((item) => renderMenuItem(item))}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-base-300 bg-base-200/50">
          <ul className="menu menu-vertical gap-1">
            <li>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleLogout();
                }}
                className="menu-link text-error hover:bg-error/10"
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">Logout</span>
              </a>
            </li>
          </ul>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
