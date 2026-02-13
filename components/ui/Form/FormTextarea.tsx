/** @format */

"use client";

import { useFormContext, Controller } from "react-hook-form";
import Textarea from "../Textarea";

interface FormTextareaProps {
  name: string;
  label?: string;
  helperText?: string;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
  className?: string;
  containerClassName?: string;
}

export default function FormTextarea({
  name,
  label,
  helperText,
  placeholder,
  disabled,
  rows = 4,
  className = "",
  containerClassName = "",
  ...props
}: FormTextareaProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <div className={containerClassName}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Textarea
            {...field}
            label={label}
            error={errors[name]?.message as string}
            helperText={helperText}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
            className={className}
            {...props}
          />
        )}
      />
    </div>
  );
}

