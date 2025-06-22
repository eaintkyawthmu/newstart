/*
  # Add Journey Progress Tracking

  1. New Tables
    - `journey_progress`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `step_id` (integer)
      - `status` (text: 'pending', 'in-progress', 'completed')
      - `completed_tasks` (text array)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on journey_progress table
    - Add policies for authenticated users to manage their own progress
*/

CREATE TABLE IF NOT EXISTS journey_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  step_id integer NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  completed_tasks text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_user_step UNIQUE (user_id, step_id),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'in-progress', 'completed'))
);

ALTER TABLE journey_progress ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own progress
CREATE POLICY "Users can read own journey progress"
  ON journey_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to insert their own progress
CREATE POLICY "Users can insert own journey progress"
  ON journey_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own progress
CREATE POLICY "Users can update own journey progress"
  ON journey_progress
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);