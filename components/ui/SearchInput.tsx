/** @format */

"use client";

import { Search, X } from "lucide-react";
import { InputHTMLAttributes, useState } from "react";

interface SearchInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "onSubmit"> {
  /**
   * Current search value
   */
  value: string;
  /**
   * Callback when search value changes
   */
  onChange: (value: string) => void;
  /**
   * Callback when form is submitted (optional)
   */
  onSubmit?: (e: React.FormEvent) => void;
  /**
   * Placeholder text
   */
  placeholder?: string;
  /**
   * Show clear button when there's a value
   */
  showClearButton?: boolean;
  /**
   * Custom className for the container
   */
  containerClassName?: string;
  /**
   * Custom className for the input
   */
  inputClassName?: string;
}

export default function SearchInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Cari...",
  showClearButton = true,
  containerClassName = "",
  inputClassName = "",
  ...props
}: SearchInputProps) {
  const handleClear = () => {
    onChange("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }
  };

  const inputClasses = [
    "input input-bordered w-full pl-10",
    showClearButton && value && "pr-10",
    inputClassName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <form onSubmit={handleSubmit} className={containerClassName}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/50 pointer-events-none z-30" />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClasses}
          {...props}
        />
        {showClearButton && value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/50 hover:text-base-content transition-colors"
            aria-label="Clear search"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </form>
  );
}
