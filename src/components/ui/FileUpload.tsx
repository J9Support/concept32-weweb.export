"use client";

import { useCallback, useRef, useState, DragEvent } from "react";
import { Upload, Loader2 } from "lucide-react";

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>;
  accept?: string;
  label?: string;
  isLoading?: boolean;
}

export function FileUpload({
  onUpload,
  accept,
  label = "Upload a file",
  isLoading = false,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      setFileName(file.name);
      await onUpload(file);
    },
    [onUpload]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  return (
    <div
      onClick={() => !isLoading && inputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`
        flex flex-col items-center justify-center gap-3 p-8
        border-2 border-dashed rounded-lg cursor-pointer
        transition-colors duration-200
        ${
          isDragging
            ? "border-[#2E75B6] bg-blue-50"
            : "border-gray-300 hover:border-gray-400 bg-white"
        }
        ${isLoading ? "pointer-events-none opacity-60" : ""}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />

      {isLoading ? (
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#2E75B6" }} />
      ) : (
        <Upload className="w-8 h-8 text-gray-400" />
      )}

      <div className="text-center">
        <p className="text-sm font-medium" style={{ color: "#1A1A2E" }}>
          {isLoading ? "Uploading..." : label}
        </p>
        {fileName && !isLoading && (
          <p className="text-xs mt-1" style={{ color: "#6B7280" }}>
            {fileName}
          </p>
        )}
        {!fileName && !isLoading && (
          <p className="text-xs mt-1" style={{ color: "#6B7280" }}>
            Drag & drop or click to select
          </p>
        )}
      </div>
    </div>
  );
}
