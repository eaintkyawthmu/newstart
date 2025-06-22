/*
  # Add welcome steps tracking

  1. Changes
    - Add `completed_welcome_steps` array to profiles table to track which welcome steps are completed
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'completed_welcome_steps'
  ) THEN
    ALTER TABLE profiles ADD COLUMN completed_welcome_steps integer[] DEFAULT '{}';
  END IF;
END $$;