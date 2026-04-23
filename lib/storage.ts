import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const PROJECT_FILES_BUCKET = "project-files";
export const MAX_FILE_SIZE = 50 * 1024 * 1024;
export const ALLOWED_FILE_EXTENSIONS = ["pdf", "jpg", "jpeg", "png", "mp4", "zip", "docx", "xlsx"];

export type StoredFile = {
  path: string;
  url: string;
};

export function getFileExtension(filename: string) {
  return filename.split(".").pop()?.toLowerCase() ?? "";
}

export function isAllowedFile(file: File) {
  return ALLOWED_FILE_EXTENSIONS.includes(getFileExtension(file.name)) && file.size <= MAX_FILE_SIZE;
}

export function buildStoragePath(file: File, freelancerId: string, projectId: string) {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  return `${freelancerId}/${projectId}/${Date.now()}_${safeName}`;
}

export async function uploadFile(file: File, freelancerId: string, projectId: string): Promise<StoredFile> {
  const supabase = createSupabaseAdminClient();
  const path = buildStoragePath(file, freelancerId, projectId);
  const { error } = await supabase.storage.from(PROJECT_FILES_BUCKET).upload(path, file, {
    contentType: file.type || undefined,
    upsert: false
  });

  if (error) {
    throw new Error(error.message);
  }

  return { path, url: path };
}

export async function getSignedUrl(path: string, expiresIn: number) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.storage.from(PROJECT_FILES_BUCKET).createSignedUrl(path, expiresIn);

  if (error || !data?.signedUrl) {
    throw new Error(error?.message ?? "Could not create signed URL");
  }

  return data.signedUrl;
}

export async function deleteFile(path: string) {
  const supabase = createSupabaseAdminClient();
  const { error: storageError } = await supabase.storage.from(PROJECT_FILES_BUCKET).remove([path]);

  if (storageError) {
    throw new Error(storageError.message);
  }

  const { error: dbError } = await supabase.from("files").delete().eq("file_url", path);

  if (dbError) {
    throw new Error(dbError.message);
  }
}
