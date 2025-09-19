/*
  # Create reflections table for user personal notes and reflections

  1. New Tables
    - `reflections`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `lesson_id` (text, identifier for the lesson)
      - `reflection_text` (text, user's written response)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `reflections` table
    - Add policy for users to manage their own reflections
    - Add policy for users to read their own reflections

  3. Indexes
    - Add index on user_id for faster queries
    - Add index on lesson_id for lesson-based queries
    - Add composite index on user_id and lesson_id for unique constraints
*/

CREATE TABLE IF NOT EXISTS reflections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id text NOT NULL,
  reflection_text text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Enable Row Level Security
ALTER TABLE reflections ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can insert their own reflections"
  ON reflections
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own reflections"
  ON reflections
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own reflections"
  ON reflections
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reflections"
  ON reflections
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reflections_user_id ON reflections(user_id);
CREATE INDEX IF NOT EXISTS idx_reflections_lesson_id ON reflections(lesson_id);
CREATE INDEX IF NOT EXISTS idx_reflections_created_at ON reflections(created_at);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_reflections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reflections_updated_at
  BEFORE UPDATE ON reflections
  FOR EACH ROW
  EXECUTE FUNCTION update_reflections_updated_at();