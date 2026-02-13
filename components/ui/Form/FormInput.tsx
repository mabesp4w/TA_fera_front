/** @format */

"use client";

import { useFormContext, Controller } from "react-hook-form";
import Input from "../Input";

interface FormInputProps {
  name: string;
  label?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  autoComplete?: string;
  showPasswordToggle?: boolean;
  className?: string;
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
