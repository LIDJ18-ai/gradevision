import { supabase } from '@/lib/supabase';

const BUCKET = 'card-images';
const SIGNED_URL_EXPIRY = 3600; // 1 hour

export interface StoredImage {
  path: string;
  url: string;
}

export async function uploadCardImage(
  file: File,
  userId: string,
  slot: 'front' | 'back' | 'closeup'
): Promise<StoredImage> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `${userId}/${slot}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  const url = await getSignedUrl(fileName);
  return { path: fileName, url };
}

export async function getSignedUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_EXPIRY);

  if (error || !data?.signedUrl) {
    throw new Error(`Failed to generate signed URL: ${error?.message ?? 'Unknown error'}`);
  }

  return data.signedUrl;
}

export async function getSignedUrls(paths: (string | null)[]): Promise<(string | null)[]> {
  const validPaths = paths.filter((p): p is string => p !== null);

  if (validPaths.length === 0) {
    return paths;
  }

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrls(validPaths, SIGNED_URL_EXPIRY);

  if (error) {
    throw new Error(`Failed to generate signed URLs: ${error?.message ?? 'Unknown error'}`);
  }

  const urlMap = new Map<string, string>();
  for (const entry of data ?? []) {
    if (entry?.path && entry?.signedUrl) {
      urlMap.set(entry.path, entry.signedUrl);
    }
  }

  return paths.map((p) => (p ? urlMap.get(p) ?? null : null));
}
