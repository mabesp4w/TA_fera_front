/** @format */

"use client";

import { useId } from "react";
import ReactDatePicker from "react-datepicker";
import { Calendar } from "lucide-react";

interface DatePickerProps {
  label?: string;
  error?: string;
  helperText?: string;
  onChange?: (date: Date | null) => void;
  value?: Date | null;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  showTimeSelect?: boolean;
  dateFormat?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
}

export default function DatePicker({
  label,
  error,
  helperText,
  className = "",
  id,
  onChange,
  value,
  placeholder,
  minDate,
  maxDate,
  showTimeSelect = false,
  dateFormat = "dd/MM/yyyy",
  disabled = false,
}: DatePickerProps) {
  const generatedId = useId();
  const datePickerId = id || generatedId;

  const inputClasses = [
    "input input-bordered",
    error && "input-error",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="form-control">
      {label && (
        <label className="label" htmlFor={datePickerId}>
          <span className="label-text">{label}</span>
        </label>
      )}
      <div className="relative">
        <ReactDatePicker
          id={datePickerId}
          selected={value || null}
          onChange={(date: Date | null) => onChange && onChange(date)}
          className={inputClasses}
          dateFormat={dateFormat}
          showPopperArrow={false}
          wrapperClassName="w-full"
          placeholderText={placeholder}
          minDate={minDate}
          maxDate={maxDate}
          showTimeSelect={showTimeSelect}
          disabled={disabled}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Calendar className="w-5 h-5 text-base-content/50" />
        </div>
      </div>
      {error && (
        <label className="label">
          <span className="label-text-alt text-error">{error}</span>
        </label>
      )}
      {helperText && !error && (
        <label className="label">
          <span className="label-text-alt text-base-content/70">{helperText}</span>
        </label>
      )}
    </div>
  );
}

