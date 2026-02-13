/** @format */

"use client";

import ImageUploading, { ImageListType } from "react-images-uploading";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import Button from "./Button";

interface ImageUploadProps {
  label?: string;
  error?: string;
  helperText?: string;
  images: ImageListType;
  onChange: (imageList: ImageListType) => void;
  maxNumber?: number;
  maxFileSize?: number;
  acceptType?: string[];
  multiple?: boolean;
  className?: string;
}

export default function ImageUpload({
  label,
  error,
  helperText,
  images,
  onChange,
  maxNumber = 1,
  maxFileSize = 5242880, // 5MB default
  acceptType = ["jpg", "jpeg", "png", "gif"],
  multiple = false,
  className = "",
}: ImageUploadProps) {
  const handleChange = (imageList: ImageListType) => {
    onChange(imageList);
  };

  return (
    <div className={`form-control ${className}`}>
      {label && (
        <label className="label">
          <span className="label-text">{label}</span>
        </label>
      )}
      <ImageUploading
        value={images}
        onChange={handleChange}
        maxNumber={maxNumber}
        maxFileSize={maxFileSize}
        acceptType={acceptType}
        multiple={multiple}
      >
        {({
          imageList,
          onImageUpload,
          onImageRemoveAll,
          onImageUpdate,
          onImageRemove,
          isDragging,
          dragProps,
          errors,
        }) => (
          <div className="w-full">
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                error
                  ? "border-error bg-error/10"
                  : isDragging
                  ? "border-primary bg-primary/10"
                  : "border-base-300 bg-base-200/50"
              }`}
              {...dragProps}
            >
              {imageList.length === 0 ? (
                <div className="flex flex-col items-center gap-2">
                  <ImageIcon className="w-12 h-12 text-base-content/50" />
                  <p className="text-sm text-base-content/70">
                    Drag & drop images here, or click to select
                  </p>
                  <p className="text-xs text-base-content/50">
                    Max {maxNumber} image{maxNumber > 1 ? "s" : ""} ({maxFileSize / 1024 / 1024}MB)
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onImageUpload}
                    leftIcon={<Upload className="w-4 h-4" />}
                  >
                    Select Image
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-4 justify-center">
                    {imageList.map((image, index) => (
                      <div
                        key={index}
                        className="relative group border border-base-300 rounded-lg overflow-hidden"
                      >
                        <img
                          src={image.dataURL}
                          alt={`upload-${index}`}
                          className="w-32 h-32 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="xs"
                            onClick={() => onImageUpdate(index)}
                            className="!text-white hover:!bg-white/20"
                          >
                            Update
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="xs"
                            onClick={() => onImageRemove(index)}
                            className="!text-white hover:!bg-error"
                            leftIcon={<X className="w-4 h-4" />}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={onImageUpload}
                      leftIcon={<Upload className="w-4 h-4" />}
                      disabled={imageList.length >= maxNumber}
                    >
                      {multiple ? "Add More" : "Change"}
                    </Button>
                    {imageList.length > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onImageRemoveAll}
                        leftIcon={<X className="w-4 h-4" />}
                      >
                        Remove All
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
            {errors && (
              <div className="mt-2 space-y-1">
                {errors.maxNumber && (
                  <p className="text-xs text-error">
                    Number of selected images exceed maxNumber
                  </p>
                )}
                {errors.maxFileSize && (
                  <p className="text-xs text-error">
                    Selected file size exceed maxFileSize
                  </p>
                )}
                {errors.acceptType && (
                  <p className="text-xs text-error">
                    Your selected file type is not allowed
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </ImageUploading>
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

