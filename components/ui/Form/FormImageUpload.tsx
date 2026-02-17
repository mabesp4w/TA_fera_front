/** @format */

"use client";

import { useFormContext, Controller } from "react-hook-form";
import ImageUpload from "../ImageUpload";
import type { ImageListType } from "react-images-uploading";

interface FormImageUploadProps {
  name: string;
  label?: string;
  helperText?: string;
  maxNumber?: number;
  maxFileSize?: number;
  acceptType?: string[];
  multiple?: boolean;
  className?: string;
}

export default function FormImageUpload({
  name,
  label,
  helperText,
  maxNumber = 1,
  maxFileSize = 5242880,
  acceptType = ["jpg", "jpeg", "png", "gif"],
  multiple = false,
  className = "",
}: FormImageUploadProps) {
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
          <ImageUpload
            label={label}
            error={errors[name]?.message as string}
            helperText={helperText}
            images={(field.value as ImageListType) || []}
            onChange={(imageList) => {
              field.onChange(imageList);
            }}
            maxNumber={maxNumber}
            maxFileSize={maxFileSize}
            acceptType={acceptType}
            multiple={multiple}
          />
        )}
      />
    </div>
  );
}

