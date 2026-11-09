/*
# Secure card-images storage bucket

## Summary
Makes the card-images bucket private, enforces server-side file size and MIME type
restrictions, and replaces all storage policies with strict ownership-scoped policies.

## Changes
1. Bucket settings:
   - Set `public` to `false` — files are no longer accessible via public URL.
   - Set `file_size_limit` to 10485760 bytes (10 MB).
   - Set `allowed_mime_types` to image formats only (jpeg, png, webp, gif).
2. Storage policies (storage.objects, bucket_id = 'card-images'):
   - Drop all 4 existing policies.
   - SELECT: authenticated users can only read files in their own folder.
   - INSERT: authenticated users can only upload to their own folder.
   - UPDATE: authenticated users can only modify files in their own folder.
   - DELETE: authenticated users can only delete files in their own folder.
   All policies enforce ownership via `auth.uid()::text = (storage.foldername(name))[1]`.
3. Security:
   - No public/anon access — the bucket is fully private.
   - Cross-user access is blocked at the policy level.
   - Server-side MIME type and file size limits complement client-side validation.

## Backup considerations
- The grading_reports table has 0 rows and the bucket has no existing files.
- No data migration is needed — no data loss risk.
- Existing public URLs (if any were stored in grading_reports.front_image_url etc.)
  would stop working after making the bucket private, but since there are 0 rows,
  there is no data loss risk.
- This migration is idempotent: uses UPDATE (not DROP+CREATE) for the bucket and
  drop-first pattern for policies.
*/

-- 1. Update bucket to private with size and MIME restrictions
UPDATE storage.buckets
SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = '{"image/jpeg", "image/png", "image/webp", "image/gif"}'
WHERE id = 'card-images';

-- 2. Drop all existing card-images policies
DROP POLICY IF EXISTS "Authenticated users can upload card images" ON storage.objects;
DROP POLICY IF EXISTS "Public can read card images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update own card images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete own card images" ON storage.objects;

-- 3. Create strict ownership-scoped policies
-- SELECT: users can only read files in their own folder
CREATE POLICY "Users can read own card images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'card-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- INSERT: users can only upload to their own folder
CREATE POLICY "Users can upload own card images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'card-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- UPDATE: users can only modify files in their own folder
CREATE POLICY "Users can update own card images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'card-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'card-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- DELETE: users can only delete files in their own folder
CREATE POLICY "Users can delete own card images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'card-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
