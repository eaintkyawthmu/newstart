/*
  # Add life goals column to profiles table

  1. Changes
    - Add `life_goals` column to `profiles` table to store user's life goals as a text array
    - Add `other_goal` column to store any custom goal text
    - Add `zip_code` column that was also missing from the schema

  2. Security
    - No changes to RLS policies needed as the existing policies cover the new columns
*/

DO $$ 
BEGIN
  -- Add life_goals column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'life_goals'
  ) THEN
    ALTER TABLE profiles ADD COLUMN life_goals text[] DEFAULT '{}';
  END IF;

  -- Add other_goal column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'other_goal'
  ) THEN
    ALTER TABLE profiles ADD COLUMN other_goal text;
  END IF;

  -- Add zip_code column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'zip_code'
  ) THEN
    ALTER TABLE profiles ADD COLUMN zip_code text;
  END IF;
END $$;