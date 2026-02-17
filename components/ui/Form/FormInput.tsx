/** @format */

"use client";

import { useFormContext, Controller } from "react-hook-form";
import Input from "../Input";
import { InputHTMLAttributes } from "react";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
}

export default function FormInput({
  name,
  label,
  helperText,
  leftIcon,
  rightIcon,
  type = "text",
  placeholder,
  disabled,
  autoComplete,
  showPasswordToggle = false,
  className = "",
  ...props
}: FormInputProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <div className={className}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            type={type}
            label={label}
            error={errors[name]?.message as string}
            helperText={helperText}
            leftIcon={leftIcon}
            rightIcon={rightIcon}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete={autoComplete}
            showPasswordToggle={showPasswordToggle}
            {...props}
          />
        )}
      />
    </div>
  );
}
