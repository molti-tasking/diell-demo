"use server";
import { createServerClient } from "./ServerClient";

type Bucket = "product-images" | "organization-images";

export const uploadFile = async (
  bucket: Bucket,
  file: File,
  filePath: string
) => {
  const supabase = createServerClient();

  const hasBucket = await supabase.storage.getBucket(bucket);
  if (!hasBucket.data) {
    await supabase.storage.createBucket(bucket);
  }
  const { error: uploadError, data: uploadData } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);

  if (uploadError || !uploadData?.path) {
    return { data: null, error: uploadError };
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(uploadData?.path);

  return { path: filePath, publicUrl: data.publicUrl };
};

export const removeFile = async (bucket: Bucket, ...paths: string[]) => {
  const supabase = createServerClient();
  return await supabase.storage.from(bucket).remove(paths);
};
