/** @format */

"use client";

import { useFormContext, Controller } from "react-hook-form";
import Select from "../Select";
import type { SelectOption } from "../types";

interface FormSelectProps {
  name: string;
  label?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
  isDisabled?: boolean;
  isMulti?: boolean;
  isClearable?: boolean;
  isSearchable?: boolean;
  menuPosition?: "absolute" | "fixed";
  menuPlacement?: "auto" | "bottom" | "top";
  menuShouldScrollIntoView?: boolean;
  menuShouldBlockScroll?: boolean;
  className?: string;
}

export default function FormSelect({
  name,
  label,
  helperText,
  options,
  placeholder,
  isDisabled = false,
  isMulti = false,
  isClearable = false,
  isSearchable = true,
  menuPosition = "absolute",
  menuPlacement = "bottom",
  menuShouldScrollIntoView = false,
  menuShouldBlockScroll = false,
  className = "",
}: FormSelectProps) {
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
          <Select
            label={label}
            error={errors[name]?.message as string}
            helperText={helperText}
            options={options}
            placeholder={placeholder}
            isDisabled={isDisabled}
            isMulti={isMulti}
            isClearable={isClearable}
            isSearchable={isSearchable}
            menuPosition={menuPosition}
            menuPlacement={menuPlacement}
            menuShouldScrollIntoView={menuShouldScrollIntoView}
            menuShouldBlockScroll={menuShouldBlockScroll}
            value={
              isMulti
                ? Array.isArray(field.value)
                  ? field.value
                  : []
                : field.value
                  ? options.find((opt) => opt.value === field.value) || null
                  : null
            }
            onChange={(selected) => {
              if (isMulti) {
                // For multi-select, selected is an array
                field.onChange(
                  Array.isArray(selected)
                    ? selected.map((item) => item.value)
                    : []
                );
              } else {
                // For single select, extract value from SelectOption object
                field.onChange(selected ? (selected as SelectOption).value : null);
              }
            }}
          />
        )}
      />
    </div>
  );
}

