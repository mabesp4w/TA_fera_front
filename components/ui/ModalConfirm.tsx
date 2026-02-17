/** @format */

"use client";

import { ReactNode } from "react";

interface ModalConfirmProps {
  isOpen: boolean;
  title: string;
  message: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ModalConfirm({
  isOpen,
  title,
  message,
  confirmText = "Ya",
  cancelText = "Batal",
  variant = "danger",
  onConfirm,
  onCancel,
  isLoading = false,
}: ModalConfirmProps) {
  if (!isOpen) return null;

  const variantClasses = {
    danger: "btn-error text-error-content",
    warning: "btn-warning text-warning-content",
    info: "btn-info text-info-content",
  };

  return (
    <dialog className="modal modal-open" open>
      <div className="modal-box">
        <h3 className="font-bold text-lg">{title}</h3>
        <div className="py-4 text-base-content/80">{message}</div>
        <div className="modal-action">
          <button
            className="btn btn-ghost"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            className={`btn ${variantClasses[variant]}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading && <span className="loading loading-spinner loading-sm" />}
            {confirmText}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onCancel} disabled={isLoading}></button>
      </form>
    </dialog>
  );
}
