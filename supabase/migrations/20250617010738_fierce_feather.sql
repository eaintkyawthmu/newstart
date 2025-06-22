/*
  # Create user_milestones table for tracking achievement milestones

  1. New Table
    - `user_milestones`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `milestone_id` (text)
      - `earned_at` (timestamptz)
      - `reward_claimed` (boolean)
      - `reward_claimed_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for users to manage their own milestones
    - Add admin view policy
*/

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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_milestones_user_id ON user_milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_user_milestones_milestone_id ON user_milestones(milestone_id);

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own milestones" ON user_milestones;
DROP POLICY IF EXISTS "Users can insert their own milestones" ON user_milestones;
DROP POLICY IF EXISTS "Users can update their own milestones" ON user_milestones;
DROP POLICY IF EXISTS "Admins can view all milestones" ON user_milestones;

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