/*
# Create storage bucket for card images

1. Storage
- Create `card-images` bucket (public) for user-uploaded card scans.
2. Security
- Public read access for card image URLs.
- Authenticated users can upload to their own folder path.
- Authenticated users can update/delete their own files.
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('card-images', 'card-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Authenticated users can upload card images" ON storage.objects;
CREATE POLICY "Authenticated users can upload card images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'card-images');

DROP POLICY IF EXISTS "Public can read card images" ON storage.objects;
CREATE POLICY "Public can read card images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'card-images');

DROP POLICY IF EXISTS "Authenticated users can update own card images" ON storage.objects;
CREATE POLICY "Authenticated users can update own card images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'card-images' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Authenticated users can delete own card images" ON storage.objects;
CREATE POLICY "Authenticated users can delete own card images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'card-images' AND auth.uid()::text = (storage.foldername(name))[1]);
