/** @format */

"use client";

import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import {
  LayoutDashboard,
  Database,
  Car,
  Receipt,
  TrendingUp,
  BarChart3,
  FileText,
  FileBarChart,
  Settings,
  LogOut,
  Menu,
  X,
  Users,
  MapPin,
  Tag,
  CarFront,
  Wallet,

  PieChart,
  Calculator,
} from "lucide-react";
import { useState } from "react";

interface MenuItem {
  title: string;
  icon: React.ReactNode;
  path: string;
  children?: MenuItem[];
}

interface SidebarProps {
  onLogout?: () => void;
}

export default function Sidebar({ onLogout }: SidebarProps) {
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

  const menuItems: MenuItem[] = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5 flex-shrink-0" />,
      path: "/admin/dashboard",
    },
    {
      title: "Master Data",
      icon: <Database className="w-5 h-5 flex-shrink-0" />,
      path: "#",
      children: [
        {
          title: "Jenis Kendaraan",
          icon: <Tag className="w-4 h-4 flex-shrink-0" />,
          path: "/admin/master/jenis-kendaraan",
        },
        {
          title: "Kecamatan",
          icon: <MapPin className="w-4 h-4 flex-shrink-0" />,
          path: "/admin/master/kecamatan",
        },
        {
          title: "Kelurahan",
          icon: <MapPin className="w-4 h-4 flex-shrink-0" />,
          path: "/admin/master/kelurahan",
        },
        {
          title: "Merek Kendaraan",
          icon: <Tag className="w-4 h-4 flex-shrink-0" />,
          path: "/admin/master/merek-kendaraan",
        },
        {
          title: "Type Kendaraan",
          icon: <CarFront className="w-4 h-4 flex-shrink-0" />,
          path: "/admin/master/type-kendaraan",
        },
        {
          title: "Wajib Pajak",
          icon: <Users className="w-4 h-4 flex-shrink-0" />,
          path: "/admin/master/wajib-pajak",
        },
      ],
    },
    {
      title: "Kendaraan Bermotor",
      icon: <Car className="w-5 h-5 flex-shrink-0" />,
      path: "/admin/kendaraan",
    },
    {
      title: "Transaksi Pajak",
      icon: <Receipt className="w-5 h-5 flex-shrink-0" />,
      path: "/admin/transaksi",
    },
     {
       title: "Prediksi",
       icon: <TrendingUp className="w-5 h-5 flex-shrink-0" />,
       path: "#",
       children: [
         {
           title: "Hybrid Method",
           icon: <Calculator className="w-4 h-4 flex-shrink-0" />,
           path: "/admin/prediksi/hybrid",
         },
         {
           title: "Generate Prediksi",
           icon: <Calculator className="w-4 h-4 flex-shrink-0" />,
           path: "/admin/prediksi/generate",
         },
         {
           title: "Evaluasi",
           icon: <PieChart className="w-4 h-4 flex-shrink-0" />,
           path: "/admin/prediksi/evaluation",
         },
         {
           title: "Trend Analysis",
           icon: <TrendingUp className="w-4 h-4 flex-shrink-0" />,
           path: "/admin/prediksi/trend",
         },
       ],
     },
    {
      title: "Agregat Pendapatan",
      icon: <BarChart3 className="w-5 h-5 flex-shrink-0" />,
      path: "/admin/agregat",
    },
    {
      title: "Hasil Prediksi",
      icon: <FileText className="w-5 h-5 flex-shrink-0" />,
      path: "/admin/hasil-prediksi",
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
        <div className="p-4 border-b border-base-300">
          <div className="flex items-center justify-between">
            <h1 className="text-base font-bold text-primary">UPPD/SAMSAT JAYAPURA</h1>
            <button
              className="lg:hidden btn btn-ghost btn-sm btn-circle"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-base-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
              <span className="text-sm font-bold">
                {user?.first_name?.[0]?.toUpperCase() ||
                  user?.username?.[0]?.toUpperCase() ||
                  "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">
                {user?.first_name || user?.username || "User"}
              </p>
              <p className="text-[10px] text-base-content/70 truncate">
                {user?.role || "User"}
              </p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="menu menu-vertical gap-1">
            {menuItems.map((item) => renderMenuItem(item))}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-base-300">
          <ul className="menu menu-vertical gap-1">
            <li>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleLogout();
                }}
                className="menu-link"
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

