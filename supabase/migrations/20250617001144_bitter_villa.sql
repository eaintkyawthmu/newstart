/*
  # Create Milestone and Rewards System

  1. New Tables
    - `user_milestones`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `milestone_id` (text, stores Sanity document ID)
      - `earned_at` (timestamp)
      - `reward_claimed` (boolean)
      - `reward_claimed_at` (timestamp)
    
  2. Security
    - Enable RLS on user_milestones
    - Add policies for users to view and manage their own milestones
    - Add policy for admins to view all milestones
    
  3. Changes
    - Ensure completed_lesson_tasks exists in course_progress
*/

-- Create user_milestones table
CREATE TABLE IF NOT EXISTS user_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  milestone_id text NOT NULL,
  earned_at timestamptz DEFAULT now(),
  reward_claimed boolean DEFAULT false,
  reward_claimed_at timestamptz,
  UNIQUE(user_id, milestone_id)
);

-- Enable RLS
ALTER TABLE user_milestones ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own milestones"
  ON user_milestones
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own milestones"
  ON user_milestones
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own milestones"
  ON user_milestones
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all milestones"
  ON user_milestones
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Ensure completed_lesson_tasks exists in course_progress
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'course_progress' AND column_name = 'completed_lesson_tasks'
  ) THEN
    ALTER TABLE course_progress ADD COLUMN completed_lesson_tasks text[] DEFAULT '{}';
  END IF;
END $$;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_user_milestones_user_id ON user_milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_user_milestones_milestone_id ON user_milestones(milestone_id);