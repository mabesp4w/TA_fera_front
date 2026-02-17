/** @format */

"use client";

import { InputHTMLAttributes, ReactNode, useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  showPasswordToggle?: boolean;
}

export default function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = "",
  id,
  type,
  showPasswordToggle = false,
  value,
  defaultValue,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  // Pastikan value selalu terdefinisi untuk menghindari perubahan dari uncontrolled ke controlled
  const inputValue = value !== undefined ? value : defaultValue !== undefined ? defaultValue : "";

  const inputClasses = [
    "input input-bordered w-full",
    error && "input-error",
    leftIcon && "pl-10",
    (rightIcon || (isPassword && showPasswordToggle)) && "pr-10",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="form-control w-full">
      {label && (
        <label className="label" htmlFor={inputId}>
          <span className="label-text">{label}</span>
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
            <div className="text-base-content/70">{leftIcon}</div>
          </div>
        )}
        <input
          id={inputId}
          type={inputType}
          className={inputClasses}
          value={inputValue}
          {...props}
        />
        {isPassword && showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 text-base-content/70 hover:text-base-content transition-colors"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        )}
        {rightIcon && !(isPassword && showPasswordToggle) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
            <div className="text-base-content/70">{rightIcon}</div>
          </div>
        )}
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

