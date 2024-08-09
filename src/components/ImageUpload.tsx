"use client";

import { useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "./ui/use-toast";

interface FileUploadProps {
  multiple?: boolean;
  refresh?: () => void;
  upload: (file: File) => Promise<{
    data: null | unknown;
    error: null | { message: string };
  }>;
  acceptedFiles?: string;
  title: string;
}

export const FileUpload = ({
  upload,
  refresh,
  multiple,
  acceptedFiles = "image/*",
  title,
}: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);

  const uploadFiles = async (...files: File[]) => {
    setUploading(true);
    const res = await Promise.all(files.map(upload));
    const error = res.find((entry) => !!entry?.error?.message);
    if (error) {
      toast({ variant: "destructive", title: error.error?.message });
    } else {
      refresh?.();
    }
    setUploading(false);
  };

  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="file-upload">{title}</Label>
      <Input
        id="file-upload"
        type="file"
        accept={acceptedFiles}
        multiple={multiple}
        onChange={(e) => uploadFiles(...Array.from(e.target.files || []))}
      />
      {uploading && <p>Uploading...</p>}
    </div>
  );
};
