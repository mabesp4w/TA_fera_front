/** @format */

"use client";

import { ReactNode, useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full";
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
  actions?: ReactNode;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  closeOnOverlayClick = true,
  showCloseButton = true,
  actions,
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    xs: "max-w-xs",
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    full: "max-w-full",
  };

  return (
    <dialog
      className={`modal ${isOpen ? "modal-open" : ""}`}
      style={{ zIndex: 999 }}
      onClick={(e) => {
        // Prevent modal from closing when clicking inside modal content
        if (e.target === e.currentTarget && closeOnOverlayClick) {
          onClose();
        }
      }}
    >
      <div className={`modal-box ${sizeClasses[size]}`}>
        {title && (
          <h3 className="text-lg font-bold mb-4 flex items-center justify-between">
            <span>{title}</span>
            {showCloseButton && (
              <button
                className="btn btn-sm btn-circle btn-ghost"
                onClick={onClose}
              >
                ✕
              </button>
            )}
          </h3>
        )}
        <div className="py-4">{children}</div>
        {actions && <div className="modal-action">{actions}</div>}
      </div>
    </dialog>
  );
}

