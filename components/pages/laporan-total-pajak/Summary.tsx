/** @format */

import { Card } from "@/components/ui";
import {
  Wallet,
  Car,
  Receipt,
  TrendingUp,
  CreditCard,
  Banknote,
} from "lucide-react";
import type { LaporanTotalPajakSummary } from "@/services/laporanTotalPajakService";

interface SummaryProps {
  summary: LaporanTotalPajakSummary | null;
  isLoading: boolean;
}

// Helper untuk memastikan nilai adalah number
const toNumber = (value: number | string | null | undefined): number => {
  if (value === null || value === undefined || value === "") {
    return 0;
  }
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  if (typeof value === "number") {
    return isNaN(value) ? 0 : value;
  }
  return 0;
};

const formatRupiah = (amount: number | string | null | undefined) => {
  const num = toNumber(amount);
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

export default function Summary({ summary, isLoading }: SummaryProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-base-300 rounded w-32 mb-4"></div>
              <div className="h-10 bg-base-300 rounded w-48"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  const mainCards = [
    {
      title: "Total Pendapatan",
      value: formatRupiah(summary.total_bayar),
      icon: <Wallet className="w-8 h-8 text-primary" />,
      color: "bg-primary/10",
      subtitle: `${summary.jumlah_transaksi} transaksi`,
    },
    {
      title: "Total PKB",
      value: formatRupiah(summary.total_pkb),
      icon: <Car className="w-8 h-8 text-success" />,
      color: "bg-success/10",
      subtitle: `Pokok: ${formatRupiah(summary.total_pokok_pkb)} | Denda: ${formatRupiah(summary.total_denda_pkb)}`,
    },
    {
      title: "Total SWDKLLJ",
      value: formatRupiah(summary.total_swdkllj),
      icon: <Receipt className="w-8 h-8 text-info" />,
      color: "bg-info/10",
      subtitle: `Pokok: ${formatRupiah(summary.total_pokok_swdkllj)} | Denda: ${formatRupiah(summary.total_denda_swdkllj)}`,
    },
    {
      title: "Total BBNKB",
      value: formatRupiah(summary.total_bbnkb),
      icon: <Banknote className="w-8 h-8 text-warning" />,
      color: "bg-warning/10",
      subtitle: `Pokok: ${formatRupiah(summary.total_pokok_bbnkb)} | Denda: ${formatRupiah(summary.total_denda_bbnkb)}`,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Main Cards - 2 kolom agar lebih lebar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {mainCards.map((card, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 ${card.color} rounded-xl flex items-center justify-center shrink-0`}>
                {card.icon}
              </div>
              <div className="flex-1">
                <p className="text-sm text-base-content/70 mb-1">{card.title}</p>
                <p className="text-2xl font-bold text-base-content whitespace-nowrap">
                  {card.value}
                </p>
                <p className="text-xs text-base-content/50 mt-1">{card.subtitle}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center shrink-0">
              <CreditCard className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-base-content/70">Total Opsen</p>
              <p className="text-xl font-bold whitespace-nowrap">
                {formatRupiah(summary.total_opsen)}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center shrink-0">
              <Car className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-base-content/70">Jumlah Kendaraan</p>
              <p className="text-xl font-bold">
                {summary.jumlah_kendaraan.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-error/10 rounded-xl flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6 text-error" />
            </div>
            <div>
              <p className="text-sm text-base-content/70">Total Denda</p>
              <p className="text-xl font-bold whitespace-nowrap">
                {formatRupiah(
                  toNumber(summary.total_denda_pkb) +
                    toNumber(summary.total_denda_swdkllj) +
                    toNumber(summary.total_denda_bbnkb)
                )}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
