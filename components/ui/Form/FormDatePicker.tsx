/** @format */

"use client";

import { useFormContext, Controller } from "react-hook-form";
import DatePicker from "../DatePicker";

interface FormDatePickerProps {
  name: string;
  label?: string;
  helperText?: string;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  showTimeSelect?: boolean;
  dateFormat?: string;
  className?: string;
}

export default function FormDatePicker({
  name,
  label,
  helperText,
  placeholder,
  minDate,
  maxDate,
  showTimeSelect = false,
  dateFormat,
  className = "",
  ...props
}: FormDatePickerProps) {
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
          <DatePicker
            label={label}
            error={errors[name]?.message as string}
            helperText={helperText}
            placeholder={placeholder}
            value={field.value ? new Date(field.value) : null}
            onChange={(date) => {
              field.onChange(date);
            }}
            minDate={minDate}
            maxDate={maxDate}
            showTimeSelect={showTimeSelect}
            dateFormat={dateFormat}
            {...props}
          />
        )}
      />
    </div>
  );
}

