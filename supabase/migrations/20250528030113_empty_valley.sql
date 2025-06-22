/*
  # Add course progress tracking

  1. New Tables
    - `course_progress`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `course_id` (integer)
      - `module_id` (integer)
      - `completed` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for users to manage their own progress
*/

CREATE TABLE IF NOT EXISTS course_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  course_id integer NOT NULL,
  module_id integer NOT NULL,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, course_id, module_id)
);

ALTER TABLE course_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own progress"
  ON course_progress
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own progress"
  ON course_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);