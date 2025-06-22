/*
  # Add onboarding tasks tracking to profiles

  1. New Columns
    - `onboarding_tasks` - JSONB array to track completion of key tasks
    - `next_task` - Text field to store the next recommended task
    - `last_login` - Timestamp to track user engagement

  2. Changes
    - Update profiles table with new columns for task tracking
*/

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS onboarding_tasks JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS next_task text,
ADD COLUMN IF NOT EXISTS last_login timestamptz DEFAULT now();

-- Update RLS policies to allow users to update their task progress
CREATE POLICY "Users can update their own task progress"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);