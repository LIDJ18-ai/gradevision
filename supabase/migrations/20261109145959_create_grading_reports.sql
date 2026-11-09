/*
# Create grading_reports table

1. New Tables
- `grading_reports`
  - `id` (uuid, primary key)
  - `user_id` (uuid, not null, defaults to authenticated user, references auth.users)
  - `card_name` (text, name of the Pokémon card)
  - `card_set` (text, optional set/series info)
  - `card_year` (text, optional year)
  - `front_image_url` (text, storage URL for front image)
  - `back_image_url` (text, storage URL for back image)
  - `closeup_image_url` (text, optional close-up image URL)
  - `status` (text, enum: pending, analyzing, complete)
  - `is_demo` (boolean, flags simulated results, default true)
  - `overall_grade` (numeric, 1-10 overall grade)
  - `centering_grade` (numeric, sub-grade for centering)
  - `corners_grade` (numeric, sub-grade for corners)
  - `edges_grade` (numeric, sub-grade for edges)
  - `surface_grade` (numeric, sub-grade for surface)
  - `centering_data` (jsonb, centering measurements: top/bottom/left/right percentages)
  - `corners_data` (jsonb, corner analysis details)
  - `edges_data` (jsonb, edge wear analysis)
  - `surface_data` (jsonb, surface defects analysis)
  - `summary` (text, AI-generated summary)
  - `created_at` (timestamptz, default now())
2. Security
- Enable RLS on `grading_reports`.
- Grant CRUD to `authenticated` only (sign-in required app).
- Owner-scoped CRUD: each authenticated user can only access their own grading reports.
3. Indexes
- Index on `user_id` for dashboard queries.
- Index on `created_at` for sorting history.
*/

CREATE TABLE IF NOT EXISTS grading_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  card_name text NOT NULL,
  card_set text,
  card_year text,
  front_image_url text NOT NULL,
  back_image_url text,
  closeup_image_url text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'analyzing', 'complete')),
  is_demo boolean NOT NULL DEFAULT true,
  overall_grade numeric(4,1),
  centering_grade numeric(4,1),
  corners_grade numeric(4,1),
  edges_grade numeric(4,1),
  surface_grade numeric(4,1),
  centering_data jsonb,
  corners_data jsonb,
  edges_data jsonb,
  surface_data jsonb,
  summary text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE grading_reports ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON grading_reports TO authenticated;

DROP POLICY IF EXISTS "select_own_reports" ON grading_reports;
CREATE POLICY "select_own_reports"
  ON grading_reports FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_reports" ON grading_reports;
CREATE POLICY "insert_own_reports"
  ON grading_reports FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_reports" ON grading_reports;
CREATE POLICY "update_own_reports"
  ON grading_reports FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_reports" ON grading_reports;
CREATE POLICY "delete_own_reports"
  ON grading_reports FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_grading_reports_user_id ON grading_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_grading_reports_created_at ON grading_reports(created_at DESC);
