/** @format */

"use client";

import { Modal, Button } from "@/components/ui";
import { Trash2, AlertTriangle } from "lucide-react";

interface BulkDeleteModalProps {
  isOpen: boolean;
  filterDescription: string;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function BulkDeleteModal({
  isOpen,
  filterDescription,
  isDeleting,
  onClose,
  onConfirm,
}: BulkDeleteModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Konfirmasi Hapus Massal"
      size="sm"
    >
      <div className="space-y-4">
        {/* Warning Box */}
        <div className="flex items-start gap-3 p-4 bg-error/10 rounded-lg border border-error/20">
          <AlertTriangle className="w-5 h-5 text-error shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-error">Peringatan!</p>
            <p className="text-sm text-error/80 mt-1">
              Tindakan ini akan menghapus <strong>SEMUA</strong> data transaksi sesuai filter.
            </p>
          </div>
        </div>

        <p className="text-base-content/70">
          Apakah Anda yakin ingin menghapus semua data transaksi dengan filter:
        </p>

        {/* Filter Description */}
        <div className="p-3 bg-base-200 rounded-lg border border-base-300">
          <p className="font-semibold text-base-content">
            {filterDescription}
          </p>
        </div>

        <p className="text-sm text-error font-medium flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Tindakan ini tidak dapat dibatalkan.
        </p>

        <div className="flex gap-2 justify-end pt-4">
          <Button variant="ghost" onClick={onClose} disabled={isDeleting}>
            Batal
          </Button>
          <Button
            variant="error"
            onClick={onConfirm}
            disabled={isDeleting}
            leftIcon={<Trash2 className="w-4 h-4" />}
          >
            {isDeleting ? "Menghapus..." : "Hapus Semua"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
