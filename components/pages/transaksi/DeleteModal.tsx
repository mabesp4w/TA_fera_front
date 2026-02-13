/** @format */

"use client";

import { Modal, Button } from "@/components/ui";
import { Trash2 } from "lucide-react";
import type { TransaksiPajak } from "@/services/transaksiPajakService";

interface DeleteModalProps {
  isOpen: boolean;
  selectedItem: TransaksiPajak | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteModal({
  isOpen,
  selectedItem,
  onClose,
  onConfirm,
}: DeleteModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Konfirmasi Hapus"
      size="sm"
    >
      <div className="space-y-4">
        <p className="text-base-content/70">
          Apakah Anda yakin ingin menghapus transaksi pajak untuk{" "}
          <span className="font-semibold text-base-content">
            {selectedItem?.kendaraan_no_polisi || "kendaraan"}
          </span>
          ?
        </p>
        <p className="text-sm text-error">
          Tindakan ini tidak dapat dibatalkan.
        </p>
        <div className="flex gap-2 justify-end pt-4">
          <Button variant="ghost" onClick={onClose}>
            Batal
          </Button>
          <Button
            variant="accent"
            onClick={onConfirm}
            leftIcon={<Trash2 className="w-4 h-4" />}
          >
            Hapus
          </Button>
        </div>
      </div>
    </Modal>
  );
}
