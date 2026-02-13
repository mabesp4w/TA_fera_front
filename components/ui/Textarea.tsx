/** @format */

"use client";

import { TextareaHTMLAttributes, useId } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export default function Textarea({
  label,
  error,
  helperText,
  className = "",
  id,
  ...props
}: TextareaProps) {
  const generatedId = useId();
  const textareaId = id || generatedId;

  const textareaClasses = [
    "textarea textarea-bordered w-full min-h-[80px] pt-2",
    error && "textarea-error",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="form-control w-full">
      {label && (
        <label className="label" htmlFor={textareaId}>
          <span className="label-text">{label}</span>
        </label>
      )}
      <textarea id={textareaId} className={textareaClasses} {...props} />
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

