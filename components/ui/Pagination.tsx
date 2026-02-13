/** @format */

import Button from "./Button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  startIndex?: number;
  endIndex?: number;
  totalCount?: number;
  showInfo?: boolean;
  maxVisiblePages?: number;
  size?: "sm" | "md" | "lg";
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  startIndex,
  endIndex,
  totalCount,
  showInfo = true,
  maxVisiblePages = 5,
  size = "sm",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const sizeClasses = {
    sm: "h-8 min-h-[2rem] px-2",
    md: "h-10 min-h-[2.5rem] px-3",
    lg: "h-12 min-h-[3rem] px-4",
  };

  // Generate page numbers array
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];

    if (totalPages <= maxVisiblePages) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show limited pages with ellipsis
      const halfVisible = Math.floor(maxVisiblePages / 2);
      let startPage = Math.max(1, currentPage - halfVisible);
      let endPage = Math.min(totalPages, currentPage + halfVisible);

      // Adjust if near the start
      if (currentPage <= halfVisible) {
        endPage = maxVisiblePages;
      }

      // Adjust if near the end
      if (currentPage > totalPages - halfVisible) {
        startPage = totalPages - maxVisiblePages + 1;
      }

      // Add first page
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) {
          pages.push("...");
        }
      }

      // Add visible pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Add last page
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push("...");
        }
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-base-300">
      {showInfo && startIndex !== undefined && endIndex !== undefined && totalCount !== undefined && (
        <div className="text-xs text-base-content/70">
          Menampilkan {startIndex} - {endIndex} dari {totalCount} data
        </div>
      )}

      <div className={`join ${showInfo ? "" : "mx-auto"}`}>
        {/* Previous Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`join-item ${sizeClasses[size]}`}
          title="Halaman sebelumnya"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {/* Page Numbers */}
        {pageNumbers.map((page, index) => {
          if (page === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className={`join-item flex items-center justify-center text-base-content/50 ${sizeClasses[size]}`}
              >
                ...
              </span>
            );
          }

          const pageNum = page as number;
          const isActive = currentPage === pageNum;

          return (
            <Button
              key={pageNum}
              variant={isActive ? "primary" : "ghost"}
              size="sm"
              onClick={() => onPageChange(pageNum)}
              className={`join-item min-w-[2rem] ${sizeClasses[size]} ${
                isActive ? "font-semibold" : ""
              }`}
            >
              {pageNum}
            </Button>
          );
        })}

        {/* Next Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`join-item ${sizeClasses[size]}`}
          title="Halaman berikutnya"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
