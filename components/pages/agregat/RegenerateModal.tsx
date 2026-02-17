/** @format */

import { AlertTriangle, RotateCw, X } from "lucide-react";
import { Button } from "@/components/ui";

interface RegenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isRegenerating: boolean;
}

export default function RegenerateModal({
  isOpen,
  onClose,
  onConfirm,
  isRegenerating,
}: RegenerateModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-base-100 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-base-200">
          <h3 className="text-lg font-semibold">Konfirmasi Regenerasi Data</h3>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
            disabled={isRegenerating}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-base-content/80">
                Apakah Anda yakin ingin meregenerasi data agregat?
              </p>
            </div>
          </div>

          <div className="bg-base-200 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium text-base-content/70">
              Proses ini akan:
            </p>
            <ul className="text-sm text-base-content/70 space-y-1 list-disc list-inside">
              <li>Memproses ulang semua data transaksi</li>
              <li>Menghitung ulang total pendapatan per periode</li>
              <li>Memperbarui data agregat yang ada</li>
              <li>Proses ini mungkin memerlukan waktu beberapa saat</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t border-base-200 bg-base-200/50">
          <Button variant="ghost" onClick={onClose} disabled={isRegenerating}>
            Batal
          </Button>
          <Button
            variant="accent"
            leftIcon={<RotateCw className="w-4 h-4" />}
            onClick={onConfirm}
            loading={isRegenerating}
          >
            Ya, Regenerasi Data
          </Button>
        </div>
      </div>
    </div>
  );
}
