"use client";
import { toast } from "sonner";
import FileUploadZone from "@/components/apply/fields/FileUploadZone";
import { useUploadMarketplaceImageMutation } from "@/lib/api/marketplaceApi";

function getApiErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "data" in err) {
    const data = (err as { data?: { message?: string | string[] } }).data;
    if (data?.message) return Array.isArray(data.message) ? data.message.join(", ") : data.message;
  }
  return "Upload failed. Please try again.";
}

interface ImageUploadFieldProps {
  label: string;
  hint?: string;
  value: string;
  onChange: (url: string) => void;
}

/** Uploads immediately on file select (via POST /marketplace/uploads/image) and
 *  writes the returned public URL into the form field — no separate "Save" step. */
export function ImageUploadField({ label, hint, value, onChange }: ImageUploadFieldProps) {
  const [uploadImage] = useUploadMarketplaceImageMutation();

  const handleFileSelect = async (file: File | null) => {
    if (!file) return;
    try {
      const { url } = await uploadImage(file).unwrap();
      onChange(url);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <FileUploadZone
      label={label}
      hint={hint}
      accept="image/jpeg,image/png,image/webp"
      maxSizeMB={3}
      variant="photo"
      onFileSelect={handleFileSelect}
      existingFile={value ? { name: label, url: value, mimeType: "image/*" } : null}
      onRemoveExisting={() => onChange("")}
    />
  );
}
